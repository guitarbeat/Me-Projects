-- Fix critical security issue: Replace overly permissive RLS policies with user-specific access control

-- Drop existing policies for ink_retrospectives
DROP POLICY IF EXISTS "Anyone can create retrospectives" ON public.ink_retrospectives;
DROP POLICY IF EXISTS "Anyone can delete retrospectives" ON public.ink_retrospectives;
DROP POLICY IF EXISTS "Anyone can update retrospectives" ON public.ink_retrospectives;
DROP POLICY IF EXISTS "Anyone can view retrospectives" ON public.ink_retrospectives;

-- Drop existing policies for ink_daily
DROP POLICY IF EXISTS "Anyone can create daily entries" ON public.ink_daily;
DROP POLICY IF EXISTS "Anyone can delete daily entries" ON public.ink_daily;
DROP POLICY IF EXISTS "Anyone can update daily entries" ON public.ink_daily;
DROP POLICY IF EXISTS "Anyone can view daily entries" ON public.ink_daily;

-- Create secure RLS policies for ink_retrospectives (users can only access their own data)
CREATE POLICY "Users can view their own retrospectives" 
ON public.ink_retrospectives 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retrospectives" 
ON public.ink_retrospectives 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives" 
ON public.ink_retrospectives 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives" 
ON public.ink_retrospectives 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure RLS policies for ink_daily (users can only access their own data)
CREATE POLICY "Users can view their own daily entries" 
ON public.ink_daily 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily entries" 
ON public.ink_daily 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries" 
ON public.ink_daily 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries" 
ON public.ink_daily 
FOR DELETE 
USING (auth.uid() = user_id);