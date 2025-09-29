import { supabase } from '../lib/supabase'
import type { Student, Course, EmailLog, AdminSetting } from '../lib/supabase'
import { logger } from '../utils/logger'

export class SupabaseService {
  // Student operations
  static async getStudents(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('applied_at', { ascending: false })

      if (error) {
        logger.error('Error fetching students', error, 'SupabaseService.getStudents')
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to fetch students', error, 'SupabaseService.getStudents')
      throw error
    }
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        logger.error('Error fetching student', error, 'SupabaseService.getStudentById')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to fetch student', error, 'SupabaseService.getStudentById')
      throw error
    }
  }

  static async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          full_name: studentData.full_name,
          admission_number: studentData.admission_number,
          email: studentData.email || null,
          phone: studentData.phone,
          course: studentData.course,
          kcse_grade: studentData.kcse_grade || null,
          location: studentData.location || null,
          status: studentData.status,
          source: studentData.source,
          applied_at: studentData.applied_at
        }])
        .select()
        .single()

      if (error) {
        logger.error('Error creating student', error, 'SupabaseService.createStudent')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to create student', error, 'SupabaseService.createStudent')
      throw error
    }
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    try {
      const updateData: any = {}
      
      // Only update the simple essential fields
      if (updates.full_name !== undefined) updateData.full_name = updates.full_name
      if (updates.admission_number !== undefined) updateData.admission_number = updates.admission_number
      if (updates.email !== undefined) updateData.email = updates.email || null
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.course !== undefined) updateData.course = updates.course
      if (updates.kcse_grade !== undefined) updateData.kcse_grade = updates.kcse_grade || null
      if (updates.location !== undefined) updateData.location = updates.location || null
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.source !== undefined) updateData.source = updates.source
      if (updates.applied_at !== undefined) updateData.applied_at = updates.applied_at

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating student', error, 'SupabaseService.updateStudent')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to update student', error, 'SupabaseService.updateStudent')
      throw error
    }
  }

  static async deleteStudent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('Error deleting student', error, 'SupabaseService.deleteStudent')
        throw error
      }
    } catch (error) {
      logger.error('Failed to delete student', error, 'SupabaseService.deleteStudent')
      throw error
    }
  }

  static async updateStudentStatus(id: string, status: string): Promise<Student> {
    try {
      logger.info(`Updating student ${id} status to: ${status}`, { id, status }, 'SupabaseService.updateStudentStatus')
      
      const { data, error } = await supabase
        .from('students')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating student status', error, 'SupabaseService.updateStudentStatus')
        throw error
      }

      logger.info(`Successfully updated student status`, data, 'SupabaseService.updateStudentStatus')
      return data
    } catch (error) {
      logger.error('Failed to update student status', error, 'SupabaseService.updateStudentStatus')
      throw error
    }
  }

  static async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('students')
        .select('id')
        .ilike('email', email)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Error checking email', error, 'SupabaseService.checkEmailExists')
        throw error
      }

      return (data?.length || 0) > 0
    } catch (error) {
      logger.error('Failed to check email', error, 'SupabaseService.checkEmailExists')
      throw error
    }
  }

  // Course operations
  static async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        logger.error('Error fetching courses', error, 'SupabaseService.getCourses')
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to fetch courses', error, 'SupabaseService.getCourses')
      throw error
    }
  }

  static async getCourseById(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching course', error, 'SupabaseService.getCourseById')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to fetch course', error, 'SupabaseService.getCourseById')
      throw error
    }
  }

  static async createCourse(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          name: courseData.name,
          fee_balance: courseData.fee_balance,
          fee_per_year: courseData.fee_per_year
        }])
        .select()
        .single()

      if (error) {
        logger.error('Error creating course', error, 'SupabaseService.createCourse')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to create course', error, 'SupabaseService.createCourse')
      throw error
    }
  }

  static async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    try {
      const updateData: any = {}
      
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.fee_balance !== undefined) updateData.fee_balance = updates.fee_balance
      if (updates.fee_per_year !== undefined) updateData.fee_per_year = updates.fee_per_year

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating course', error, 'SupabaseService.updateCourse')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to update course', error, 'SupabaseService.updateCourse')
      throw error
    }
  }

  static async deleteCourse(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('Error deleting course', error, 'SupabaseService.deleteCourse')
        throw error
      }
    } catch (error) {
      logger.error('Failed to delete course', error, 'SupabaseService.deleteCourse')
      throw error
    }
  }

  // Email log operations
  static async getEmailLogs(): Promise<EmailLog[]> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50) // Limit to last 50 emails

      if (error) {
        logger.error('Error fetching email logs', error, 'SupabaseService.getEmailLogs')
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to fetch email logs', error, 'SupabaseService.getEmailLogs')
      throw error
    }
  }

  static async createEmailLog(emailData: Omit<EmailLog, 'id' | 'created_at'>): Promise<EmailLog> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .insert([{
          type: emailData.type,
          to_email: emailData.to,
          subject: emailData.subject,
          student_name: emailData.student_name,
          student_id: emailData.student_id || null,
          sent_at: emailData.sent_at,
          status: emailData.status
        }])
        .select()
        .single()

      if (error) {
        logger.error('Error creating email log', error, 'SupabaseService.createEmailLog')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to create email log', error, 'SupabaseService.createEmailLog')
      throw error
    }
  }

  // Utility functions
  static async generateAdmissionNumber(): Promise<string> {
    try {
      // Get the admin setting for starting number
      const startingNumberSetting = await this.getSetting('admissionStartingNumber')
      const adminStartingNumber = startingNumberSetting?.value ? parseInt(startingNumberSetting.value) : 1000
      
      // Get all existing admission numbers to find the highest one
      const { data, error } = await supabase
        .from('students')
        .select('admission_number')
        .like('admission_number', 'EAVI/%/25')
        .order('admission_number', { ascending: false })
        .limit(1)

      if (error) {
        logger.warn('Error getting existing admission numbers, using admin starting number', error, 'SupabaseService.generateAdmissionNumber')
        // Use admin starting number as fallback
        return `EAVI/${String(adminStartingNumber).padStart(4, '0')}/25`
      }

      if (data && data.length > 0) {
        // Extract number from existing admission number (e.g., "EAVI/0003/25" -> 3)
        const lastNumber = data[0].admission_number.match(/EAVI\/(\d+)\/25/)
        if (lastNumber) {
          const existingNumber = parseInt(lastNumber[1])
          const nextNumber = Math.max(existingNumber + 1, adminStartingNumber)
          return `EAVI/${String(nextNumber).padStart(4, '0')}/25`
        }
      }

      // If no existing numbers, use admin starting number
      return `EAVI/${String(adminStartingNumber).padStart(4, '0')}/25`
    } catch (error) {
      logger.warn('Failed to generate admission number, using admin starting number', error, 'SupabaseService.generateAdmissionNumber')
      // Fallback to admin starting number
      try {
        const startingNumberSetting = await this.getSetting('admissionStartingNumber')
        const adminStartingNumber = startingNumberSetting?.value ? parseInt(startingNumberSetting.value) : 1000
        return `EAVI/${String(adminStartingNumber).padStart(4, '0')}/25`
      } catch {
        return `EAVI/${Date.now().toString().slice(-4)}/25`
      }
    }
  }

  // Search and filter functions
  static async searchStudents(query: string, statusFilter?: string): Promise<Student[]> {
    try {
      let supabaseQuery = supabase
        .from('students')
        .select('*')

      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,course.ilike.%${query}%,admission_number.ilike.%${query}%,kcse_grade.ilike.%${query}%`
        )
      }

      if (statusFilter && statusFilter !== 'All') {
        supabaseQuery = supabaseQuery.eq('status', statusFilter)
      }

      const { data, error } = await supabaseQuery.order('applied_at', { ascending: false })

      if (error) {
        logger.error('Error searching students', error, 'SupabaseService.searchStudents')
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to search students', error, 'SupabaseService.searchStudents')
      throw error
    }
  }

  // Admin settings operations
  static async getSettings(): Promise<AdminSetting[]> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('key', { ascending: true })

      if (error) {
        logger.error('Error fetching admin settings', error, 'SupabaseService.getSettings')
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to fetch admin settings', error, 'SupabaseService.getSettings')
      throw error
    }
  }

  static async getSetting(key: string): Promise<AdminSetting | null> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', key)
        .single()

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching admin setting', error, 'SupabaseService.getSetting')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to fetch admin setting', error, 'SupabaseService.getSetting')
      throw error
    }
  }

  static async setSetting(key: string, value: string, description?: string): Promise<AdminSetting> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value,
          description: description || null
        }, {
          onConflict: 'key'
        })
        .select()
        .single()

      if (error) {
        logger.error('Error setting admin setting', error, 'SupabaseService.setSetting')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to set admin setting', error, 'SupabaseService.setSetting')
      throw error
    }
  }

  // Admission Number Management
  static async getNextAdmissionNumber(): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('get_next_admission_number')

      if (error) {
        logger.error('Error getting next admission number', error, 'SupabaseService.getNextAdmissionNumber')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to get next admission number', error, 'SupabaseService.getNextAdmissionNumber')
      throw error
    }
  }

  static async initializeAdmissionCounter(startingNumber: number, prefix: string = 'EAVI'): Promise<boolean> {
    try {
      logger.info(`Initializing admission counter with starting number: ${startingNumber}, prefix: ${prefix}`, 
        { startingNumber, prefix }, 'SupabaseService.initializeAdmissionCounter')
      
      const { data, error } = await supabase
        .rpc('initialize_admission_counter', {
          starting_number: startingNumber,
          new_prefix: prefix
        })

      if (error) {
        logger.error('Error initializing admission counter', error, 'SupabaseService.initializeAdmissionCounter')
        throw error
      }

      logger.info('Successfully initialized admission counter', data, 'SupabaseService.initializeAdmissionCounter')
      return data
    } catch (error) {
      logger.error('Failed to initialize admission counter', error, 'SupabaseService.initializeAdmissionCounter')
      throw error
    }
  }

  static async getAdmissionCounterStatus(): Promise<{
    current_number: number;
    prefix: string;
    next_number: string;
    last_updated: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_admission_counter_status')

      if (error) {
        logger.error('Error getting admission counter status', error, 'SupabaseService.getAdmissionCounterStatus')
        throw error
      }

      return data && data.length > 0 ? data[0] : null
    } catch (error) {
      logger.error('Failed to get admission counter status', error, 'SupabaseService.getAdmissionCounterStatus')
      throw error
    }
  }

  static async validateAdmissionNumber(admissionNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('validate_admission_number', {
          admission_num: admissionNumber
        })

      if (error) {
        logger.error('Error validating admission number', error, 'SupabaseService.validateAdmissionNumber')
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to validate admission number', error, 'SupabaseService.validateAdmissionNumber')
      throw error
    }
  }

  // Enhanced createStudent method that auto-generates admission numbers
  static async createStudentWithAutoAdmission(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'admission_number'>): Promise<Student> {
    try {
      // Generate admission number automatically
      const admissionNumber = await this.getNextAdmissionNumber()
      
      // Create student with generated admission number
      const newStudent = await this.createStudent({
        ...studentData,
        admission_number: admissionNumber
      })
      
      logger.info(`Successfully created student with auto-generated admission number: ${admissionNumber}`, 
        newStudent, 'SupabaseService.createStudentWithAutoAdmission')
      
      return newStudent
    } catch (error) {
      logger.error('Failed to create student with auto admission number', error, 'SupabaseService.createStudentWithAutoAdmission')
      throw error
    }
  }

  // Smart counter initialization with duplicate prevention
  static async initializeAdmissionCounterSafe(startingNumber: number, prefix: string = 'EAVI'): Promise<{
    success: boolean;
    message: string;
    actualStartingNumber: number;
    nextNumber: string;
  }> {
    try {
      logger.info(`Safely initializing admission counter with starting number: ${startingNumber}`, 
        { startingNumber, prefix }, 'SupabaseService.initializeAdmissionCounterSafe')
      
      const { data, error } = await supabase
        .rpc('initialize_admission_counter_safe', {
          starting_number: startingNumber,
          new_prefix: prefix
        })

      if (error) {
        logger.error('Error safely initializing admission counter', error, 'SupabaseService.initializeAdmissionCounterSafe')
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result) {
        throw new Error('No result returned from safe counter initialization')
      }

      logger.info('Successfully initialized admission counter safely', result, 'SupabaseService.initializeAdmissionCounterSafe')
      return {
        success: result.success,
        message: result.message,
        actualStartingNumber: result.actual_starting_number,
        nextNumber: result.next_number
      }
    } catch (error) {
      logger.error('Failed to safely initialize admission counter', error, 'SupabaseService.initializeAdmissionCounterSafe')
      throw error
    }
  }

  // Check for potential admission number conflicts
  static async checkAdmissionNumberConflicts(startingNumber: number, prefix: string = 'EAVI'): Promise<{
    wouldConflict: boolean;
    highestExisting: number;
    suggestedStarting: number;
    conflictingNumbers: string[];
  }> {
    try {
      const { data, error } = await supabase
        .rpc('check_admission_number_conflicts', {
          starting_number: startingNumber,
          new_prefix: prefix
        })

      if (error) {
        logger.error('Error checking admission number conflicts', error, 'SupabaseService.checkAdmissionNumberConflicts')
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result) {
        return {
          wouldConflict: false,
          highestExisting: 0,
          suggestedStarting: startingNumber,
          conflictingNumbers: []
        }
      }

      return {
        wouldConflict: result.would_conflict,
        highestExisting: result.highest_existing,
        suggestedStarting: result.suggested_starting,
        conflictingNumbers: result.conflicting_numbers || []
      }
    } catch (error) {
      logger.error('Failed to check admission number conflicts', error, 'SupabaseService.checkAdmissionNumberConflicts')
      throw error
    }
  }
}
