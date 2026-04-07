-- Create function for users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data in order (respecting foreign key constraints)
  
  -- Delete financial data
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.charts WHERE user_id = current_user_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Delete auth user (this will cascade to any remaining references)
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RETURN TRUE;
END;
$$;