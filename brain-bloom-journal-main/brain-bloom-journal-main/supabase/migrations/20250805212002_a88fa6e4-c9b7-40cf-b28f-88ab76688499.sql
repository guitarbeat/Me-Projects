-- Update RLS policies for ink_retrospectives to match ink_daily table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own retrospectives" ON public.ink_retrospectives;
DROP POLICY IF EXISTS "Users can view their own retrospectives" ON public.ink_retrospectives;  
DROP POLICY IF EXISTS "Users can update their own retrospectives" ON public.ink_retrospectives;
DROP POLICY IF EXISTS "Users can delete their own retrospectives" ON public.ink_retrospectives;

-- Create public access policies to match ink_daily
CREATE POLICY "Anyone can create retrospectives" 
ON public.ink_retrospectives 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view retrospectives" 
ON public.ink_retrospectives 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update retrospectives" 
ON public.ink_retrospectives 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete retrospectives" 
ON public.ink_retrospectives 
FOR DELETE 
USING (true);