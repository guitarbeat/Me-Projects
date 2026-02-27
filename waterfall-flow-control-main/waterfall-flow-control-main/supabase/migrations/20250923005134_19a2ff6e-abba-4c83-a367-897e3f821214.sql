-- Add user_id to financial tables for proper data isolation
ALTER TABLE public.fin_charts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.fin_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing financial data to associate with first user (temporary fix)
UPDATE public.fin_charts SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.fin_transactions SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after data migration
ALTER TABLE public.fin_charts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.fin_transactions ALTER COLUMN user_id SET NOT NULL;

-- Update financial data RLS policies to be user-specific
DROP POLICY IF EXISTS "Authenticated users can view charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Authenticated users can create charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Authenticated users can update charts" ON public.fin_charts;
DROP POLICY IF EXISTS "Authenticated users can delete charts" ON public.fin_charts;

CREATE POLICY "Users can view own charts" ON public.fin_charts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own charts" ON public.fin_charts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts" ON public.fin_charts
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts" ON public.fin_charts
FOR DELETE USING (auth.uid() = user_id);

-- Update transaction RLS policies to be user-specific
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.fin_transactions;  
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.fin_transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.fin_transactions;

CREATE POLICY "Users can view own transactions" ON public.fin_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.fin_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.fin_transactions  
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.fin_transactions
FOR DELETE USING (auth.uid() = user_id);