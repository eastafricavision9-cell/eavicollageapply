-- ============================================================================
-- SUPABASE DATABASE COMPLETE REBUILD SCRIPT
-- Enhanced version with improvements and optimizations
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES CREATION
-- ============================================================================

-- Students table (Comprehensive with ALL possible details)
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
    preferred_intake VARCHAR(50), -- January, May, September
    study_mode VARCHAR(50) DEFAULT 'Full-time' CHECK (study_mode IN ('Full-time', 'Part-time', 'Weekend', 'Evening', 'Online')),
    
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
    guardian_relationship VARCHAR(100), -- Parent, Sibling, Spouse, Friend, etc.
    guardian_occupation VARCHAR(100),
    guardian_address TEXT,
    next_of_kin_name VARCHAR(255),
    next_of_kin_phone VARCHAR(50),
    next_of_kin_relationship VARCHAR(100),
    
    -- Financial Information
    fee_structure_acknowledged BOOLEAN DEFAULT FALSE,
    payment_plan_preference VARCHAR(100), -- Full payment, Installments, Scholarship
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
    tertiary_education TEXT, -- Previous university/college
    work_experience TEXT,
    
    -- Application Process Information
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    referral_source VARCHAR(255), -- How they heard about EAVI
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
    notes TEXT, -- Admin notes
    tags TEXT[], -- Array of tags for categorization
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

-- Courses table (Enhanced with more details)
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
    
    -- Constraints
    CONSTRAINT positive_fees CHECK (fee_balance >= 0 AND fee_per_year >= 0),
    CONSTRAINT positive_capacity CHECK (capacity > 0),
    CONSTRAINT valid_enrollment CHECK (current_enrollment >= 0 AND current_enrollment <= capacity)
);

-- Email logs table (Enhanced with more tracking)
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

-- Admin settings table (Enhanced with validation)
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

-- New: Application documents table
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

-- New: Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_type VARCHAR(50) NOT NULL, -- 'admin', 'student'
    user_identifier VARCHAR(255) NOT NULL, -- email or student_id
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Student Communication Log table
CREATE TABLE IF NOT EXISTS student_communications (
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
    attachments TEXT[], -- Array of file paths/URLs
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Interview Sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    interview_type VARCHAR(100) DEFAULT 'Admission Interview',
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    interview_format VARCHAR(50) CHECK (interview_format IN ('In-person', 'Video Call', 'Phone', 'Panel')),
    interviewer_name VARCHAR(255),
    interviewer_email VARCHAR(255),
    panel_members TEXT[],
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled')),
    student_arrived_at TIMESTAMP WITH TIME ZONE,
    interview_started_at TIMESTAMP WITH TIME ZONE,
    interview_ended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    score NUMERIC(5,2),
    recommendation VARCHAR(50) CHECK (recommendation IN ('Strong Accept', 'Accept', 'Waitlist', 'Reject', 'Strong Reject')),
    strengths TEXT,
    weaknesses TEXT,
    additional_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Records table
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    payment_type VARCHAR(100) NOT NULL, -- Application Fee, Tuition, Registration, etc.
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KES',
    payment_method VARCHAR(50), -- Cash, Mobile Money, Bank Transfer, Card, etc.
    payment_reference VARCHAR(255),
    transaction_id VARCHAR(255),
    receipt_number VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Student Progress Tracking table
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL, -- Application Received, Documents Verified, Interview Scheduled, etc.
    status VARCHAR(50) NOT NULL, -- Pending, In Progress, Completed, Failed
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to VARCHAR(255), -- Staff member handling this stage
    notes TEXT,
    attachments TEXT[],
    next_stage VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Source Tracking table
CREATE TABLE IF NOT EXISTS marketing_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_name VARCHAR(255) UNIQUE NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('Digital', 'Traditional', 'Referral', 'Event', 'Agent', 'Other')),
    description TEXT,
    cost_per_lead NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Referral Sources table
