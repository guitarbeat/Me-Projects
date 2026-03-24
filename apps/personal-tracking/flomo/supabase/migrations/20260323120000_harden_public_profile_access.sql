-- Lock down direct profile reads and route anonymous discovery through a
-- limited public view instead.

-- Remove overly broad legacy read policies.
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users use public_profiles view" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view shared profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Authenticated users can always read their own profile.
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can read profiles that participate in a share with them.
CREATE POLICY "Users can view shared profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.flo_shares
      WHERE (flo_shares.owner_id = public.profiles.id AND flo_shares.shared_with_id = auth.uid())
         OR (flo_shares.shared_with_id = public.profiles.id AND flo_shares.owner_id = auth.uid())
    )
  );

-- Admins retain full profile visibility for moderation and support flows.
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Anonymous discovery should go through a limited projection only.
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
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

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS
  'Public-facing profiles for discovery and login hints. Exposes only non-sensitive columns for non-private users.';
