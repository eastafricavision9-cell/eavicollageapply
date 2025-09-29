-- Add New Courses to EAVI Database
-- This script adds all the requested courses with basic fee structure
-- You can edit the fees and details later through the admin interface

INSERT INTO courses (name, description, fee_balance, fee_per_year, duration_years, capacity, department, requirements, intake_months) VALUES

-- HEALTH SCIENCES COURSES
('Peri-operative Theater', 'Specialized training in peri-operative care and theater management', 0, 120000, 2, 30, 'Health Sciences', 'KCSE C+ or equivalent with C+ in Biology', 'January,September'),
('Trauma and Orthopaedic Medicine', 'Advanced trauma care and orthopedic medical procedures', 0, 130000, 3, 25, 'Health Sciences', 'KCSE B- or equivalent with B- in Biology and Chemistry', 'January,September'),
('Certified Nurse Assistant (CNA)', 'Professional nursing assistant certification program', 0, 80000, 1, 40, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Aging and Disability Management', 'Specialized care for aging populations and disability support', 0, 90000, 2, 35, 'Health Sciences', 'KCSE C+ or equivalent', 'January,September'),
('Basic Life Support (BLS)', 'Essential life support and emergency response training', 0, 50000, 0.5, 50, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Home Care Nursing', 'Specialized home-based nursing care and patient management', 0, 85000, 2, 30, 'Health Sciences', 'KCSE C+ or equivalent with C+ in Biology', 'January,September'),
('Health Services Support', 'Comprehensive health services support and administration', 0, 75000, 2, 40, 'Health Sciences', 'KCSE C+ or equivalent', 'January,May,September'),
('Health Care Assistant', 'Professional healthcare assistance and patient care', 0, 70000, 1, 45, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Individual Support', 'Personalized support services for individuals with special needs', 0, 65000, 1, 35, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Elderly Caregivers', 'Specialized care for elderly populations', 0, 60000, 1, 40, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Nurse Aide', 'Essential nursing assistance and patient support', 0, 55000, 1, 50, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Patient Attendant', 'Professional patient care and hospital support services', 0, 50000, 1, 45, 'Health Sciences', 'KCSE C or equivalent', 'January,May,September'),
('Health Records Management with ICT', 'Digital health records management and information systems', 0, 95000, 2, 30, 'Health Sciences', 'KCSE C+ or equivalent', 'January,September'),
('Social Work and Nurse Aide', 'Combined social work and nursing assistance program', 0, 85000, 2, 35, 'Health Sciences', 'KCSE C+ or equivalent', 'January,September'),
('Community Health Assistant', 'Community-based health services and public health support', 0, 80000, 2, 40, 'Health Sciences', 'KCSE C+ or equivalent', 'January,September'),
('Nutrition and Dietetics', 'Professional nutrition counseling and dietary management', 0, 100000, 3, 25, 'Health Sciences', 'KCSE B- or equivalent with C+ in Biology and Chemistry', 'January,September'),
('Medical Engineering and Lab Tech', 'Medical equipment maintenance and laboratory technology', 0, 110000, 3, 20, 'Health Sciences', 'KCSE B- or equivalent with B- in Mathematics and Physics', 'January,September'),

-- BEAUTY AND FASHION COURSES
('Hairdressing and Beauty Therapy', 'Professional hairdressing and beauty therapy services', 0, 60000, 1, 30, 'Beauty & Fashion', 'KCSE C or equivalent', 'January,May,September'),
('Fashion and Design', 'Fashion design and garment creation', 0, 70000, 2, 25, 'Beauty & Fashion', 'KCSE C or equivalent', 'January,May,September'),
('Garment Making', 'Professional garment construction and tailoring', 0, 55000, 1, 35, 'Beauty & Fashion', 'KCSE C or equivalent', 'January,May,September'),

-- BUSINESS AND ADMINISTRATION COURSES
('Secretarial', 'Professional secretarial and administrative skills', 0, 65000, 1, 40, 'Business', 'KCSE C or equivalent', 'January,May,September'),
('Security Management', 'Professional security services and management', 0, 70000, 1, 35, 'Business', 'KCSE C or equivalent', 'January,May,September'),
('Catering/Food and Beverage', 'Professional catering and food service management', 0, 75000, 2, 30, 'Business', 'KCSE C or equivalent', 'January,May,September'),
('Store Keeping', 'Inventory management and store operations', 0, 60000, 1, 40, 'Business', 'KCSE C or equivalent', 'January,May,September'),
('Purchasing & Supply Management', 'Procurement and supply chain management', 0, 85000, 2, 30, 'Business', 'KCSE C+ or equivalent', 'January,September'),
('Human Resource Management (HRM)', 'Professional human resource management', 0, 90000, 2, 35, 'Business', 'KCSE C+ or equivalent', 'January,September'),
('Business Administration and Management', 'Comprehensive business management program', 0, 95000, 3, 40, 'Business', 'KCSE C+ or equivalent', 'January,September'),
('Finance', 'Financial management and accounting', 0, 100000, 3, 30, 'Business', 'KCSE B- or equivalent with C+ in Mathematics', 'January,September'),
('Banking Finance', 'Banking and financial services', 0, 105000, 3, 25, 'Business', 'KCSE B- or equivalent with C+ in Mathematics', 'January,September'),
('Sales and Marketing', 'Professional sales and marketing strategies', 0, 80000, 2, 40, 'Business', 'KCSE C+ or equivalent', 'January,May,September'),
('Entrepreneur', 'Entrepreneurship and business development', 0, 75000, 2, 35, 'Business', 'KCSE C+ or equivalent', 'January,May,September'),
('Public Administration and Relations', 'Public sector administration and relations', 0, 85000, 3, 30, 'Business', 'KCSE C+ or equivalent', 'January,September'),

-- ENGINEERING COURSES
('Electrical Engineering', 'Electrical systems design and maintenance', 0, 120000, 3, 25, 'Engineering', 'KCSE B or equivalent with B- in Mathematics and Physics', 'January,September'),
('Civil/Building', 'Civil engineering and building construction', 0, 110000, 3, 30, 'Engineering', 'KCSE B or equivalent with B- in Mathematics and Physics', 'January,September'),
('Survey', 'Land surveying and mapping', 0, 100000, 2, 20, 'Engineering', 'KCSE B- or equivalent with C+ in Mathematics', 'January,September'),
('Water Engineering', 'Water systems engineering and management', 0, 105000, 3, 25, 'Engineering', 'KCSE B or equivalent with B- in Mathematics and Physics', 'January,September'),
('Plumbing', 'Professional plumbing and pipe systems', 0, 80000, 2, 30, 'Engineering', 'KCSE C+ or equivalent', 'January,May,September'),
('Mechanical/Automotive', 'Mechanical engineering and automotive technology', 0, 115000, 3, 25, 'Engineering', 'KCSE B or equivalent with B- in Mathematics and Physics', 'January,September'),

-- EDUCATION COURSES
('Teacher Education', 'Professional teacher training and education', 0, 80000, 3, 50, 'Education', 'KCSE C+ or equivalent', 'January,September'),
('Guidance and Counseling Skills Development', 'Professional counseling and guidance services', 0, 75000, 2, 30, 'Education', 'KCSE C+ or equivalent', 'January,September'),
('Counseling Psychology', 'Advanced counseling psychology and therapy', 0, 90000, 3, 25, 'Education', 'KCSE B- or equivalent', 'January,September'),

-- AGRICULTURE COURSES
('General Agriculture', 'Comprehensive agricultural practices and management', 0, 70000, 2, 40, 'Agriculture', 'KCSE C or equivalent', 'January,May,September'),

-- SOCIAL WORK COURSES
('Community Health and Social Work', 'Community health and social work services', 0, 80000, 3, 35, 'Social Work', 'KCSE C+ or equivalent', 'January,September'),
('Community Development and Social Work', 'Community development and social services', 0, 75000, 3, 40, 'Social Work', 'KCSE C+ or equivalent', 'January,September'),

-- CRIMINOLOGY AND SECURITY
('Criminology', 'Criminal justice and criminology studies', 0, 85000, 3, 30, 'Criminology', 'KCSE C+ or equivalent', 'January,September'),

-- LEADERSHIP AND MANAGEMENT
('Leadership Skills Development', 'Professional leadership and management skills', 0, 70000, 1, 40, 'Leadership', 'KCSE C+ or equivalent', 'January,May,September'),
('Training of Trainers (TOT)', 'Professional trainer development program', 0, 80000, 1, 25, 'Leadership', 'KCSE C+ or equivalent', 'January,September'),
('NGO Management', 'Non-governmental organization management', 0, 85000, 2, 30, 'Leadership', 'KCSE C+ or equivalent', 'January,September'),
('Logistics and Procurement Management', 'Supply chain and logistics management', 0, 90000, 2, 30, 'Business', 'KCSE C+ or equivalent', 'January,September'),
('Nutrition Management Skills', 'Nutrition program management and planning', 0, 75000, 2, 25, 'Health Sciences', 'KCSE C+ or equivalent', 'January,September'),
('Financial Management for NGOs', 'Financial management for non-profit organizations', 0, 80000, 2, 30, 'Business', 'KCSE C+ or equivalent', 'January,September'),
('Conflict Management and Peace Building', 'Conflict resolution and peace building skills', 0, 70000, 1, 35, 'Leadership', 'KCSE C+ or equivalent', 'January,May,September'),
('Monitoring and Evaluation of Projects', 'Project monitoring and evaluation techniques', 0, 85000, 2, 30, 'Leadership', 'KCSE C+ or equivalent', 'January,September'),
('Project Management', 'Professional project management skills', 0, 90000, 2, 35, 'Leadership', 'KCSE C+ or equivalent', 'January,September'),

-- HOSPITALITY AND TOURISM
('Tourism Management', 'Tourism industry management and operations', 0, 80000, 2, 30, 'Hospitality', 'KCSE C+ or equivalent', 'January,May,September'),
('Customer Care/Front Office Management', 'Customer service and front office operations', 0, 65000, 1, 40, 'Hospitality', 'KCSE C or equivalent', 'January,May,September'),
('Hotel and Hospitality Management', 'Hotel and hospitality industry management', 0, 85000, 2, 30, 'Hospitality', 'KCSE C+ or equivalent', 'January,May,September'),

-- SPECIALIZED PROGRAMS
('HIV/AIDS Management', 'HIV/AIDS prevention and management programs', 0, 70000, 1, 30, 'Health Sciences', 'KCSE C+ or equivalent', 'January,May,September'),
('Gender and Development Studies', 'Gender equality and development studies', 0, 75000, 2, 25, 'Social Work', 'KCSE C+ or equivalent', 'January,September'),
('Disaster Management', 'Emergency response and disaster management', 0, 80000, 2, 30, 'Emergency Services', 'KCSE C+ or equivalent', 'January,September'),
('First Aid', 'Emergency first aid and medical response', 0, 40000, 0.5, 50, 'Emergency Services', 'KCSE C or equivalent', 'January,May,September'),
('Fire Fighting and Extinguisher', 'Fire safety and emergency response', 0, 50000, 0.5, 40, 'Emergency Services', 'KCSE C or equivalent', 'January,May,September')

ON CONFLICT (name) DO NOTHING;

-- Display summary of added courses
SELECT 
    department,
    COUNT(*) as course_count,
    MIN(fee_per_year) as min_fee,
    MAX(fee_per_year) as max_fee
FROM courses 
WHERE name IN (
    'Peri-operative Theater', 'Trauma and Orthopaedic Medicine', 'Certified Nurse Assistant (CNA)',
    'Aging and Disability Management', 'Basic Life Support (BLS)', 'Home Care Nursing',
    'Health Services Support', 'Health Care Assistant', 'Individual Support', 'Elderly Caregivers',
    'Nurse Aide', 'Patient Attendant', 'Hairdressing and Beauty Therapy', 'Fashion and Design',
    'Garment Making', 'Secretarial', 'Health Records Management with ICT', 'Social Work and Nurse Aide',
    'Community Health Assistant', 'Teacher Education', 'Nutrition and Dietetics',
    'Medical Engineering and Lab Tech', 'Security Management', 'Catering/Food and Beverage',
    'Store Keeping', 'Purchasing & Supply Management', 'Electrical Engineering', 'Civil/Building',
    'Survey', 'Water Engineering', 'Plumbing', 'Mechanical/Automotive', 'Community Health and Social Work',
    'General Agriculture', 'Criminology', 'Leadership Skills Development', 'Training of Trainers (TOT)',
    'NGO Management', 'Logistics and Procurement Management', 'Human Resource Management (HRM)',
    'Nutrition Management Skills', 'Guidance and Counseling Skills Development', 'Counseling Psychology',
    'Financial Management for NGOs', 'Conflict Management and Peace Building', 'Tourism Management',
    'Customer Care/Front Office Management', 'Logistics and Procurement Management',
    'Hotel and Hospitality Management', 'HIV/AIDS Management', 'Gender and Development Studies',
    'Community Development and Social Work', 'Public Administration and Relations',
    'Business Administration and Management', 'Finance', 'Banking Finance', 'Sales and Marketing',
    'Entrepreneur', 'Counseling', 'Monitoring and Evaluation of Projects', 'Disaster Management',
    'First Aid', 'Fire Fighting and Extinguisher', 'Project Management'
)
GROUP BY department
ORDER BY course_count DESC;

