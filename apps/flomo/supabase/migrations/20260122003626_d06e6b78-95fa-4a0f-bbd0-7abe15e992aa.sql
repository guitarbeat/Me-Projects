-- First add the is_private column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_private boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Comment on column
COMMENT ON COLUMN public.profiles.is_private IS 'When true, user profile is hidden from public views and sharing features';

-- Drop and recreate public_profiles view with privacy filter
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT id, username, display_name, avatar_url, first_name, apps, created_at, updated_at
FROM public.profiles
WHERE is_private = false;