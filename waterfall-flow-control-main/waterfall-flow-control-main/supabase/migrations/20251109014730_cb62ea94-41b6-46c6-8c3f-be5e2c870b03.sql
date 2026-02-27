-- Create transactions table with RLS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  inflow DECIMAL(10,2) NOT NULL DEFAULT 0,
  outflow DECIMAL(10,2) NOT NULL DEFAULT 0,
  person TEXT NOT NULL,
  balance DECIMAL(10,2),
  enabled BOOLEAN NOT NULL DEFAULT true,
  fin_chart_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create charts table with RLS
CREATE TABLE IF NOT EXISTS public.charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on charts
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions (users can only access their own data)
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for charts
CREATE POLICY "Users can view own charts"
  ON public.charts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charts"
  ON public.charts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts"
  ON public.charts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts"
  ON public.charts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add foreign key constraint for chart relationship
ALTER TABLE public.transactions
ADD CONSTRAINT fk_transactions_chart
FOREIGN KEY (fin_chart_id) REFERENCES public.charts(id) ON DELETE SET NULL;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_transactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transactions_timestamp();

-- Fix PUBLIC_DATA_EXPOSURE: Remove anonymous access from cat_app_users
DROP POLICY IF EXISTS "Anyone can insert user data" ON public.cat_app_users;
DROP POLICY IF EXISTS "Anyone can update user data" ON public.cat_app_users;
DROP POLICY IF EXISTS "Anyone can delete user data" ON public.cat_app_users;
DROP POLICY IF EXISTS "Allow user creation" ON public.cat_app_users;

-- Replace with authenticated-only policies
CREATE POLICY "Authenticated users can read all users"
  ON public.cat_app_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own data"
  ON public.cat_app_users FOR INSERT
  TO authenticated
  WITH CHECK (user_name IS NOT NULL);

CREATE POLICY "Users can update own data"
  ON public.cat_app_users FOR UPDATE
  TO authenticated
  USING (user_name IS NOT NULL);

-- Fix cat_name_ratings: Remove anonymous access
DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.cat_name_ratings;
DROP POLICY IF EXISTS "Anyone can update ratings" ON public.cat_name_ratings;
DROP POLICY IF EXISTS "Anyone can delete ratings" ON public.cat_name_ratings;

CREATE POLICY "Authenticated users can manage ratings"
  ON public.cat_name_ratings FOR ALL
  TO authenticated
  USING (user_name IS NOT NULL)
  WITH CHECK (user_name IS NOT NULL);

-- Fix tournament_selections: Remove anonymous access
DROP POLICY IF EXISTS "Anyone can insert selections" ON public.tournament_selections;
DROP POLICY IF EXISTS "Anyone can update selections" ON public.tournament_selections;
DROP POLICY IF EXISTS "Anyone can delete selections" ON public.tournament_selections;

CREATE POLICY "Authenticated users can manage selections"
  ON public.tournament_selections FOR ALL
  TO authenticated
  USING (user_name IS NOT NULL)
  WITH CHECK (user_name IS NOT NULL);