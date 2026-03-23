-- Rename tables with clever prefixes
-- Finance/Budget tables (fin_)
ALTER TABLE charts RENAME TO fin_charts;
ALTER TABLE transactions RENAME TO fin_transactions;

-- Period Tracking tables (flo_)
ALTER TABLE period_entries RENAME TO flo_entries;

-- Journal tables (ink_)
ALTER TABLE daily_entries RENAME TO ink_daily;
ALTER TABLE retrospectives RENAME TO ink_retrospectives;

-- Update foreign key references
ALTER TABLE fin_transactions RENAME COLUMN chart_id TO fin_chart_id;

-- Recreate RLS policies for renamed tables
-- Finance Charts policies
DROP POLICY IF EXISTS "Anyone can create charts" ON fin_charts;
DROP POLICY IF EXISTS "Anyone can delete charts" ON fin_charts;
DROP POLICY IF EXISTS "Anyone can update charts" ON fin_charts;
DROP POLICY IF EXISTS "Anyone can view charts" ON fin_charts;

CREATE POLICY "Anyone can create charts" ON fin_charts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete charts" ON fin_charts FOR DELETE USING (true);
CREATE POLICY "Anyone can update charts" ON fin_charts FOR UPDATE USING (true);
CREATE POLICY "Anyone can view charts" ON fin_charts FOR SELECT USING (true);

-- Finance Transactions policies
DROP POLICY IF EXISTS "Anyone can create transactions" ON fin_transactions;
DROP POLICY IF EXISTS "Anyone can delete transactions" ON fin_transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON fin_transactions;
DROP POLICY IF EXISTS "Anyone can view transactions" ON fin_transactions;

CREATE POLICY "Anyone can create transactions" ON fin_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete transactions" ON fin_transactions FOR DELETE USING (true);
CREATE POLICY "Anyone can update transactions" ON fin_transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can view transactions" ON fin_transactions FOR SELECT USING (true);

-- Period Tracking policies
DROP POLICY IF EXISTS "Admins can view all period entries" ON flo_entries;
DROP POLICY IF EXISTS "Users can delete their own period entries" ON flo_entries;
DROP POLICY IF EXISTS "Users can insert their own period entries" ON flo_entries;
DROP POLICY IF EXISTS "Users can update their own period entries" ON flo_entries;
DROP POLICY IF EXISTS "Users can view their own period entries" ON flo_entries;

CREATE POLICY "Admins can view all period entries" ON flo_entries FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can delete their own period entries" ON flo_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own period entries" ON flo_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own period entries" ON flo_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own period entries" ON flo_entries FOR SELECT USING (auth.uid() = user_id);

-- Journal Daily Entries policies
DROP POLICY IF EXISTS "Users can create their own daily entries" ON ink_daily;
DROP POLICY IF EXISTS "Users can delete their own daily entries" ON ink_daily;
DROP POLICY IF EXISTS "Users can update their own daily entries" ON ink_daily;
DROP POLICY IF EXISTS "Users can view their own daily entries" ON ink_daily;

CREATE POLICY "Users can create their own daily entries" ON ink_daily FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily entries" ON ink_daily FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily entries" ON ink_daily FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own daily entries" ON ink_daily FOR SELECT USING (auth.uid() = user_id);

-- Journal Retrospectives policies
DROP POLICY IF EXISTS "Users can create their own retrospectives" ON ink_retrospectives;
DROP POLICY IF EXISTS "Users can delete their own retrospectives" ON ink_retrospectives;
DROP POLICY IF EXISTS "Users can update their own retrospectives" ON ink_retrospectives;
DROP POLICY IF EXISTS "Users can view their own retrospectives" ON ink_retrospectives;

CREATE POLICY "Users can create their own retrospectives" ON ink_retrospectives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own retrospectives" ON ink_retrospectives FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own retrospectives" ON ink_retrospectives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own retrospectives" ON ink_retrospectives FOR SELECT USING (auth.uid() = user_id);