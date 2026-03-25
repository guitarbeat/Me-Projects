-- Clean up sample/test journal entries
DELETE FROM public.ink_retrospectives 
WHERE title LIKE '%Sample%' 
   OR title LIKE '%Daily Reflection - 8/2/2025%'
   OR user_id IN ('35dfeb26-12be-47f2-ae7e-897efefbbace', '9c0440ca-d1e4-44c8-abbf-8e25b87bee91');

-- Also clean up any associated daily entries for those users
DELETE FROM public.ink_daily 
WHERE user_id IN ('35dfeb26-12be-47f2-ae7e-897efefbbace', '9c0440ca-d1e4-44c8-abbf-8e25b87bee91');