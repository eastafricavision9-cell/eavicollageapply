# 🎯 East Africa Vision Institute - Manual Database Setup Instructions

## 📋 Overview
Since Supabase requires manual SQL execution through their web interface, follow these step-by-step instructions to set up your comprehensive database.

## 🔗 Your New Supabase Project Details
- **Project URL**: https://zaomcjovaiiuscbjjqch.supabase.co
- **Project Reference**: `zaomcjovaiiuscbjjqch`
- **Dashboard URL**: https://supabase.com/dashboard/project/zaomcjovaiiuscbjjqch

## 📝 Step-by-Step Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/zaomcjovaiiuscbjjqch
2. Click on the **"SQL Editor"** tab in the left sidebar
3. Click **"New Query"** to create a new SQL script

### Step 2: Execute the Comprehensive Database Script
1. Open the file `database/EXECUTE_IN_SUPABASE.sql` from your project
2. **Copy ALL the contents** of this file (480+ lines)
3. **Paste it into the Supabase SQL Editor**
4. Click **"Run"** to execute the entire script

### Step 3: Verify Setup
After running the script, execute these verification queries in the SQL editor:

```sql
-- Check tables created
SELECT 'TABLES CREATED' as status, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('students', 'courses', 'email_logs', 'admin_settings', 'application_documents', 'notifications');

-- Check courses loaded
SELECT 'COURSES LOADED' as status, COUNT(*) as count FROM courses;

-- Check admin settings loaded
SELECT 'ADMIN SETTINGS LOADED' as status, COUNT(*) as count FROM admin_settings;

-- View student stats
SELECT 'STUDENT STATS VIEW' as status, * FROM student_stats LIMIT 1;
```

**Expected Results:**
- TABLES CREATED: count = 6
- COURSES LOADED: count = 8
- ADMIN SETTINGS LOADED: count = 21
- STUDENT STATS VIEW: should show statistics (all zeros for new database)

### Step 4: Test Your Application
1. Make sure your `.env.local` file has the correct Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=https://zaomcjovaiiuscbjjqch.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphb21jam92YWlpdXNjYmpqcWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzEwMTAsImV4cCI6MjA3NDQ0NzAxMH0.KhMuXnIFtjtkdBw7jM4bIott-4ueblqu1PkV1hoC8Ac
```

2. Start your application:
```bash
npm run dev
```

3. Test the following functionality:
   - Visit the homepage
   - Try submitting an application
   - Access the admin dashboard
   - Check if courses are loading

## 🎯 What Gets Created

### 📊 **6 Core Tables:**
1. **`students`** - Comprehensive student information (80+ fields)
2. **`courses`** - Enhanced course management
3. **`email_logs`** - Communication tracking
4. **`admin_settings`** - System configuration
5. **`application_documents`** - Document management
6. **`notifications`** - System notifications

### 📈 **Analytics Views:**
1. **`student_stats`** - Application statistics
2. **`course_enrollment_stats`** - Course analytics

### 🔍 **Performance Features:**
- 20+ indexes for optimal query performance
- Row Level Security (RLS) enabled
- Data validation constraints
- Automatic timestamp triggers

### 🎓 **Default Data:**
- **8 Courses** with full details (Business, CS, IT, Health, Education, Engineering, Nursing, Agriculture)
- **21 Admin Settings** covering all system aspects
- Complete course requirements and fee structures

## 🚨 Troubleshooting

### If you get errors during execution:
1. **Foreign Key Errors**: Run the script again - some statements depend on others
2. **Permission Errors**: Make sure you're logged into the correct project
3. **Syntax Errors**: Make sure you copied the entire script correctly

### If verification queries show wrong counts:
1. Check the Supabase logs for any error messages
2. Try running individual table creation statements
3. Refresh your browser and try again

### If your application can't connect:
1. Verify the `.env.local` configuration
2. Check the Supabase project URL matches
3. Ensure the API key is correct

## ✅ Success Indicators

After successful setup, you should see:
- ✅ 6 tables created in your Supabase project
- ✅ 8 courses available in the courses table
- ✅ 21 admin settings configured
- ✅ Your application can connect and load data
- ✅ Student applications can be submitted successfully
- ✅ Admin dashboard shows course and student data

## 🎉 What This Gives You

Your comprehensive database now includes:

### 🎯 **Complete Student Management:**
- Every possible detail captured and stored
- Full academic, personal, and contact information
- Guardian and emergency contact tracking
- Health and accessibility information
- Financial aid and payment tracking

### 📊 **Advanced Analytics:**
- Real-time application statistics
- Course enrollment tracking
- Application source analysis
- Geographic distribution data

### 🔄 **Automated Features:**
- Email confirmation system
- Application status tracking
- Document verification workflows
- Auto-generated admission numbers

### 🛡️ **Enterprise Features:**
- Complete audit trail
- Data validation and integrity
- Scalable architecture
- Security policies enabled

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase project logs
2. Verify all verification queries return expected results
3. Test basic application functionality
4. Ensure all environment variables are correctly set

Your comprehensive EAVI admission system database will be fully operational once these steps are completed! 🎓✨