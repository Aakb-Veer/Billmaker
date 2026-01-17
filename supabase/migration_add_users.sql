-- =============================================
-- MIGRATION: Add Users, Settings & Fix Policies
-- Run this AFTER the initial schema
-- =============================================

-- Step 1: Create new tables (only if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'bill_maker')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp_group_link TEXT,
  org_name TEXT DEFAULT 'આર્ષ અધ્યયન કેન્દ્ર, ભુજ',
  org_address TEXT DEFAULT 'Ashram Kutir, 244, Street No 9, Madhapar, Bhuj-Kutch',
  org_phone TEXT DEFAULT '94848 32029',
  org_email TEXT DEFAULT 'ashram@aakb.org.in',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Insert default settings
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Step 3: Enable RLS on new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for new tables (drop if exists first)
DROP POLICY IF EXISTS "Allow public read users" ON users;
DROP POLICY IF EXISTS "Allow org insert users" ON users;
DROP POLICY IF EXISTS "Allow org update users" ON users;
DROP POLICY IF EXISTS "Allow public read settings" ON settings;
DROP POLICY IF EXISTS "Allow org update settings" ON settings;

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow org insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow org update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow org update settings" ON settings FOR UPDATE USING (true);

-- Step 5: Add your first admin user (CHANGE THIS EMAIL!)
INSERT INTO users (email, name, role) 
VALUES ('admin@aakb.org.in', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- You can add more users like this:
-- INSERT INTO users (email, name, role) VALUES ('staff1@aakb.org.in', 'Staff Name', 'bill_maker');
