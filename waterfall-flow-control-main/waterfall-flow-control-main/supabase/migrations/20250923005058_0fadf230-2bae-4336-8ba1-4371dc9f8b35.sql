-- Phase 1: Critical Security Fixes

-- 1. Add user_id to financial tables for proper data isolation
ALTER TABLE public.fin_charts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.fin_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Update existing data to associate with users (if any authenticated users exist)
-- This is a placeholder - in production you'd need to handle this based on your data
UPDATE public.fin_charts SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.fin_transactions SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- 3. Make user_id NOT NULL after data migration
ALTER TABLE public.fin_charts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.fin_transactions ALTER COLUMN user_id SET NOT NULL;

-- 4. Drop dangerous anonymous profile access policies
DROP POLICY IF EXISTS "Allow anonymous username lookup for signin" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated and admin profile access" ON public.profiles;

-- 5. Create secure profile access policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Update financial data RLS policies to be user-specific
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

-- 7. Update transaction RLS policies to be user-specific
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

-- 8. Secure database functions by adding proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;