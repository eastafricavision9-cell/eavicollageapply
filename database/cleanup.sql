-- ============================================================================
-- SUPABASE DATABASE COMPLETE CLEANUP SCRIPT
-- WARNING: This will DELETE ALL DATA and DROP ALL TABLES
-- ============================================================================

-- Drop all views first
DROP VIEW IF EXISTS student_stats CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "Enable read access for all users" ON students;
DROP POLICY IF EXISTS "Enable insert access for all users" ON students;
DROP POLICY IF EXISTS "Enable update access for all users" ON students;
DROP POLICY IF EXISTS "Enable delete access for all users" ON students;

DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Enable insert access for all users" ON courses;
DROP POLICY IF EXISTS "Enable update access for all users" ON courses;
DROP POLICY IF EXISTS "Enable delete access for all users" ON courses;

DROP POLICY IF EXISTS "Enable read access for all users" ON email_logs;
DROP POLICY IF EXISTS "Enable insert access for all users" ON email_logs;

DROP POLICY IF EXISTS "Enable read access for all users" ON admin_settings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON admin_settings;
DROP POLICY IF EXISTS "Enable update access for all users" ON admin_settings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON admin_settings;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all indexes (they will be dropped with tables anyway, but being explicit)
DROP INDEX IF EXISTS idx_students_email;
DROP INDEX IF EXISTS idx_students_status;
DROP INDEX IF EXISTS idx_students_course;
DROP INDEX IF EXISTS idx_students_applied_at;
DROP INDEX IF EXISTS idx_courses_name;
DROP INDEX IF EXISTS idx_email_logs_student_id;
DROP INDEX IF EXISTS idx_email_logs_sent_at;
DROP INDEX IF EXISTS idx_admin_settings_key;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Verify cleanup
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('students', 'courses', 'email_logs', 'admin_settings');

-- This should return no rows after cleanup