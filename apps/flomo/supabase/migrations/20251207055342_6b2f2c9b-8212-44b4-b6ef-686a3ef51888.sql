-- =====================================================
-- BACKEND MODERNIZATION MIGRATION
-- =====================================================

-- 1. Add proper foreign key constraints to flo_shares
ALTER TABLE public.flo_shares
  DROP CONSTRAINT IF EXISTS flo_shares_owner_id_fkey,
  DROP CONSTRAINT IF EXISTS flo_shares_shared_with_id_fkey;

ALTER TABLE public.flo_shares
  ADD CONSTRAINT flo_shares_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT flo_shares_shared_with_id_fkey 
    FOREIGN KEY (shared_with_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Add updated_at column and trigger to flo_shares for consistency
ALTER TABLE public.flo_shares 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE OR REPLACE TRIGGER update_flo_shares_updated_at
  BEFORE UPDATE ON public.flo_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_flo_entries_user_id ON public.flo_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_flo_entries_date ON public.flo_entries(date);
CREATE INDEX IF NOT EXISTS idx_flo_entries_user_date ON public.flo_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_flo_shares_owner_id ON public.flo_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_flo_shares_shared_with_id ON public.flo_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 4. Add unique constraint to prevent duplicate shares
ALTER TABLE public.flo_shares
  DROP CONSTRAINT IF EXISTS flo_shares_owner_shared_unique;
ALTER TABLE public.flo_shares
  ADD CONSTRAINT flo_shares_owner_shared_unique UNIQUE (owner_id, shared_with_id);

-- 5. Tighten RLS policies for flo_entries - require authentication
DROP POLICY IF EXISTS "Users can insert their own flo entries" ON public.flo_entries;
CREATE POLICY "Users can insert their own flo entries" 
  ON public.flo_entries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own flo entries" ON public.flo_entries;
CREATE POLICY "Users can update their own flo entries" 
  ON public.flo_entries 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own flo entries" ON public.flo_entries;
CREATE POLICY "Users can delete their own flo entries" 
  ON public.flo_entries 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own flo entries" ON public.flo_entries;
CREATE POLICY "Users can view their own flo entries" 
  ON public.flo_entries 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Shared users can view flo entries" ON public.flo_entries;
CREATE POLICY "Shared users can view flo entries" 
  ON public.flo_entries 
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.flo_shares
    WHERE flo_shares.owner_id = flo_entries.user_id 
    AND flo_shares.shared_with_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can view all flo entries" ON public.flo_entries;
CREATE POLICY "Admins can view all flo entries" 
  ON public.flo_entries 
  FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Tighten RLS policies for flo_shares - require authentication
DROP POLICY IF EXISTS "Users can create shares for their own data" ON public.flo_shares;
CREATE POLICY "Users can create shares for their own data" 
  ON public.flo_shares 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own shares" ON public.flo_shares;
CREATE POLICY "Users can delete their own shares" 
  ON public.flo_shares 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view their own shares" ON public.flo_shares;
CREATE POLICY "Users can view their own shares" 
  ON public.flo_shares 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

-- 7. Tighten profile policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);