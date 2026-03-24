-- Create reflect_daily table for daily chat messages
CREATE TABLE public.reflect_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reflect_retrospectives table for saved retrospectives
CREATE TABLE public.reflect_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  retrospective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  retrospective_type TEXT NOT NULL DEFAULT 'daily',
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reflect_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflect_retrospectives ENABLE ROW LEVEL SECURITY;

-- RLS policies for reflect_daily
CREATE POLICY "Users can view their own daily messages"
  ON public.reflect_daily FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily messages"
  ON public.reflect_daily FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily messages"
  ON public.reflect_daily FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for reflect_retrospectives
CREATE POLICY "Users can view their own retrospectives"
  ON public.reflect_retrospectives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retrospectives"
  ON public.reflect_retrospectives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives"
  ON public.reflect_retrospectives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives"
  ON public.reflect_retrospectives FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_reflect_daily_user_id ON public.reflect_daily(user_id);
CREATE INDEX idx_reflect_daily_created_at ON public.reflect_daily(created_at DESC);
CREATE INDEX idx_reflect_retrospectives_user_id ON public.reflect_retrospectives(user_id);
CREATE INDEX idx_reflect_retrospectives_date ON public.reflect_retrospectives(retrospective_date DESC);

-- Trigger for updated_at on retrospectives
CREATE TRIGGER update_reflect_retrospectives_updated_at
  BEFORE UPDATE ON public.reflect_retrospectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();