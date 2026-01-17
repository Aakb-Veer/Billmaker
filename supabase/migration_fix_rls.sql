-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR ⚠️
-- This fixes the "stuck loading" issue for Sadhak search

-- OPTION 1: Quick fix - disable RLS temporarily (for testing only)
-- ALTER TABLE sadhaks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Proper fix - allow all operations for authenticated users

-- Drop all existing policies on sadhaks
DROP POLICY IF EXISTS "Allow all for authenticated users" ON sadhaks;
DROP POLICY IF EXISTS "Allow all for authenticated" ON sadhaks;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON sadhaks;
DROP POLICY IF EXISTS "Enable read access for all users" ON sadhaks;

-- Drop all existing policies on receipts
DROP POLICY IF EXISTS "Allow all for authenticated users" ON receipts;
DROP POLICY IF EXISTS "Allow all for authenticated" ON receipts;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON receipts;
DROP POLICY IF EXISTS "Enable read access for all users" ON receipts;

-- Create simple policies that allow all for authenticated users
CREATE POLICY "sadhaks_all_authenticated" ON sadhaks
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "receipts_all_authenticated" ON receipts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anon users to read (for unauthenticated initial load)
CREATE POLICY "sadhaks_read_anon" ON sadhaks
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "receipts_read_anon" ON receipts
  FOR SELECT TO anon
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE sadhaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Verify tables exist
SELECT 'sadhaks' as table_name, count(*) as count FROM sadhaks
UNION ALL
SELECT 'receipts' as table_name, count(*) as count FROM receipts;
