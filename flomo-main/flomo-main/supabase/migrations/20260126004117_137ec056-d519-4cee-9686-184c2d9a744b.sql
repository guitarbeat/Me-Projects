-- Add is_private and pin_hash columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS pin_hash text DEFAULT NULL;

-- Update the public_profiles view to filter out private users
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS 
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  created_at
FROM public.profiles
WHERE is_private = false
  AND username IS NOT NULL 
  AND username NOT ILIKE 'anonymous_%';

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.public_profiles IS 'Public-facing profile data that excludes private users and sensitive fields like email';