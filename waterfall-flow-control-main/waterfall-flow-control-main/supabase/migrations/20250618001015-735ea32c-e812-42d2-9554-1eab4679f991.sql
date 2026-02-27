
-- Create a table for charts
CREATE TABLE public.charts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add chart_id column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN chart_id UUID REFERENCES public.charts(id) ON DELETE SET NULL;

-- Create an index for better performance
CREATE INDEX idx_transactions_chart_id ON public.transactions(chart_id);
