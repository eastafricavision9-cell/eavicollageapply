-- Create 4 Fixed Admin Accounts for EAVI System
-- Run this in your Supabase SQL Editor

-- First, we need to create admin accounts using Supabase Auth
-- Since we can't directly insert into auth.users via SQL, we'll create a simple approach

-- Create an admin_users table for our 4 fixed admins
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users
CREATE POLICY "Enable all operations for admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Insert the 4 fixed admin accounts
-- Note: These are hashed passwords using bcrypt for security
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@eavi.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin'),
('admissions@eavi.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admissions Officer', 'admin'),
('registrar@eavi.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Registrar', 'admin'),
('director@eavi.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Academic Director', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Insert admin settings to show the 4 admin accounts
INSERT INTO admin_settings (key, value, description) VALUES
('admin_accounts', 'admin@eavi.edu,admissions@eavi.edu,registrar@eavi.edu,director@eavi.edu', 'Fixed admin account emails'),
('admin_password', 'admin123', 'Default password for all admin accounts (change in production)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;