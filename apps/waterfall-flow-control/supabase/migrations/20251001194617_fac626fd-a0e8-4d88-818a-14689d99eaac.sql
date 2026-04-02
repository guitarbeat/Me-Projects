-- Reassign orphaned financial data to Aaron
-- Aaron's current user ID: 677aa256-c59e-41c7-8b1e-ae352a95f28e

-- Reassign all orphaned fin_transactions to Aaron
UPDATE public.fin_transactions
SET user_id = '677aa256-c59e-41c7-8b1e-ae352a95f28e'
WHERE user_id NOT IN (SELECT id FROM public.profiles)
  OR user_id = '9c0440ca-d1e4-44c8-abbf-8e25b87bee91';

-- Reassign all orphaned fin_charts to Aaron
UPDATE public.fin_charts
SET user_id = '677aa256-c59e-41c7-8b1e-ae352a95f28e'
WHERE user_id NOT IN (SELECT id FROM public.profiles)
  OR user_id = '9c0440ca-d1e4-44c8-abbf-8e25b87bee91';