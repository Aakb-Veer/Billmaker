-- Add password column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update your user with a default password (you should change this!)
-- Password: admin123 (you can change it later from admin panel)
UPDATE users SET password_hash = 'admin123' WHERE email = 'veer.bhanushali@aakb.org.in';
