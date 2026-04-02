-- Allow guest user access to financial data for anonymous usage
-- This enables the app to work without authentication
-- Guest user ID: 00000000-0000-0000-0000-000000000000

-- Update RLS policies for fin_charts to allow guest user
CREATE POLICY "Guest user can access charts" ON public.fin_charts
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Update RLS policies for fin_transactions to allow guest user  
CREATE POLICY "Guest user can access transactions" ON public.fin_transactions
FOR ALL  
USING (user_id = '00000000-0000-0000-0000-000000000000')
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');