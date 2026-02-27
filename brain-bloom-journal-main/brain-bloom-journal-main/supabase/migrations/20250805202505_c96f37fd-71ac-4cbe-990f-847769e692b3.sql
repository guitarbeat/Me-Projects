-- Fix database function security warnings by adding SET search_path = 'public' to functions that don't have it

-- Fix get_user_profile_by_id function
CREATE OR REPLACE FUNCTION public.get_user_profile_by_id(user_id uuid)
 RETURNS TABLE(id uuid, email text, first_name text, display_name text, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT 
    id,
    email,
    first_name,
    display_name,
    username,
    avatar_url,
    created_at
  FROM public.profiles
  WHERE id = user_id;
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix cleanup_orphaned_auth_users function
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_users()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  auth_user RECORD;
BEGIN
  -- Find auth users that don't have any associated data
  FOR auth_user IN 
    SELECT au.id 
    FROM auth.users au
    LEFT JOIN public.user_credentials uc ON au.id = uc.user_id
    LEFT JOIN public.profiles p ON au.id = p.id
    LEFT JOIN public.flo_entries fe ON au.id = fe.user_id
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    WHERE uc.user_id IS NULL 
      AND p.id IS NULL 
      AND fe.user_id IS NULL 
      AND ur.user_id IS NULL
  LOOP
    -- Delete the orphaned auth user
    DELETE FROM auth.users WHERE id = auth_user.id;
  END LOOP;
END;
$function$;

-- Fix get_existing_usernames function
CREATE OR REPLACE FUNCTION public.get_existing_usernames()
 RETURNS TABLE(username text, display_name text, avatar_url text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT DISTINCT 
    p.username,
    COALESCE(p.display_name, p.username) as display_name,
    p.avatar_url
  FROM public.profiles p
  WHERE p.username IS NOT NULL
  ORDER BY p.username
  LIMIT 10;
$function$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$function$;

-- Fix get_all_users_with_roles function
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, display_name text, username text, avatar_url text, role app_role, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check if current user is admin using the new function
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.display_name,
    p.username,
    p.avatar_url,
    COALESCE(ur.role, 'user'::app_role) as role,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$function$;

-- Fix change_user_role function
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id uuid, new_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check if current user is admin using the new function
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  
  -- Check if trying to change own role
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;
  
  -- Update or insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If the role is different, remove the old role
  IF new_role = 'admin' THEN
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'user';
  ELSE
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin';
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Fix merge_user_accounts function
CREATE OR REPLACE FUNCTION public.merge_user_accounts(p_username text, p_new_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  old_user RECORD;
  normalized_username text;
BEGIN
  -- Normalize username to lowercase for consistency
  normalized_username := lower(p_username);
  
  -- For each user with this username except the new one
  FOR old_user IN 
    SELECT id 
    FROM public.profiles 
    WHERE lower(username) = normalized_username 
    AND id IS NOT NULL 
    AND id <> p_new_user_id
  LOOP
    -- Update period/flow data
    UPDATE public.flo_entries SET user_id = p_new_user_id WHERE user_id = old_user.id;
    
    -- Move or merge profile
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_new_user_id) THEN
      UPDATE public.profiles SET id = p_new_user_id WHERE id = old_user.id;
    ELSE
      -- Merge fields: if the new user's profile is missing data, use the old one
      UPDATE public.profiles AS new
      SET
        avatar_url = COALESCE(new.avatar_url, old.avatar_url),
        display_name = COALESCE(new.display_name, old.display_name),
        first_name = COALESCE(new.first_name, old.first_name)
      FROM public.profiles AS old
      WHERE new.id = p_new_user_id AND old.id = old_user.id;
      DELETE FROM public.profiles WHERE id = old_user.id;
    END IF;
    
    -- Handle user_roles: delete any roles for the old user that already exist for the new user
    DELETE FROM public.user_roles ur_old
      USING public.user_roles ur_new
      WHERE ur_old.user_id = old_user.id
        AND ur_new.user_id = p_new_user_id
        AND ur_old.role = ur_new.role;
    -- Now update any remaining user_roles
    UPDATE public.user_roles SET user_id = p_new_user_id WHERE user_id = old_user.id;
  END LOOP;
  
  -- Ensure user roles are properly set with case-insensitive username check
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    p_new_user_id,
    CASE WHEN normalized_username = 'aaron' THEN 'admin'::app_role ELSE 'user'::app_role END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Clean up conflicting roles (if user was promoted to admin, remove user role)
  IF normalized_username = 'aaron' THEN
    DELETE FROM public.user_roles WHERE user_id = p_new_user_id AND role = 'user';
  END IF;
END;
$function$;

-- Fix check_current_user_admin function
CREATE OR REPLACE FUNCTION public.check_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.role = 'admin'
    AND (
      ur.user_id = auth.uid()
      OR 
      ur.user_id = (
        SELECT 
          CASE 
            WHEN ((users.raw_user_meta_data ->> 'original_user_id'::text) IS NOT NULL) 
            THEN ((users.raw_user_meta_data ->> 'original_user_id'::text))::uuid
            ELSE NULL
          END
        FROM auth.users
        WHERE users.id = auth.uid()
      )
    )
  );
$function$;

-- Fix is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id_to_check uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_id_to_check
    AND role = 'admin'
  );
$function$;

-- Fix delete_user_complete function
CREATE OR REPLACE FUNCTION public.delete_user_complete(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check if current user is admin using the new function
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Check if trying to delete self
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  -- Delete user data in order (respecting foreign key constraints)
  -- Delete period entries
  DELETE FROM public.flo_entries WHERE user_id = target_user_id;
  
  -- Delete user credentials
  DELETE FROM public.user_credentials WHERE user_id = target_user_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete auth user (this will cascade to any remaining references)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$function$;