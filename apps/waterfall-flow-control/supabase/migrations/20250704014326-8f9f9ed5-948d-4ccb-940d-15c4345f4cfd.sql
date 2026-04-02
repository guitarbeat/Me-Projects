-- Remove authentication requirements and make data publicly accessible
-- Update charts table policies
DROP POLICY IF EXISTS "Users can view all charts" ON public.charts;
DROP POLICY IF EXISTS "Users can create charts" ON public.charts;
DROP POLICY IF EXISTS "Users can update charts" ON public.charts;
DROP POLICY IF EXISTS "Users can delete charts" ON public.charts;

CREATE POLICY "Anyone can view charts" ON public.charts
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create charts" ON public.charts
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update charts" ON public.charts
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete charts" ON public.charts
  FOR DELETE 
  USING (true);

-- Update transactions table policies
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions" ON public.transactions;

CREATE POLICY "Anyone can view transactions" ON public.transactions
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create transactions" ON public.transactions
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update transactions" ON public.transactions
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete transactions" ON public.transactions
  FOR DELETE 
  USING (true);