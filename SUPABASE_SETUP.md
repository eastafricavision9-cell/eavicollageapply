# Supabase Setup Guide for EAVI Student Management System

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. The EAVI project code

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `eavi-student-management` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to Kenya (e.g., `ap-southeast-1` - Singapore)
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon (public) key** (starts with `eyJhbGciOi...`)
   - **Service role key** (starts with `eyJhbGciOi...`) - Keep this secret!

## Step 3: Update Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Gmail Configuration (already configured)
GMAIL_EMAIL=eaviafrica@gmail.com
GMAIL_PASSWORD=cyeroelfhmblbnzp
```

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to the **SQL Editor**
2. Create a new query
3. Copy and paste the entire content from `database/schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `students` table for storing student applications
- `courses` table for managing available courses
- `email_logs` table for tracking sent emails
- Proper indexes for performance
- Default courses data

## Step 5: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three tables: `students`, `courses`, and `email_logs`
3. The `courses` table should have 6 default courses
4. Check that Row Level Security is enabled on all tables

## Step 6: Test the Integration

1. Stop your development server if it's running (`Ctrl+C`)
2. Start the development server: `npm run dev`
3. Test the application:
   - Submit a student application at `/apply`
   - Check admin dashboard at `/admin` (login with demo credentials)
   - Verify data appears in Supabase dashboard

## Step 7: Configure Row Level Security (Optional but Recommended)

For production, you may want to set up more restrictive RLS policies:

1. Go to **Authentication** > **Policies**
2. Modify the policies for each table based on your security requirements

## Troubleshooting

### Common Issues:

1. **Environment variables not loaded**:
   - Make sure `.env.local` is in the project root
   - Restart your development server after changing env vars
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser

2. **Database connection errors**:
   - Verify your Project URL and keys are correct
   - Check that your Supabase project is active
   - Make sure you're using the correct API endpoint

3. **SQL errors when creating tables**:
   - Make sure you copied the entire schema.sql content
   - Check for any syntax errors in the SQL
   - Some features might require the `uuid-ossp` extension

4. **RLS (Row Level Security) blocking requests**:
   - The default policies allow all operations
   - If you modified policies, make sure they allow your operations

## Features Enabled with Supabase

✅ **Real-time data synchronization**
✅ **Persistent data storage** (replaces localStorage)
✅ **Email notification logging**
✅ **Automatic admission number generation**
✅ **Duplicate email prevention**
✅ **Course management**
✅ **Student search and filtering**

## Data Migration from localStorage

The current setup will:
1. Continue to work with existing localStorage data
2. Gradually migrate to Supabase as you use the app
3. New applications will go directly to Supabase

## Next Steps

After setting up Supabase:
1. Test the complete application flow
2. Verify email notifications work
3. Check admin dashboard functionality
4. Consider setting up database backups
5. Plan for production deployment

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase project status
3. Test database connectivity in the Supabase dashboard
4. Check the network tab for failed API requests

---

**Important**: Keep your Service Role Key secret and never commit it to version control!