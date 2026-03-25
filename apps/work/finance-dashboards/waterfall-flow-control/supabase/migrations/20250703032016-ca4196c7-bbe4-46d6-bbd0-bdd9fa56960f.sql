
-- Enable RLS on charts and transactions tables for security
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for charts table
CREATE POLICY "Users can view all charts" ON public.charts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create charts" ON public.charts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update charts" ON public.charts
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Users can delete charts" ON public.charts
  FOR DELETE TO authenticated
  USING (true);

-- Create policies for transactions table
CREATE POLICY "Users can view all transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update transactions" ON public.transactions
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Users can delete transactions" ON public.transactions
  FOR DELETE TO authenticated
  USING (true);
