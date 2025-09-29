-- ============================================================================
-- EAST AFRICA VISION INSTITUTE - COMPREHENSIVE DATABASE SETUP
-- Execute this script in your Supabase SQL Editor
-- Project: zaomcjovaiiuscbjjqch
-- URL: https://zaomcjovaiiuscbjjqch.supabase.co
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COMPREHENSIVE STUDENTS TABLE WITH ALL POSSIBLE DETAILS
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    admission_number VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) NOT NULL,
    alternative_phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    national_id VARCHAR(20),
    passport_number VARCHAR(20),
    
    -- Academic Information
    course VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Waitlisted', 'Deferred', 'Withdrawn')),
    kcse_grade VARCHAR(10),
    kcse_index_number VARCHAR(20),
    kcse_year INTEGER,
    previous_school VARCHAR(255),
    other_qualifications TEXT,
    preferred_intake VARCHAR(50),
    study_mode VARCHAR(50) DEFAULT 'Full-time' CHECK (study_mode IN ('Full-time', 'Part-time', 'Weekend', 'Evening', 'Online')),
    
    -- Location & Address Information
    location VARCHAR(100),
    sub_county VARCHAR(100),
    ward VARCHAR(100),
    constituency VARCHAR(100),
    postal_address TEXT,
    physical_address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Kenya',
    postal_code VARCHAR(20),
    
    -- Guardian/Next of Kin Information
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(50),
    guardian_email VARCHAR(255),
    guardian_relationship VARCHAR(100),
    guardian_occupation VARCHAR(100),
    guardian_address TEXT,
    next_of_kin_name VARCHAR(255),
    next_of_kin_phone VARCHAR(50),
    next_of_kin_relationship VARCHAR(100),
    
    -- Financial Information
    fee_structure_acknowledged BOOLEAN DEFAULT FALSE,
    payment_plan_preference VARCHAR(100),
    sponsor_name VARCHAR(255),
    sponsor_phone VARCHAR(50),
    sponsor_relationship VARCHAR(100),
    financial_assistance_needed BOOLEAN DEFAULT FALSE,
    estimated_family_income VARCHAR(50),
    
    -- Health & Disability Information
    has_disability BOOLEAN DEFAULT FALSE,
    disability_type VARCHAR(255),
    special_needs TEXT,
    medical_conditions TEXT,
    dietary_requirements TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    
    -- Previous Education History
    primary_school VARCHAR(255),
    primary_completion_year INTEGER,
    secondary_school VARCHAR(255),
    secondary_completion_year INTEGER,
    tertiary_education TEXT,
    work_experience TEXT,
    
    -- Application Process Information
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    referral_source VARCHAR(255),
    application_fee_paid BOOLEAN DEFAULT FALSE,
    application_fee_amount NUMERIC(10,2),
    application_fee_receipt VARCHAR(100),
    
    -- Interview & Assessment
    interview_scheduled BOOLEAN DEFAULT FALSE,
    interview_date TIMESTAMP WITH TIME ZONE,
    interview_notes TEXT,
    interview_score NUMERIC(5,2),
    assessment_taken BOOLEAN DEFAULT FALSE,
    assessment_score NUMERIC(5,2),
    
    -- Document Status
    documents_submitted BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    birth_certificate_submitted BOOLEAN DEFAULT FALSE,
    kcse_certificate_submitted BOOLEAN DEFAULT FALSE,
    id_copy_submitted BOOLEAN DEFAULT FALSE,
    passport_photo_submitted BOOLEAN DEFAULT FALSE,
    recommendation_letters_submitted BOOLEAN DEFAULT FALSE,
    
    -- Admission Decision
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admission_decision_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    conditional_admission BOOLEAN DEFAULT FALSE,
    admission_conditions TEXT,
    
    -- Enrollment Information
    enrolled BOOLEAN DEFAULT FALSE,
    enrollment_date TIMESTAMP WITH TIME ZONE,
    student_id_issued BOOLEAN DEFAULT FALSE,
    orientation_attended BOOLEAN DEFAULT FALSE,
    
    -- Communication Preferences
    preferred_communication VARCHAR(50) DEFAULT 'Email' CHECK (preferred_communication IN ('Email', 'SMS', 'WhatsApp', 'Phone')),
    marketing_consent BOOLEAN DEFAULT FALSE,
    newsletter_subscription BOOLEAN DEFAULT TRUE,
    
    -- Additional Information
    notes TEXT,
    tags TEXT[],
    priority_level VARCHAR(20) DEFAULT 'Normal' CHECK (priority_level IN ('Low', 'Normal', 'High', 'Urgent')),
    follow_up_date DATE,
    last_contacted TIMESTAMP WITH TIME ZONE,
    contact_attempts INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Data Validation Constraints
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^[\+]?[0-9\-\s\(\)]+$'),
    CONSTRAINT valid_alternative_phone CHECK (alternative_phone IS NULL OR alternative_phone ~ '^[\+]?[0-9\-\s\(\)]+$'),
    CONSTRAINT valid_guardian_phone CHECK (guardian_phone IS NULL OR guardian_phone ~ '^[\+]?[0-9\-\s\(\)]+$'),
    CONSTRAINT valid_guardian_email CHECK (guardian_email IS NULL OR guardian_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_birth_date CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE),
    CONSTRAINT valid_kcse_year CHECK (kcse_year IS NULL OR (kcse_year >= 1960 AND kcse_year <= EXTRACT(YEAR FROM CURRENT_DATE))),
    CONSTRAINT valid_scores CHECK (interview_score IS NULL OR (interview_score >= 0 AND interview_score <= 100)),
    CONSTRAINT valid_assessment_score CHECK (assessment_score IS NULL OR (assessment_score >= 0 AND assessment_score <= 100))
);

