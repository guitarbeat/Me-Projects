-- Merge all Aaron users into a single canonical Aaron user
-- This consolidates fin_charts and fin_transactions data

DO $$
DECLARE
  canonical_aaron_id uuid;
  duplicate_user RECORD;
BEGIN
  -- Find the canonical Aaron user (the one with the most data or earliest created)
  SELECT id INTO canonical_aaron_id
  FROM public.profiles
  WHERE lower(username) = 'aaron' OR lower(display_name) = 'aaron' OR lower(first_name) = 'aaron'
  ORDER BY created_at ASC
  LIMIT 1;

  -- If no Aaron user found, exit
  IF canonical_aaron_id IS NULL THEN
    RAISE NOTICE 'No Aaron user found to merge';
    RETURN;
  END IF;

  RAISE NOTICE 'Canonical Aaron user ID: %', canonical_aaron_id;

  -- Merge all fin_charts from other Aaron users
  UPDATE public.fin_charts
  SET user_id = canonical_aaron_id
  WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE (lower(username) = 'aaron' OR lower(display_name) = 'aaron' OR lower(first_name) = 'aaron')
    AND id != canonical_aaron_id
  );

  -- Merge all fin_transactions from other Aaron users
  UPDATE public.fin_transactions
  SET user_id = canonical_aaron_id
  WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE (lower(username) = 'aaron' OR lower(display_name) = 'aaron' OR lower(first_name) = 'aaron')
    AND id != canonical_aaron_id
  );

  -- Delete duplicate Aaron profiles (keeping only the canonical one)
  FOR duplicate_user IN 
    SELECT id FROM public.profiles 
    WHERE (lower(username) = 'aaron' OR lower(display_name) = 'aaron' OR lower(first_name) = 'aaron')
    AND id != canonical_aaron_id
  LOOP
    RAISE NOTICE 'Deleting duplicate Aaron user: %', duplicate_user.id;
    
    -- Delete from user_roles first (foreign key constraint)
    DELETE FROM public.user_roles WHERE user_id = duplicate_user.id;
    
    -- Delete profile
    DELETE FROM public.profiles WHERE id = duplicate_user.id;
    
    -- Delete from auth.users (if exists)
    DELETE FROM auth.users WHERE id = duplicate_user.id;
  END LOOP;

  RAISE NOTICE 'Aaron user merge completed. Canonical user: %', canonical_aaron_id;
END $$;