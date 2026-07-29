-- Delete all flo_shares first (foreign key constraint)
DELETE FROM public.flo_shares;

-- Delete all flo_entries for non-admin users
DELETE FROM public.flo_entries 
WHERE user_id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- Delete user_roles for non-admin users
DELETE FROM public.user_roles 
WHERE role != 'admin';

-- Delete all profiles except admin users
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);