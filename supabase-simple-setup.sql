-- East Africa Vision Institute - Simple Database Setup
-- Only essential fields for students, courses, and reporting date settings

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create students table with only essential fields
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL, -- System generates this (e.g., EAVI/0001/25)
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    course VARCHAR(255) NOT NULL,
    kcse_grade VARCHAR(10),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'online_application')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Application date - automatically set
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table with only essential fields
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    fee_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    fee_per_year DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for reporting dates and other configurations
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email logs table (simple)
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_id UUID REFERENCES students(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_applied_at ON students(applied_at);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_settings_key ON admin_settings(key);
CREATE INDEX idx_email_logs_student_id ON email_logs(student_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - you can restrict later)
CREATE POLICY "Enable all operations for students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for admin_settings" ON admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for email_logs" ON email_logs FOR ALL USING (true) WITH CHECK (true);

-- Insert sample courses
INSERT INTO courses (name, fee_balance, fee_per_year) VALUES
('Business Administration', 0, 120000),
('Computer Science', 0, 150000),
('Information Technology', 0, 140000),
('Public Health', 0, 110000),
('Education', 0, 100000),
('Engineering', 0, 180000)
ON CONFLICT (name) DO NOTHING;

-- Insert default settings including reporting date
INSERT INTO admin_settings (key, value, description) VALUES
('reporting_date', '2025-01-15', 'Default reporting date for new students'),
('reporting_time', '08:00', 'Default reporting time'),
('reporting_location', 'Main Campus Administration Block', 'Default reporting location'),
('auto_approval_enabled', 'false', 'Enable automatic approval of applications'),
('auto_approval_delay', '5', 'Auto approval delay in minutes'),
('email_notifications_enabled', 'true', 'Enable email notifications'),
('application_fee', '2000', 'Application fee amount in KES')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Function to generate admission numbers
CREATE OR REPLACE FUNCTION generate_admission_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    student_count INTEGER;
    admission_num VARCHAR(20);
BEGIN
    SELECT COUNT(*) + 1 INTO student_count FROM students;
    admission_num := 'EAVI/' || LPAD(student_count::TEXT, 4, '0') || '/25';
    RETURN admission_num;
END;
$$ LANGUAGE plpgsql;

-- Create view for student statistics
CREATE OR REPLACE VIEW student_stats AS
SELECT 
    COUNT(*) as total_students,
    COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_students,
    COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_students,
    COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_students,
    COUNT(CASE WHEN source = 'online_application' THEN 1 END) as online_applications,
    COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_applications
FROM students;

-- Create view for course enrollment
CREATE OR REPLACE VIEW course_enrollment AS
SELECT 
    c.name as course_name,
    c.fee_per_year,
    c.fee_balance,
    COUNT(s.id) as total_applications,
    COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) as accepted_students,
    COUNT(CASE WHEN s.status = 'Pending' THEN 1 END) as pending_applications
FROM courses c
LEFT JOIN students s ON c.name = s.course
GROUP BY c.id, c.name, c.fee_per_year, c.fee_balance
ORDER BY c.name;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Simple EAVI database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: students, courses, admin_settings, email_logs';
    RAISE NOTICE '🔧 Essential fields only - keeping it simple!';
END $$;