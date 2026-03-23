-- Delete all profiles except the admin user (aaron)
DELETE FROM public.profiles 
WHERE id != '66e142a8-75db-45e0-baeb-304446c5fcb3';

-- Clean up any orphaned user_roles 
DELETE FROM public.user_roles 
WHERE user_id != '66e142a8-75db-45e0-baeb-304446c5fcb3';