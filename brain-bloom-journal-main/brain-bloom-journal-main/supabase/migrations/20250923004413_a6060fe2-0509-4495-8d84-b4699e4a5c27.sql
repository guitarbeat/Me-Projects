-- Rename ink_ tables to reflect_ prefix

-- First, create the new reflect_daily table with the same structure
CREATE TABLE public.reflect_daily (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    entry_date date NOT NULL,
    content text NOT NULL,
    entry_type text NOT NULL DEFAULT 'user_message'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Enable RLS on reflect_daily
ALTER TABLE public.reflect_daily ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reflect_daily
CREATE POLICY "Users can view their own daily entries" ON public.reflect_daily
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily entries" ON public.reflect_daily
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries" ON public.reflect_daily
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries" ON public.reflect_daily
    FOR DELETE USING (auth.uid() = user_id);

-- Copy data from ink_daily to reflect_daily
INSERT INTO public.reflect_daily (id, user_id, entry_date, content, entry_type, created_at, updated_at)
SELECT id, user_id, entry_date, content, entry_type, created_at, updated_at
FROM public.ink_daily;

-- Create the new reflect_retrospectives table with the same structure
CREATE TABLE public.reflect_retrospectives (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    retrospective_date date NOT NULL,
    title text NOT NULL,
    retrospective_type text NOT NULL DEFAULT 'daily'::text,
    content jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Enable RLS on reflect_retrospectives
ALTER TABLE public.reflect_retrospectives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reflect_retrospectives
CREATE POLICY "Users can view their own retrospectives" ON public.reflect_retrospectives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retrospectives" ON public.reflect_retrospectives
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives" ON public.reflect_retrospectives
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives" ON public.reflect_retrospectives
    FOR DELETE USING (auth.uid() = user_id);

-- Copy data from ink_retrospectives to reflect_retrospectives
INSERT INTO public.reflect_retrospectives (id, user_id, retrospective_date, title, retrospective_type, content, created_at, updated_at)
SELECT id, user_id, retrospective_date, title, retrospective_type, content, created_at, updated_at
FROM public.ink_retrospectives;

-- Add updated_at trigger for reflect_daily
CREATE TRIGGER update_reflect_daily_updated_at
    BEFORE UPDATE ON public.reflect_daily
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for reflect_retrospectives
CREATE TRIGGER update_reflect_retrospectives_updated_at
    BEFORE UPDATE ON public.reflect_retrospectives
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Drop the old ink_ tables
DROP TABLE public.ink_daily;
DROP TABLE public.ink_retrospectives;