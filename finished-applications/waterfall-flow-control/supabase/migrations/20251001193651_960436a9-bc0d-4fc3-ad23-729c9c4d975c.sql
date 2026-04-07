-- Drop and recreate guest user policies with correct UUID
-- Guest user ID: 00000000-0000-0000-0000-000000000000

-- Drop existing policies
DROP POLICY IF EXISTS "Guest user can access charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Guest user can access transactions" ON public.fin_transactions;

-- Create policies with correct UUID for guest user
CREATE POLICY "Guest user can access charts" ON public.fin_charts
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Guest user can access transactions" ON public.fin_transactions
FOR ALL  
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);