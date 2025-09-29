import { createClient } from '@supabase/supabase-js'

// Get environment variables - using updated project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaomcjovaiiuscbjjqch.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphb21jam92YWlpdXNjYmpqcWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzEwMTAsImV4cCI6MjA3NDQ0NzAxMH0.KhMuXnIFtjtkdBw7jM4bIott-4ueblqu1PkV1hoC8Ac'

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create the main Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// For server-side operations that need elevated permissions (optional)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceRoleKey ? 
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : supabase // Fallback to regular client if no service role key

// Database Types - Simple structure with only essential fields
export interface Student {
  id: string
  full_name: string
  admission_number: string  // System generates this (e.g., EAVI/0001/25)
  email?: string
  phone: string
  course: string
  kcse_grade?: string
  location?: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  source: 'manual' | 'online_application'
  applied_at: string  // Application date - automatically set
  created_at?: string
  updated_at?: string
}

export interface Course {
  id: string
  name: string
  fee_balance: number  // Current fee balance for this course
  fee_per_year: number  // Annual fee for this course
  created_at?: string
  updated_at?: string
}

export interface EmailLog {
  id: string
  type: string
  to: string
  subject: string
  student_name: string
  student_id?: string
  sent_at: string
  status: 'sent' | 'failed'
  created_at?: string
}

export interface AdminSetting {
  id: string
  key: string
  value: string
  description?: string
  created_at?: string
  updated_at?: string
}
