
-- Create a table for transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  inflow DECIMAL(10,2) NOT NULL DEFAULT 0,
  outflow DECIMAL(10,2) NOT NULL DEFAULT 0,
  person TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on date for better query performance
CREATE INDEX idx_transactions_date ON public.transactions(date);

-- Insert the initial transaction data
INSERT INTO public.transactions (date, name, inflow, outflow, person) VALUES
  ('2025-02-25', 'IRS Tax Refund', 10285, 0, 'IRS/Other'),
  ('2025-02-25', 'Aaron Woods Tax Filing', 0, 1061, 'Aaron Woods'),
  ('2025-03-04', 'Yvonne Bledsoe', 0, 1500, 'Yvonne Bledsoe'),
  ('2025-03-05', 'Yvonne Bledsoe', 0, 1500, 'Yvonne Bledsoe'),
  ('2025-03-11', 'Brandon', 0, 700, 'Brandon'),
  ('2025-03-18', 'Brandon', 0, 500, 'Brandon'),
  ('2025-04-01', 'Brandon', 0, 1000, 'Brandon'),
  ('2025-04-09', 'Yvonne Bledsoe', 0, 500, 'Yvonne Bledsoe'),
  ('2025-04-10', 'Yvonne Bledsoe', 0, 1000, 'Yvonne Bledsoe');
