-- Fix dangerous anonymous profile access policies
DROP POLICY IF EXISTS "Allow anonymous username lookup for signin" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated and admin profile access" ON public.profiles;

-- Add proper authentication requirements to policies
ALTER TABLE public.fin_charts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Users can create own charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Users can update own charts" ON public.fin_charts;  
DROP POLICY IF EXISTS "Users can delete own charts" ON public.fin_charts;

ALTER TABLE public.fin_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own charts" ON public.fin_charts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own charts" ON public.fin_charts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts" ON public.fin_charts
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts" ON public.fin_charts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix transaction policies
ALTER TABLE public.fin_transactions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.fin_transactions;

ALTER TABLE public.fin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.fin_transactions  
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.fin_transactions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.fin_transactions
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.fin_transactions
FOR DELETE TO authenticated USING (auth.uid() = user_id);