-- ============================================================================
-- ENHANCED COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    fee_balance NUMERIC(12,2) DEFAULT 0,
    fee_per_year NUMERIC(12,2) DEFAULT 0,
    duration_years INTEGER DEFAULT 1,
    capacity INTEGER DEFAULT 50,
    current_enrollment INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    department VARCHAR(100),
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_fees CHECK (fee_balance >= 0 AND fee_per_year >= 0),
    CONSTRAINT positive_capacity CHECK (capacity > 0),
    CONSTRAINT valid_enrollment CHECK (current_enrollment >= 0 AND current_enrollment <= capacity)
);

-- ============================================================================
-- OTHER ESSENTIAL TABLES
-- ============================================================================

-- Enhanced Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    student_name VARCHAR(255) NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced', 'delivered')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Settings with Categories
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description VARCHAR(500),
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Documents Management
CREATE TABLE IF NOT EXISTS application_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(255)
);

-- System Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_type VARCHAR(50) NOT NULL,
    user_identifier VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- COMPREHENSIVE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Students Table Indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_applied_at ON students(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_source ON students(source);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_students_location ON students(location);
CREATE INDEX IF NOT EXISTS idx_students_kcse_grade ON students(kcse_grade);
CREATE INDEX IF NOT EXISTS idx_students_date_of_birth ON students(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender);
CREATE INDEX IF NOT EXISTS idx_students_study_mode ON students(study_mode);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_status ON students(enrolled);
CREATE INDEX IF NOT EXISTS idx_students_priority_level ON students(priority_level);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_tags ON students USING GIN(tags);

-- Other Table Indexes
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_email_logs_student_id ON email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);
CREATE INDEX IF NOT EXISTS idx_application_documents_student_id ON application_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_type ON application_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_identifier);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
-- Students policies
DROP POLICY IF EXISTS "Enable read access for all users" ON students;
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON students;
CREATE POLICY "Enable insert access for all users" ON students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON students;
CREATE POLICY "Enable update access for all users" ON students FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON students;
CREATE POLICY "Enable delete access for all users" ON students FOR DELETE USING (true);

-- Courses policies
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON courses;
CREATE POLICY "Enable insert access for all users" ON courses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON courses;
CREATE POLICY "Enable update access for all users" ON courses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON courses;
CREATE POLICY "Enable delete access for all users" ON courses FOR DELETE USING (true);

-- Email logs policies
DROP POLICY IF EXISTS "Enable read access for all users" ON email_logs;
CREATE POLICY "Enable read access for all users" ON email_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON email_logs;
CREATE POLICY "Enable insert access for all users" ON email_logs FOR INSERT WITH CHECK (true);

-- Admin settings policies
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_settings;
CREATE POLICY "Enable read access for all users" ON admin_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON admin_settings;
CREATE POLICY "Enable insert access for all users" ON admin_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON admin_settings;
CREATE POLICY "Enable update access for all users" ON admin_settings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON admin_settings;
CREATE POLICY "Enable delete access for all users" ON admin_settings FOR DELETE USING (true);

-- Application documents policies
DROP POLICY IF EXISTS "Enable read access for all users" ON application_documents;
CREATE POLICY "Enable read access for all users" ON application_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON application_documents;
CREATE POLICY "Enable insert access for all users" ON application_documents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON application_documents;
CREATE POLICY "Enable update access for all users" ON application_documents FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON application_documents;
CREATE POLICY "Enable delete access for all users" ON application_documents FOR DELETE USING (true);

-- Notifications policies
DROP POLICY IF EXISTS "Enable read access for all users" ON notifications;
CREATE POLICY "Enable read access for all users" ON notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON notifications;
CREATE POLICY "Enable insert access for all users" ON notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON notifications;
CREATE POLICY "Enable update access for all users" ON notifications FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON notifications;
CREATE POLICY "Enable delete access for all users" ON notifications FOR DELETE USING (true);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Enhanced student statistics view
DROP VIEW IF EXISTS student_stats;
CREATE VIEW student_stats AS
SELECT 
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_students,
    COUNT(*) FILTER (WHERE status = 'Accepted') as accepted_students,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_students,
    COUNT(*) FILTER (WHERE status = 'Waitlisted') as waitlisted_students,
    COUNT(*) FILTER (WHERE source = 'online_application') as online_applications,
    COUNT(*) FILTER (WHERE source = 'manual') as manual_entries,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as applications_last_30_days,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as applications_last_7_days,
    AVG(EXTRACT(YEAR FROM age(date_of_birth)))::INTEGER as average_age
