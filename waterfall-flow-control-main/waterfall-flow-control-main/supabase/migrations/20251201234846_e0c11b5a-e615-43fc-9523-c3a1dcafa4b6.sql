-- Create charts table for organizing transactions
CREATE TABLE IF NOT EXISTS public.charts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for financial tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  inflow NUMERIC NOT NULL DEFAULT 0,
  outflow NUMERIC NOT NULL DEFAULT 0,
  person TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  fin_chart_id UUID REFERENCES public.charts(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on charts table
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for charts table
CREATE POLICY "Users can view their own charts"
  ON public.charts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own charts"
  ON public.charts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own charts"
  ON public.charts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own charts"
  ON public.charts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on transactions
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_fin_chart_id ON public.transactions(fin_chart_id);
CREATE INDEX idx_charts_user_id ON public.charts(user_id);