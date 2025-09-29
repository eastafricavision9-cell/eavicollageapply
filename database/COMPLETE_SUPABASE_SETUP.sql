-- ============================================================================
-- EAST AFRICA VISION INSTITUTE - COMPLETE DATABASE SETUP
-- Single SQL Script for Supabase - Run this entire script at once
-- Includes comprehensive student management with reporting date functionality
-- No PDF storage - optimized for core admission management
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. COMPREHENSIVE STUDENTS TABLE (80+ FIELDS)
-- ============================================================================
DROP TABLE IF EXISTS students CASCADE;
CREATE TABLE students (
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
    
    -- REPORTING DATE FUNCTIONALITY
    reporting_date DATE, -- When student should report for classes
    reporting_time TIME DEFAULT '08:00:00', -- Time to report
    reporting_location VARCHAR(255) DEFAULT 'Main Campus', -- Where to report
    reporting_instructions TEXT, -- Special instructions for reporting
    reported BOOLEAN DEFAULT FALSE, -- Has student reported
    reported_at TIMESTAMP WITH TIME ZONE, -- When they actually reported
    late_reporting BOOLEAN DEFAULT FALSE, -- Is reporting late
    reporting_status VARCHAR(50) DEFAULT 'Not Set' CHECK (reporting_status IN ('Not Set', 'Scheduled', 'Reported', 'Late', 'No Show')),
    
    -- Location & Address Information
    location VARCHAR(100), -- County
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
    
    -- Document Status (simplified - no file storage)
    documents_submitted BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    birth_certificate_submitted BOOLEAN DEFAULT FALSE,
    kcse_certificate_submitted BOOLEAN DEFAULT FALSE,
    id_copy_submitted BOOLEAN DEFAULT FALSE,
    passport_photo_submitted BOOLEAN DEFAULT FALSE,
    recommendation_letters_submitted BOOLEAN DEFAULT FALSE,
    documents_notes TEXT, -- Notes about document status
    
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
    CONSTRAINT valid_assessment_score CHECK (assessment_score IS NULL OR (assessment_score >= 0 AND assessment_score <= 100)),
    CONSTRAINT valid_reporting_date CHECK (reporting_date IS NULL OR reporting_date >= CURRENT_DATE - INTERVAL '1 year')
);

-- ============================================================================
-- 2. ENHANCED COURSES TABLE
-- ============================================================================
DROP TABLE IF EXISTS courses CASCADE;
CREATE TABLE courses (
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
    intake_months TEXT DEFAULT 'January,May,September', -- Available intake months
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_fees CHECK (fee_balance >= 0 AND fee_per_year >= 0),
    CONSTRAINT positive_capacity CHECK (capacity > 0),
    CONSTRAINT valid_enrollment CHECK (current_enrollment >= 0 AND current_enrollment <= capacity)
);

-- ============================================================================
-- 3. EMAIL LOGS TABLE
-- ============================================================================
DROP TABLE IF EXISTS email_logs CASCADE;
CREATE TABLE email_logs (
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

-- ============================================================================
-- 4. ADMIN SETTINGS TABLE
-- ============================================================================
DROP TABLE IF EXISTS admin_settings CASCADE;
CREATE TABLE admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description VARCHAR(500),
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. NOTIFICATIONS TABLE
-- ============================================================================
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
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
-- 6. STUDENT COMMUNICATIONS TABLE
-- ============================================================================
DROP TABLE IF EXISTS student_communications CASCADE;
CREATE TABLE student_communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('Email', 'SMS', 'WhatsApp', 'Phone', 'In-person', 'Letter')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('Inbound', 'Outbound')),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    recipient_name VARCHAR(255),
    recipient_contact VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed', 'bounced')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- ============================================================================
-- 7. REPORTING SCHEDULE TABLE (for managing reporting dates)
-- ============================================================================
DROP TABLE IF EXISTS reporting_schedules CASCADE;
CREATE TABLE reporting_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    intake_period VARCHAR(50) NOT NULL, -- January 2025, May 2025, etc
    reporting_date DATE NOT NULL,
    reporting_time TIME DEFAULT '08:00:00',
    reporting_location VARCHAR(255) DEFAULT 'Main Campus',
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_name, intake_period)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Students Table Indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_students_applied_at ON students(applied_at DESC);
CREATE INDEX idx_students_source ON students(source);
CREATE INDEX idx_students_full_name ON students(full_name);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_location ON students(location);
CREATE INDEX idx_students_reporting_date ON students(reporting_date);
CREATE INDEX idx_students_reporting_status ON students(reporting_status);
CREATE INDEX idx_students_enrolled ON students(enrolled);
CREATE INDEX idx_students_created_at ON students(created_at DESC);
CREATE INDEX idx_students_tags ON students USING GIN(tags);

