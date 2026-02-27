-- Enable realtime for ink_daily table
ALTER TABLE public.ink_daily REPLICA IDENTITY FULL;

-- Add ink_daily table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ink_daily;

-- Also enable for ink_retrospectives while we're at it
ALTER TABLE public.ink_retrospectives REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ink_retrospectives;