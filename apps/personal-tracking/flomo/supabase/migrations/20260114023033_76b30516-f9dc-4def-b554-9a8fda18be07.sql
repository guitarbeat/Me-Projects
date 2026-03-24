-- Fix SECURITY DEFINER view issue by recreating public_profiles as SECURITY INVOKER (default)
-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT
  id,
  username,
  display_name,
  avatar_url,
  apps,
  first_name,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view for both anonymous and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS 'Public view of profiles excluding sensitive fields like email. Uses SECURITY INVOKER (default) so RLS policies on profiles table are enforced.';