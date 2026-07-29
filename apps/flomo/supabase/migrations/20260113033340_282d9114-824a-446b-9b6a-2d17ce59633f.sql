-- Fix: PUBLIC_DATA_EXPOSURE - Email addresses publicly accessible
-- Create a public view that excludes sensitive fields (email)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Update the RLS policy to restrict full profile access to authenticated users only
DROP POLICY IF EXISTS "Public can view basic profile info for login" ON public.profiles;

-- Authenticated users can view all profiles (needed for sharing features)
CREATE POLICY "Authenticated users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Anonymous users cannot directly access profiles table
-- They should use the public_profiles view instead
CREATE POLICY "Anonymous users use public_profiles view" 
  ON public.profiles 
  FOR SELECT 
  TO anon
  USING (false);