-- Other Table Indexes
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_is_active ON courses(is_active);
CREATE INDEX idx_email_logs_student_id ON email_logs(student_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_admin_settings_key ON admin_settings(key);
CREATE INDEX idx_admin_settings_category ON admin_settings(category);
CREATE INDEX idx_notifications_user ON notifications(user_type, user_identifier);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_student_communications_student_id ON student_communications(student_id);
CREATE INDEX idx_student_communications_created_at ON student_communications(created_at DESC);
CREATE INDEX idx_reporting_schedules_course ON reporting_schedules(course_name);
CREATE INDEX idx_reporting_schedules_date ON reporting_schedules(reporting_date);

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
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reporting_schedules_updated_at BEFORE UPDATE ON reporting_schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-update reporting status based on date
CREATE OR REPLACE FUNCTION update_reporting_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reported = TRUE AND OLD.reported = FALSE THEN
        NEW.reported_at = NOW();
        NEW.reporting_status = 'Reported';
    END IF;
    
    -- Check if reporting is late
    IF NEW.reporting_date IS NOT NULL AND NEW.reporting_date < CURRENT_DATE AND NEW.reported = FALSE THEN
        NEW.late_reporting = TRUE;
        NEW.reporting_status = 'Late';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_reporting_status BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_reporting_status();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable all access for authenticated users" ON students FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON courses FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON email_logs FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON admin_settings FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON notifications FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON student_communications FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON reporting_schedules FOR ALL USING (true);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Enhanced student statistics view
CREATE OR REPLACE VIEW student_stats AS
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
    COUNT(*) FILTER (WHERE enrolled = TRUE) as enrolled_students,
    COUNT(*) FILTER (WHERE reporting_status = 'Reported') as students_reported,
    COUNT(*) FILTER (WHERE reporting_status = 'Late') as late_reporting,
    COUNT(*) FILTER (WHERE reporting_date IS NOT NULL) as students_with_reporting_date,
    AVG(EXTRACT(YEAR FROM age(date_of_birth)))::INTEGER as average_age
FROM students;

-- Course enrollment view with reporting info
CREATE OR REPLACE VIEW course_enrollment_stats AS
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
    COUNT(s.id) FILTER (WHERE s.status = 'Rejected') as rejected_applications,
    COUNT(s.id) FILTER (WHERE s.enrolled = TRUE) as enrolled_count,
    COUNT(s.id) FILTER (WHERE s.reporting_status = 'Reported') as reported_count
FROM courses c
LEFT JOIN students s ON s.course = c.name
WHERE c.is_active = true
GROUP BY c.id, c.name, c.department, c.capacity, c.current_enrollment;

-- Reporting dashboard view
CREATE OR REPLACE VIEW reporting_dashboard AS
SELECT 
    s.course,
    s.reporting_date,
    s.reporting_location,
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE s.reporting_status = 'Reported') as reported_count,
    COUNT(*) FILTER (WHERE s.reporting_status = 'Late') as late_count,
    COUNT(*) FILTER (WHERE s.reporting_status = 'Not Set') as not_scheduled_count,
    ROUND(
        (COUNT(*) FILTER (WHERE s.reporting_status = 'Reported')::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2
    ) as reporting_percentage
FROM students s 
WHERE s.status = 'Accepted'
GROUP BY s.course, s.reporting_date, s.reporting_location
ORDER BY s.reporting_date ASC;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default courses
INSERT INTO courses (name, description, fee_balance, fee_per_year, duration_years, capacity, department, requirements, intake_months) VALUES
    ('Business Administration', 'Comprehensive business management and leadership program', 85000, 120000, 4, 60, 'Business', 'KCSE C+ or equivalent', 'January,May,September'),
    ('Computer Science', 'Advanced computing, programming, and software development', 95000, 130000, 4, 40, 'Technology', 'KCSE B- or equivalent with C+ in Mathematics', 'January,May,September'),
    ('Information Technology', 'IT systems, networking, and digital solutions', 90000, 125000, 4, 50, 'Technology', 'KCSE C+ or equivalent', 'January,May,September'),
    ('Public Health', 'Community health, epidemiology, and healthcare management', 80000, 115000, 4, 45, 'Health Sciences', 'KCSE C+ or equivalent with C in Biology', 'January,September'),
    ('Education', 'Teaching methodologies and educational leadership', 75000, 110000, 4, 70, 'Education', 'KCSE C+ or equivalent', 'January,May,September'),
    ('Engineering', 'Civil, electrical, and mechanical engineering fundamentals', 100000, 140000, 4, 35, 'Engineering', 'KCSE B or equivalent with B- in Mathematics and Physics', 'January,September'),
    ('Nursing', 'Professional nursing and patient care', 85000, 125000, 4, 40, 'Health Sciences', 'KCSE C+ with C+ in Biology and Chemistry', 'January,September'),
    ('Agriculture', 'Modern farming techniques and agricultural management', 70000, 105000, 4, 55, 'Agriculture', 'KCSE C or equivalent', 'January,May,September');

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description, category) VALUES
    ('default_reporting_date', '', 'Default reporting date for new students', 'academic'),
    ('default_reporting_time', '08:00', 'Default reporting time', 'academic'),
    ('default_reporting_location', 'Main Campus', 'Default reporting location', 'academic'),
    ('approval_mode', 'manual', 'Approval mode: manual or automatic', 'system'),
    ('auto_approval_delay', '5', 'Minutes to wait before auto-approving students', 'system'),
    ('notification_email', 'admin@eaviafrica.com', 'Email for system notifications', 'notifications'),
    ('application_deadline', '', 'Current application deadline', 'academic'),
    ('academic_year', '2025', 'Current academic year', 'academic'),
    ('current_semester', 'first', 'Current semester', 'academic'),
    ('current_intake', 'January 2025', 'Current intake period', 'academic'),
    ('maintenance_mode', 'false', 'Enable maintenance mode', 'system'),
    ('application_fee', '2000', 'Application fee amount in KES', 'financial'),
    ('late_application_fee', '3000', 'Late application fee in KES', 'financial'),
    ('auto_email_confirmation', 'true', 'Send automatic email confirmations', 'notifications'),
    ('sms_notifications', 'false', 'Enable SMS notifications', 'notifications'),
    ('whatsapp_notifications', 'true', 'Enable WhatsApp notifications', 'notifications'),
    ('min_age_requirement', '16', 'Minimum age for admission', 'academic'),
    ('max_applications_per_email', '1', 'Maximum applications allowed per email', 'system'),
    ('late_reporting_grace_days', '7', 'Grace period for late reporting in days', 'academic'),
    ('auto_set_reporting_date', 'true', 'Automatically set reporting date on acceptance', 'system'),
    ('reporting_reminder_days', '14,7,1', 'Days before reporting to send reminders', 'notifications');

