-- Fix RLS policies for reflect_daily table to explicitly require authentication
DROP POLICY IF EXISTS "Users can view their own daily entries" ON public.reflect_daily;
DROP POLICY IF EXISTS "Users can create their own daily entries" ON public.reflect_daily;
DROP POLICY IF EXISTS "Users can update their own daily entries" ON public.reflect_daily;
DROP POLICY IF EXISTS "Users can delete their own daily entries" ON public.reflect_daily;

CREATE POLICY "Users can view their own daily entries" 
ON public.reflect_daily 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily entries" 
ON public.reflect_daily 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries" 
ON public.reflect_daily 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries" 
ON public.reflect_daily 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Fix RLS policies for reflect_retrospectives table to explicitly require authentication
DROP POLICY IF EXISTS "Users can view their own retrospectives" ON public.reflect_retrospectives;
DROP POLICY IF EXISTS "Users can create their own retrospectives" ON public.reflect_retrospectives;
DROP POLICY IF EXISTS "Users can update their own retrospectives" ON public.reflect_retrospectives;
DROP POLICY IF EXISTS "Users can delete their own retrospectives" ON public.reflect_retrospectives;

CREATE POLICY "Users can view their own retrospectives" 
ON public.reflect_retrospectives 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retrospectives" 
ON public.reflect_retrospectives 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives" 
ON public.reflect_retrospectives 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives" 
ON public.reflect_retrospectives 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);