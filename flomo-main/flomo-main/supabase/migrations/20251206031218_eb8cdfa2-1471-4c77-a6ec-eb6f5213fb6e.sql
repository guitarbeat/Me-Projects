-- Create table to store sharing permissions
CREATE TABLE public.flo_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, shared_with_id),
  CHECK (owner_id != shared_with_id)
);

-- Enable RLS
ALTER TABLE public.flo_shares ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own shares
CREATE POLICY "Users can view their own shares"
ON public.flo_shares
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

CREATE POLICY "Users can create shares for their own data"
ON public.flo_shares
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shares"
ON public.flo_shares
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Update flo_entries RLS to allow shared users to view
CREATE POLICY "Shared users can view flo entries"
ON public.flo_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.flo_shares
    WHERE flo_shares.owner_id = flo_entries.user_id
    AND flo_shares.shared_with_id = auth.uid()
  )
);