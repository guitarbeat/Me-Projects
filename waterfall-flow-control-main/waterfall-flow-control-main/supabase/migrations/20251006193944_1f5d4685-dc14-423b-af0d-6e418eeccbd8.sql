-- Phase 1: Remove guest user access policies
DROP POLICY IF EXISTS "Guest user can access charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Guest user can access transactions" ON public.fin_transactions;

-- Phase 2: Fix database functions missing search_path
-- Update increment_selection function
CREATE OR REPLACE FUNCTION public.increment_selection(p_user_name text, p_name_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO cat_name_ratings (user_name, name_id, wins)
  VALUES (p_user_name, p_name_id, 1)
  ON CONFLICT (user_name, name_id)
  DO UPDATE SET wins = cat_name_ratings.wins + 1;
END;
$function$;

-- Update validate_environment_setup function
CREATE OR REPLACE FUNCTION public.validate_environment_setup()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN true;
END;
$function$;

-- Phase 3: Tighten cat_name_options policies
DROP POLICY IF EXISTS "Admin insert cat_name_options" ON public.cat_name_options;
DROP POLICY IF EXISTS "Admin update cat_name_options" ON public.cat_name_options;

-- Restrict writes to admin users only
CREATE POLICY "Admin insert cat_name_options" 
ON public.cat_name_options
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update cat_name_options" 
ON public.cat_name_options
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));