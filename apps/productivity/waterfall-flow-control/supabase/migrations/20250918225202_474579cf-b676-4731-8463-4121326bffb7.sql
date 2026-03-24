-- Security Fix: Restrict financial data access to authenticated users only

-- Drop existing policies that allow public access
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Anyone can create transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Anyone can delete transactions" ON public.fin_transactions;

DROP POLICY IF EXISTS "Anyone can view charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Anyone can create charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Anyone can update charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Anyone can delete charts" ON public.fin_charts;

-- Create secure policies that require authentication for fin_transactions
CREATE POLICY "Authenticated users can view transactions" 
ON public.fin_transactions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create transactions" 
ON public.fin_transactions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions" 
ON public.fin_transactions 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete transactions" 
ON public.fin_transactions 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure policies that require authentication for fin_charts
CREATE POLICY "Authenticated users can view charts" 
ON public.fin_charts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create charts" 
ON public.fin_charts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update charts" 
ON public.fin_charts 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete charts" 
ON public.fin_charts 
FOR DELETE 
TO authenticated
USING (true);