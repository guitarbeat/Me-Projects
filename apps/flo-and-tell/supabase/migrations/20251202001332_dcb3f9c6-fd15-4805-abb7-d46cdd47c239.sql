-- Create flo_entries table for period tracking
CREATE TABLE IF NOT EXISTS public.flo_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_period_day BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.flo_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own flo entries" 
ON public.flo_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flo entries" 
ON public.flo_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flo entries" 
ON public.flo_entries 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flo entries" 
ON public.flo_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policy for viewing all entries
CREATE POLICY "Admins can view all flo entries"
ON public.flo_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_flo_entries_updated_at
BEFORE UPDATE ON public.flo_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries by user and date
CREATE INDEX idx_flo_entries_user_date ON public.flo_entries(user_id, date DESC);

-- Add comment
COMMENT ON TABLE public.flo_entries IS 'Stores period tracking data for each user';