CREATE TABLE IF NOT EXISTS student_referral_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    marketing_source_id UUID REFERENCES marketing_sources(id),
    referral_details TEXT,
    referrer_name VARCHAR(255),
    referrer_contact VARCHAR(255),
    campaign_name VARCHAR(255),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Prerequisites table
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_type VARCHAR(50) NOT NULL, -- Academic, Experience, Certificate, etc.
    requirement_description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    minimum_grade VARCHAR(10),
    alternative_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Course Prerequisites Check table
CREATE TABLE IF NOT EXISTS student_prerequisites_check (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_id UUID REFERENCES course_prerequisites(id) ON DELETE CASCADE,
    meets_requirement BOOLEAN DEFAULT FALSE,
    evidence_provided TEXT,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Activity Log table
CREATE TABLE IF NOT EXISTS system_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action_type VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW, LOGIN, etc.
    resource_type VARCHAR(100), -- Student, Course, Payment, etc.
    resource_id UUID,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    changes JSONB, -- Store old/new values for updates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Students indexes (Comprehensive)
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
CREATE INDEX IF NOT EXISTS idx_students_preferred_intake ON students(preferred_intake);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_status ON students(enrolled);
CREATE INDEX IF NOT EXISTS idx_students_priority_level ON students(priority_level);
CREATE INDEX IF NOT EXISTS idx_students_follow_up_date ON students(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_updated_at ON students(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_tags ON students USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_students_referral_source ON students(referral_source);
CREATE INDEX IF NOT EXISTS idx_students_financial_assistance ON students(financial_assistance_needed);
CREATE INDEX IF NOT EXISTS idx_students_disability ON students(has_disability);
CREATE INDEX IF NOT EXISTS idx_students_interview_scheduled ON students(interview_scheduled);
CREATE INDEX IF NOT EXISTS idx_students_documents_verified ON students(documents_verified);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_student_id ON email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);

-- Admin settings indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);

-- Application documents indexes
CREATE INDEX IF NOT EXISTS idx_application_documents_student_id ON application_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_type ON application_documents(document_type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_identifier);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Student Communications indexes
CREATE INDEX IF NOT EXISTS idx_student_communications_student_id ON student_communications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_communications_type ON student_communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_student_communications_direction ON student_communications(direction);
CREATE INDEX IF NOT EXISTS idx_student_communications_status ON student_communications(status);
CREATE INDEX IF NOT EXISTS idx_student_communications_created_at ON student_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_communications_follow_up ON student_communications(follow_up_required, follow_up_date);
CREATE INDEX IF NOT EXISTS idx_student_communications_tags ON student_communications USING GIN(tags);

-- Interview Sessions indexes
CREATE INDEX IF NOT EXISTS idx_interview_sessions_student_id ON interview_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_scheduled_date ON interview_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_interviewer ON interview_sessions(interviewer_name);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_format ON interview_sessions(interview_format);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_recommendation ON interview_sessions(recommendation);

-- Payment Records indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_student_id ON payment_records(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_records_type ON payment_records(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_amount ON payment_records(amount);
CREATE INDEX IF NOT EXISTS idx_payment_records_method ON payment_records(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_records_academic_year ON payment_records(academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_payment_records_verified ON payment_records(verified);

-- Student Progress indexes
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_stage ON student_progress(stage);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON student_progress(status);
CREATE INDEX IF NOT EXISTS idx_student_progress_assigned_to ON student_progress(assigned_to);
CREATE INDEX IF NOT EXISTS idx_student_progress_started_at ON student_progress(started_at);
CREATE INDEX IF NOT EXISTS idx_student_progress_completed_at ON student_progress(completed_at);

-- Marketing Sources indexes
CREATE INDEX IF NOT EXISTS idx_marketing_sources_name ON marketing_sources(source_name);
CREATE INDEX IF NOT EXISTS idx_marketing_sources_type ON marketing_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_marketing_sources_active ON marketing_sources(is_active);

-- Student Referral Sources indexes
CREATE INDEX IF NOT EXISTS idx_student_referral_sources_student_id ON student_referral_sources(student_id);
CREATE INDEX IF NOT EXISTS idx_student_referral_sources_marketing_id ON student_referral_sources(marketing_source_id);
CREATE INDEX IF NOT EXISTS idx_student_referral_sources_utm ON student_referral_sources(utm_source, utm_medium, utm_campaign);

-- Course Prerequisites indexes
CREATE INDEX IF NOT EXISTS idx_course_prerequisites_course_id ON course_prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_course_prerequisites_type ON course_prerequisites(prerequisite_type);
CREATE INDEX IF NOT EXISTS idx_course_prerequisites_mandatory ON course_prerequisites(is_mandatory);

-- Student Prerequisites Check indexes
CREATE INDEX IF NOT EXISTS idx_student_prerequisites_student_id ON student_prerequisites_check(student_id);
CREATE INDEX IF NOT EXISTS idx_student_prerequisites_course_id ON student_prerequisites_check(course_id);
CREATE INDEX IF NOT EXISTS idx_student_prerequisites_meets ON student_prerequisites_check(meets_requirement);

-- System Activity Log indexes
CREATE INDEX IF NOT EXISTS idx_system_activity_user_email ON system_activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_system_activity_action_type ON system_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_resource_type ON system_activity_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_resource_id ON system_activity_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_created_at ON system_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_activity_ip_address ON system_activity_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_system_activity_session_id ON system_activity_log(session_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Enhanced update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically update course enrollment
CREATE OR REPLACE FUNCTION update_course_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET current_enrollment = current_enrollment + 1 
        WHERE name = NEW.course;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If course changed, update both old and new course enrollments
        IF OLD.course != NEW.course THEN
            UPDATE courses 
            SET current_enrollment = current_enrollment - 1 
            WHERE name = OLD.course;
            
            UPDATE courses 
            SET current_enrollment = current_enrollment + 1 
            WHERE name = NEW.course;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET current_enrollment = current_enrollment - 1 
        WHERE name = OLD.course;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for course enrollment (only for accepted students)
CREATE TRIGGER update_course_enrollment_trigger
    AFTER INSERT OR UPDATE OF course, status OR DELETE ON students
    FOR EACH ROW EXECUTE PROCEDURE update_course_enrollment();

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
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON students FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON students FOR DELETE USING (true);

-- Courses policies
CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON courses FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON courses FOR DELETE USING (true);

-- Email logs policies
CREATE POLICY "Enable read access for all users" ON email_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON email_logs FOR INSERT WITH CHECK (true);

-- Admin settings policies
CREATE POLICY "Enable read access for all users" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON admin_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON admin_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON admin_settings FOR DELETE USING (true);

-- Application documents policies
CREATE POLICY "Enable read access for all users" ON application_documents FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON application_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON application_documents FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON application_documents FOR DELETE USING (true);

-- Notifications policies
CREATE POLICY "Enable read access for all users" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON notifications FOR DELETE USING (true);

-- ============================================================================
-- VIEWS
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
    AVG(EXTRACT(YEAR FROM age(date_of_birth)))::INTEGER as average_age
FROM students;

-- Course enrollment view
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
    COUNT(s.id) FILTER (WHERE s.status = 'Rejected') as rejected_applications
FROM courses c
LEFT JOIN students s ON s.course = c.name
WHERE c.is_active = true
GROUP BY c.id, c.name, c.department, c.capacity, c.current_enrollment;

-- Comprehensive Student Details View
CREATE OR REPLACE VIEW student_full_details AS
SELECT 
    s.*,
    CASE 
        WHEN s.date_of_birth IS NOT NULL THEN 
            DATE_PART('year', AGE(s.date_of_birth))
        ELSE NULL 
    END as age,
    c.department as course_department,
    c.fee_per_year as course_fee,
    -- Communication summary
    comm_stats.total_communications,
    comm_stats.last_communication_date,
    -- Payment summary
    pay_stats.total_paid,
    pay_stats.last_payment_date,
    -- Progress summary
    prog_stats.current_stage,
    prog_stats.stages_completed,
    -- Interview summary
    int_stats.interview_count,
    int_stats.last_interview_score,
    -- Document completion percentage
    CASE 
        WHEN s.birth_certificate_submitted AND s.kcse_certificate_submitted 
             AND s.id_copy_submitted AND s.passport_photo_submitted 
        THEN 100
        ELSE (
            (CASE WHEN s.birth_certificate_submitted THEN 25 ELSE 0 END) +
            (CASE WHEN s.kcse_certificate_submitted THEN 25 ELSE 0 END) +
            (CASE WHEN s.id_copy_submitted THEN 25 ELSE 0 END) +
            (CASE WHEN s.passport_photo_submitted THEN 25 ELSE 0 END)
        )
    END as document_completion_percentage
FROM students s
LEFT JOIN courses c ON c.name = s.course
LEFT JOIN (
    SELECT 
        student_id,
        COUNT(*) as total_communications,
        MAX(created_at) as last_communication_date
    FROM student_communications 
    GROUP BY student_id
) comm_stats ON comm_stats.student_id = s.id
LEFT JOIN (
    SELECT 
        student_id,
        SUM(amount) as total_paid,
        MAX(payment_date) as last_payment_date
    FROM payment_records 
    WHERE status = 'completed'
    GROUP BY student_id
) pay_stats ON pay_stats.student_id = s.id
LEFT JOIN (
    SELECT 
        student_id,
        stage as current_stage,
        COUNT(*) FILTER (WHERE status = 'Completed') as stages_completed
    FROM student_progress 
    WHERE id IN (
        SELECT DISTINCT ON (student_id) id 
        FROM student_progress 
        ORDER BY student_id, created_at DESC
    )
    GROUP BY student_id, stage
) prog_stats ON prog_stats.student_id = s.id
LEFT JOIN (
    SELECT 
        student_id,
        COUNT(*) as interview_count,
        AVG(score) as last_interview_score
    FROM interview_sessions 
    WHERE status = 'completed'
    GROUP BY student_id
) int_stats ON int_stats.student_id = s.id;

-- Marketing Effectiveness View
CREATE OR REPLACE VIEW marketing_effectiveness AS
SELECT 
    ms.source_name,
    ms.source_type,
    COUNT(srs.student_id) as total_leads,
    COUNT(s.id) FILTER (WHERE s.status = 'Accepted') as converted_leads,
    CASE 
        WHEN COUNT(srs.student_id) > 0 THEN 
            ROUND((COUNT(s.id) FILTER (WHERE s.status = 'Accepted')::DECIMAL / COUNT(srs.student_id) * 100), 2)
        ELSE 0 
    END as conversion_rate,
    ms.cost_per_lead,
    CASE 
        WHEN COUNT(s.id) FILTER (WHERE s.status = 'Accepted') > 0 AND ms.cost_per_lead > 0 THEN 
            ROUND((ms.cost_per_lead * COUNT(srs.student_id) / COUNT(s.id) FILTER (WHERE s.status = 'Accepted')), 2)
        ELSE NULL 
    END as cost_per_conversion,
    AVG(EXTRACT(DAYS FROM (s.created_at - srs.created_at))) as avg_application_delay_days
FROM marketing_sources ms
LEFT JOIN student_referral_sources srs ON srs.marketing_source_id = ms.id
LEFT JOIN students s ON s.id = srs.student_id
WHERE ms.is_active = true
GROUP BY ms.id, ms.source_name, ms.source_type, ms.cost_per_lead
ORDER BY conversion_rate DESC;

-- Student Pipeline View
CREATE OR REPLACE VIEW student_pipeline AS
SELECT 
    stage,
    COUNT(*) as student_count,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_count,
    AVG(EXTRACT(DAYS FROM (COALESCE(completed_at, NOW()) - started_at))) as avg_days_in_stage,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as assigned_count
FROM student_progress
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY stage
ORDER BY 
    CASE stage
        WHEN 'Application Received' THEN 1
        WHEN 'Documents Review' THEN 2
        WHEN 'Documents Verified' THEN 3
        WHEN 'Interview Scheduled' THEN 4
        WHEN 'Interview Completed' THEN 5
        WHEN 'Under Review' THEN 6
        WHEN 'Decision Made' THEN 7
        WHEN 'Admission Letter Sent' THEN 8
        WHEN 'Enrolled' THEN 9
        ELSE 10
    END;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert enhanced default courses
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

-- Insert enhanced default admin settings
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

-- Insert default marketing sources
INSERT INTO marketing_sources (source_name, source_type, description, cost_per_lead) VALUES
    ('Website Application Form', 'Digital', 'Direct applications through the EAVI website', 0.00),
    ('Facebook Ads', 'Digital', 'Facebook advertising campaigns', 50.00),
    ('Google Ads', 'Digital', 'Google search and display advertising', 75.00),
    ('Instagram Ads', 'Digital', 'Instagram advertising campaigns', 45.00),
    ('Radio Advertisements', 'Traditional', 'Radio commercials and sponsorships', 100.00),
    ('Newspaper Ads', 'Traditional', 'Print newspaper advertisements', 80.00),
    ('Student Referrals', 'Referral', 'Existing student referrals', 0.00),
    ('Alumni Referrals', 'Referral', 'Alumni network referrals', 0.00),
    ('Education Fairs', 'Event', 'Participation in education fairs and exhibitions', 200.00),
    ('School Visits', 'Event', 'Visits to secondary schools', 150.00),
    ('Education Agents', 'Agent', 'Third-party education agents', 300.00),
    ('Walk-ins', 'Other', 'Students who walk into the office directly', 0.00),
    ('YouTube Ads', 'Digital', 'YouTube advertising campaigns', 60.00),
    ('LinkedIn Ads', 'Digital', 'LinkedIn professional network ads', 90.00),
    ('WhatsApp Marketing', 'Digital', 'WhatsApp business marketing', 25.00),
    ('SMS Marketing', 'Digital', 'SMS marketing campaigns', 30.00),
    ('Email Marketing', 'Digital', 'Email marketing campaigns', 15.00),
    ('Billboards', 'Traditional', 'Outdoor billboard advertising', 500.00),
    ('Bus Advertising', 'Traditional', 'Public transport advertising', 250.00),
    ('Community Events', 'Event', 'Local community event participation', 100.00)
ON CONFLICT (source_name) DO NOTHING;

-- Insert default course prerequisites
INSERT INTO course_prerequisites (course_id, prerequisite_type, requirement_description, is_mandatory, minimum_grade) 
SELECT 
    c.id,
    'Academic',
    CASE c.name
        WHEN 'Computer Science' THEN 'KCSE certificate with minimum C+ in Mathematics'
        WHEN 'Engineering' THEN 'KCSE certificate with minimum B- in Mathematics and Physics'
        WHEN 'Nursing' THEN 'KCSE certificate with minimum C+ in Biology and Chemistry'
        WHEN 'Public Health' THEN 'KCSE certificate with minimum C in Biology'
        ELSE 'KCSE certificate with minimum grade C+'
    END,
    true,
    CASE c.name
        WHEN 'Computer Science' THEN 'C+'
        WHEN 'Engineering' THEN 'B-'
        WHEN 'Nursing' THEN 'C+'
        WHEN 'Public Health' THEN 'C'
        ELSE 'C+'
    END
FROM courses c
ON CONFLICT DO NOTHING;

-- Insert sample progress stages (these can be customized)
DO $$
DECLARE
    stage_names TEXT[] := ARRAY[
        'Application Received',
        'Initial Review',
        'Documents Requested',
        'Documents Submitted',
        'Documents Verified',
        'Interview Scheduled',
        'Interview Completed',
        'Under Review',
        'Decision Made',
        'Admission Letter Sent',
        'Fee Payment',
        'Enrolled',
        'Orientation Completed'
    ];
    stage_name TEXT;
BEGIN
    -- Note: This is just for reference, actual progress records are created per student
    NULL;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;