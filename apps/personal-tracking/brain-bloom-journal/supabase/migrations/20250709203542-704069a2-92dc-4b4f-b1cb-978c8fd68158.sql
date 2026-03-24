-- Update password in the correct table (user_credentials)
UPDATE user_credentials 
SET password_hash = simple_hash('1234asdf')
WHERE username = 'aaron';

-- Fix linting issues by setting search_path on functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.simple_hash(password text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Simple hash using MD5 (not secure, but fine for low-security site)
  RETURN md5(password || 'flo_salt');
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_user_credentials(p_username text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT user_id INTO user_uuid
  FROM public.user_credentials
  WHERE username = lower(p_username)
    AND password_hash = simple_hash(p_password);
  
  RETURN user_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_existing_usernames()
RETURNS TABLE(username text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT DISTINCT user_credentials.username
  FROM public.user_credentials
  ORDER BY user_credentials.username
  LIMIT 10;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;