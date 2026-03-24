-- Update guest user policies to use Aaron's user ID
-- This allows anonymous access to Aaron's financial data

-- Drop old guest user policies
DROP POLICY IF EXISTS "Guest user can access charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Guest user can access transactions" ON public.fin_transactions;

-- Create new policies with Aaron's user ID
CREATE POLICY "Guest user can access charts" ON public.fin_charts
FOR ALL
USING (user_id = '677aa256-c59e-41c7-8b1e-ae352a95f28e'::uuid);

CREATE POLICY "Guest user can access transactions" ON public.fin_transactions
FOR ALL  
USING (user_id = '677aa256-c59e-41c7-8b1e-ae352a95f28e'::uuid)
WITH CHECK (user_id = '677aa256-c59e-41c7-8b1e-ae352a95f28e'::uuid);