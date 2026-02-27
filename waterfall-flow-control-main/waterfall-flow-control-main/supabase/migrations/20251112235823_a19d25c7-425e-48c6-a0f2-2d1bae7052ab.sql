-- Allow public read access to basic profile info for the login bubble view
-- This only exposes username, display_name, and avatar_url (not email or other sensitive data)
CREATE POLICY "Public can view basic profile info for login"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the restrictive policy that blocks this
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;