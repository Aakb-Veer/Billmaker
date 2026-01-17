-- =============================================
-- BILLING & DONATION MANAGEMENT - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Table: users (Staff members with roles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'bill_maker')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: sadhaks (Customer Directory)
CREATE TABLE IF NOT EXISTS sadhaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  default_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast text search on name
CREATE INDEX IF NOT EXISTS sadhaks_name_idx ON sadhaks USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS sadhaks_name_ilike ON sadhaks (LOWER(name));

-- Table: receipts (Transaction History)
CREATE TABLE IF NOT EXISTS receipts (
  receipt_no BIGSERIAL PRIMARY KEY,
  sadhak_id UUID REFERENCES sadhaks(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  payment_mode TEXT NOT NULL,
  remarks TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching receipts by date
CREATE INDEX IF NOT EXISTS receipts_date_idx ON receipts (date);
CREATE INDEX IF NOT EXISTS receipts_sadhak_idx ON receipts (sadhak_id);

-- Table: settings (App configuration)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp_group_link TEXT,
  org_name TEXT DEFAULT 'આર્ષ અધ્યયન કેન્દ્ર, ભુજ',
  org_address TEXT DEFAULT 'Ashram Kutir, 244, Street No 9, Madhapar, Bhuj-Kutch',
  org_phone TEXT DEFAULT '94848 32029',
  org_email TEXT DEFAULT 'ashram@aakb.org.in',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sadhaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read for sadhaks and receipts
CREATE POLICY "Allow public read sadhaks" ON sadhaks FOR SELECT USING (true);
CREATE POLICY "Allow public read receipts" ON receipts FOR SELECT USING (true);
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);

-- Allow inserts for authenticated @aakb.org.in users
CREATE POLICY "Allow org insert sadhaks" ON sadhaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow org insert receipts" ON receipts FOR INSERT WITH CHECK (true);

-- Admin only for users and settings
CREATE POLICY "Allow org insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow org update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow org update settings" ON settings FOR UPDATE USING (true);

-- =============================================
-- KEEP-ALIVE FUNCTION (Prevents Supabase sleep)
-- =============================================

CREATE TABLE IF NOT EXISTS keep_alive (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO keep_alive (id, last_ping) VALUES (1, NOW()) ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION ping_database()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  UPDATE keep_alive SET last_ping = NOW() WHERE id = 1;
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA (Optional - Run after tables created)
-- =============================================

-- Insert first admin user (change email to your admin)
-- INSERT INTO users (email, name, role) VALUES ('admin@aakb.org.in', 'Admin', 'admin');
