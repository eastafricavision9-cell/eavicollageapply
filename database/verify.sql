-- ============================================================================
-- SUPABASE DATABASE VERIFICATION SCRIPT
-- Run this after the rebuild to verify everything was created successfully
-- ============================================================================

-- Check all tables exist
SELECT 
  'TABLES' as check_type,
  COUNT(*) as expected_count,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN 
    ('students', 'courses', 'email_logs', 'admin_settings', 'application_documents', 'notifications')
  ) as actual_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN 
      ('students', 'courses', 'email_logs', 'admin_settings', 'application_documents', 'notifications')
    ) = 6 THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM (SELECT 6 as count) t;

-- List all tables
SELECT 
  '📋 TABLE LIST' as info,
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all indexes exist
SELECT 
  'INDEXES' as check_type,
  COUNT(*) as total_indexes,
  CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%';

-- List all custom indexes
SELECT 
  '🔍 INDEX LIST' as info,
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check all views exist
SELECT 
  'VIEWS' as check_type,
  COUNT(*) as expected_count,
  (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public' AND viewname IN 
    ('student_stats', 'course_enrollment_stats')
  ) as actual_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public' AND viewname IN 
      ('student_stats', 'course_enrollment_stats')
    ) = 2 THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM (SELECT 2 as count) t;

-- List all views
SELECT 
  '👁️ VIEW LIST' as info,
  schemaname,
  viewname
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Check all functions exist
SELECT 
  'FUNCTIONS' as check_type,
  COUNT(*) as total_functions,
  CASE WHEN COUNT(*) >= 2 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('update_updated_at_column', 'update_course_enrollment');

-- List all custom functions
SELECT 
  '⚙️ FUNCTION LIST' as info,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('update_updated_at_column', 'update_course_enrollment');

-- Check all triggers exist
SELECT 
  'TRIGGERS' as check_type,
  COUNT(*) as total_triggers,
  CASE WHEN COUNT(*) >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND t.tgname NOT LIKE 'RI_%'  -- Exclude foreign key triggers
  AND NOT t.tgisinternal;

-- List all triggers
SELECT 
  '🎯 TRIGGER LIST' as info,
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND t.tgname NOT LIKE 'RI_%'  -- Exclude foreign key triggers
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- Check RLS policies
SELECT 
  'RLS POLICIES' as check_type,
  COUNT(*) as total_policies,
  CASE WHEN COUNT(*) >= 20 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_policy;

-- List all RLS policies
SELECT 
  '🔒 POLICY LIST' as info,
  n.nspname as schema_name,
  c.relname as table_name,
  p.polname as policy_name,
  p.polcmd as command_type
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY c.relname, p.polname;

-- Check default data in courses
SELECT 
  'COURSE DATA' as check_type,
  COUNT(*) as total_courses,
  CASE WHEN COUNT(*) >= 6 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM courses;

-- List all courses
SELECT 
  '🎓 COURSE LIST' as info,
  name,
  department,
  capacity,
  fee_per_year,
  is_active
FROM courses
ORDER BY department, name;

-- Check default data in admin_settings
SELECT 
  'ADMIN SETTINGS' as check_type,
  COUNT(*) as total_settings,
  CASE WHEN COUNT(*) >= 8 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM admin_settings;

-- List all admin settings
SELECT 
  '⚙️ SETTINGS LIST' as info,
  key,
  value,
  category,
  description
FROM admin_settings
ORDER BY category, key;

-- Test basic functionality
-- Test student stats view
SELECT 
  '📊 STUDENT STATS VIEW' as info,
  *
FROM student_stats;

-- Test course enrollment view
SELECT 
  '📈 COURSE ENROLLMENT VIEW' as info,
  name,
  department,
  capacity,
  current_enrollment,
  enrollment_percentage
FROM course_enrollment_stats
ORDER BY department, name;

-- Check table constraints
SELECT 
  'CONSTRAINTS' as check_type,
  COUNT(*) as total_constraints,
  CASE WHEN COUNT(*) >= 10 THEN '✅ PASS' ELSE '⚠️ CHECK' END as status
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public'
  AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK', 'UNIQUE');

-- List all constraints
SELECT 
  '🔗 CONSTRAINT LIST' as info,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public'
  AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK', 'UNIQUE')
ORDER BY table_name, constraint_type, constraint_name;

-- Final summary
SELECT 
  '🏁 REBUILD SUMMARY' as final_check,
  'Database rebuild verification completed' as message,
  NOW() as verified_at;