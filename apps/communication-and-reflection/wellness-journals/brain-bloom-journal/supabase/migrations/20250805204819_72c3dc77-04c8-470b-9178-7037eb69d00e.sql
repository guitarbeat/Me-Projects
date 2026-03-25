-- Drop existing restrictive policies for ink_daily
DROP POLICY IF EXISTS "Users can create their own daily entries" ON public.ink_daily;
DROP POLICY IF EXISTS "Users can view their own daily entries" ON public.ink_daily;
DROP POLICY IF EXISTS "Users can update their own daily entries" ON public.ink_daily;
DROP POLICY IF EXISTS "Users can delete their own daily entries" ON public.ink_daily;

-- Create new public access policies for ink_daily
CREATE POLICY "Anyone can view daily entries" 
ON public.ink_daily 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create daily entries" 
ON public.ink_daily 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update daily entries" 
ON public.ink_daily 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete daily entries" 
ON public.ink_daily 
FOR DELETE 
USING (true);