FROM students;

-- Course enrollment view
DROP VIEW IF EXISTS course_enrollment_stats;
CREATE VIEW course_enrollment_stats AS
SELECT 
    c.id,
    c.name,
    c.department,
    c.capacity,
    c.current_enrollment,
    CASE 
        WHEN c.capacity > 0 THEN ROUND((c.current_enrollment::DECIMAL / c.capacity * 100), 2)
        ELSE 0 
    END as enrollment_percentage,
    COUNT(s.id) FILTER (WHERE s.status = 'Pending') as pending_applications,
    COUNT(s.id) FILTER (WHERE s.status = 'Accepted') as accepted_applications,
    COUNT(s.id) FILTER (WHERE s.status = 'Rejected') as rejected_applications
FROM courses c
LEFT JOIN students s ON s.course = c.name
WHERE c.is_active = true
GROUP BY c.id, c.name, c.department, c.capacity, c.current_enrollment;

-- ============================================================================
-- DEFAULT DATA - COURSES
-- ============================================================================
INSERT INTO courses (name, description, fee_balance, fee_per_year, duration_years, capacity, department, requirements) VALUES
    ('Business Administration', 'Comprehensive business management and leadership program', 85000, 120000, 4, 60, 'Business', 'KCSE C+ or equivalent'),
    ('Computer Science', 'Advanced computing, programming, and software development', 95000, 130000, 4, 40, 'Technology', 'KCSE B- or equivalent with C+ in Mathematics'),
    ('Information Technology', 'IT systems, networking, and digital solutions', 90000, 125000, 4, 50, 'Technology', 'KCSE C+ or equivalent'),
    ('Public Health', 'Community health, epidemiology, and healthcare management', 80000, 115000, 4, 45, 'Health Sciences', 'KCSE C+ or equivalent with C in Biology'),
    ('Education', 'Teaching methodologies and educational leadership', 75000, 110000, 4, 70, 'Education', 'KCSE C+ or equivalent'),
    ('Engineering', 'Civil, electrical, and mechanical engineering fundamentals', 100000, 140000, 4, 35, 'Engineering', 'KCSE B or equivalent with B- in Mathematics and Physics'),
    ('Nursing', 'Professional nursing and patient care', 85000, 125000, 4, 40, 'Health Sciences', 'KCSE C+ with C+ in Biology and Chemistry'),
    ('Agriculture', 'Modern farming techniques and agricultural management', 70000, 105000, 4, 55, 'Agriculture', 'KCSE C or equivalent')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- DEFAULT DATA - ADMIN SETTINGS
-- ============================================================================
INSERT INTO admin_settings (key, value, description, category) VALUES
    ('reporting_date', '', 'Default reporting date for new students', 'academic'),
    ('approval_mode', 'manual', 'Approval mode: manual or automatic', 'system'),
    ('auto_approval_delay', '5', 'Minutes to wait before auto-approving students', 'system'),
    ('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'system'),
    ('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file types for document upload', 'system'),
    ('notification_email', 'admin@eaviafrica.com', 'Email for system notifications', 'notifications'),
    ('application_deadline', '', 'Current application deadline', 'academic'),
    ('academic_year', '2025', 'Current academic year', 'academic'),
    ('semester', 'first', 'Current semester', 'academic'),
    ('maintenance_mode', 'false', 'Enable maintenance mode', 'system'),
    ('application_fee', '2000', 'Application fee amount in KES', 'financial'),
    ('late_application_fee', '3000', 'Late application fee in KES', 'financial'),
    ('interview_duration', '60', 'Default interview duration in minutes', 'academic'),
    ('document_verification_required', 'true', 'Require document verification before admission', 'academic'),
    ('auto_email_confirmation', 'true', 'Send automatic email confirmations', 'notifications'),
    ('sms_notifications', 'false', 'Enable SMS notifications', 'notifications'),
    ('whatsapp_notifications', 'true', 'Enable WhatsApp notifications', 'notifications'),
    ('backup_frequency', 'daily', 'Database backup frequency', 'system'),
    ('data_retention_years', '7', 'Years to retain student data', 'system'),
    ('min_age_requirement', '16', 'Minimum age for admission', 'academic'),
    ('max_applications_per_email', '1', 'Maximum applications allowed per email', 'system')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the setup
SELECT 'TABLES CREATED' as status, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('students', 'courses', 'email_logs', 'admin_settings', 'application_documents', 'notifications');

SELECT 'COURSES LOADED' as status, COUNT(*) as count FROM courses;

SELECT 'ADMIN SETTINGS LOADED' as status, COUNT(*) as count FROM admin_settings;

SELECT 'STUDENT STATS VIEW' as status, * FROM student_stats LIMIT 1;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your comprehensive EAVI admission system database is now ready!
-- All tables, indexes, views, triggers, and default data have been created.
-- 
-- Next steps:
-- 1. Update your application's Supabase configuration
-- 2. Test the application functionality
-- 3. Customize any settings as needed
-- ============================================================================