-- Insert default reporting schedules for upcoming intakes
INSERT INTO reporting_schedules (course_name, intake_period, reporting_date, reporting_time, reporting_location, instructions) VALUES
    ('Business Administration', 'January 2025', '2025-01-15', '08:00:00', 'Main Campus - Business Block', 'Report to the Dean of Business office with all required documents'),
    ('Computer Science', 'January 2025', '2025-01-15', '09:00:00', 'Main Campus - IT Block', 'Bring laptop and required software installation guide'),
    ('Information Technology', 'January 2025', '2025-01-15', '09:00:00', 'Main Campus - IT Block', 'Bring laptop and required software installation guide'),
    ('Public Health', 'January 2025', '2025-01-15', '08:30:00', 'Health Sciences Block', 'Medical clearance certificate required'),
    ('Education', 'January 2025', '2025-01-15', '08:00:00', 'Education Block - Room 101', 'Teaching practice placement forms will be provided'),
    ('Engineering', 'January 2025', '2025-01-15', '08:00:00', 'Engineering Workshop', 'Safety equipment will be issued during orientation'),
    ('Nursing', 'January 2025', '2025-01-15', '07:30:00', 'Nursing School', 'Uniform measurements and medical clearance required'),
    ('Agriculture', 'January 2025', '2025-01-15', '08:00:00', 'Agriculture Block', 'Farm work clothing recommended for practical sessions');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT 
    'TABLES CREATED' as status, 
    COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('students', 'courses', 'email_logs', 'admin_settings', 'notifications', 'student_communications', 'reporting_schedules');

-- Verify courses loaded
SELECT 'COURSES LOADED' as status, COUNT(*) as count FROM courses;

-- Verify admin settings loaded  
SELECT 'ADMIN SETTINGS LOADED' as status, COUNT(*) as count FROM admin_settings;

-- Verify reporting schedules loaded
SELECT 'REPORTING SCHEDULES LOADED' as status, COUNT(*) as count FROM reporting_schedules;

-- Test views
SELECT 'STUDENT STATS VIEW' as status, total_students, students_with_reporting_date FROM student_stats;

-- Show reporting dashboard
SELECT 'REPORTING DASHBOARD' as status, course, reporting_date, total_students FROM reporting_dashboard LIMIT 5;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your comprehensive EAVI admission system database is ready with:
-- ✅ 80+ student information fields including comprehensive reporting functionality
-- ✅ 7 core tables for complete system management
-- ✅ Advanced analytics views with reporting dashboard
-- ✅ 8 courses with intake management
-- ✅ 21 admin settings for full system control
-- ✅ Reporting schedules and automated status management
-- ✅ Performance optimized with 20+ indexes
-- ✅ Data validation and integrity constraints
-- ✅ Automated triggers for reporting status updates
--
-- Next steps:
-- 1. Your application should now connect and work perfectly
-- 2. Test student applications and admin dashboard
-- 3. Set up reporting dates for accepted students
-- 4. Configure notification preferences in admin settings
-- ============================================================================