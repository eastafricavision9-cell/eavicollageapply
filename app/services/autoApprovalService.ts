import { SupabaseService } from './supabaseService'
import { EmailService } from './emailService'
import { generateAdmissionPDF } from '../utils/pdfGenerator'

export class AutoApprovalService {
  private static timers = new Map<string, NodeJS.Timeout>()

  // Schedule auto approval for a student
  static scheduleAutoApproval(studentId: string, delayMinutes: number = 5) {
    console.log(`🕐 Scheduling auto-approval for student ${studentId} in ${delayMinutes} minutes`)
    
    // Clear any existing timer for this student
    this.cancelAutoApproval(studentId)
    
    const delayMs = delayMinutes * 60 * 1000 // Convert minutes to milliseconds
    
    const timer = setTimeout(async () => {
      try {
        await this.processAutoApproval(studentId)
      } catch (error) {
        console.error(`❌ Auto-approval failed for student ${studentId}:`, error)
      } finally {
        // Clean up the timer reference
        this.timers.delete(studentId)
      }
    }, delayMs)
    
    // Store the timer reference
    this.timers.set(studentId, timer)
  }

  // Cancel auto approval for a student (e.g., when manually approved/rejected)
  static cancelAutoApproval(studentId: string) {
    const timer = this.timers.get(studentId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(studentId)
      console.log(`⏹️ Cancelled auto-approval for student ${studentId}`)
    }
  }

  // Process the actual auto approval
  private static async processAutoApproval(studentId: string) {
    try {
      console.log(`🤖 Processing auto-approval for student ${studentId}`)
      
      // Get the student details
      const student = await SupabaseService.getStudentById(studentId)
      if (!student) {
        console.log(`❌ Student ${studentId} not found for auto-approval`)
        return
      }

      // Check if student is still pending
      if (student.status !== 'Pending') {
        console.log(`⏭️ Student ${studentId} status is ${student.status}, skipping auto-approval`)
        return
      }

      // Update student status to Accepted
      await SupabaseService.updateStudent(studentId, { status: 'Accepted' })
      console.log(`✅ Auto-approved student: ${student.full_name}`)

      // Send admission email if student has email
      if (student.email) {
        await this.sendAutoApprovalEmail(student)
      }

    } catch (error) {
      console.error(`❌ Error in auto-approval process for ${studentId}:`, error)
    }
  }

  // Send admission email and PDF
  private static async sendAutoApprovalEmail(student: any) {
    try {
      console.log(`📧 Sending auto-approval email to ${student.email}`)
      
      // Get course information for PDF
      const courses = await SupabaseService.getCourses()
      const courseInfo = courses.find(c => c.name === student.course)
      
      // Get reporting date from settings
      const reportingDateSetting = await SupabaseService.getSetting('reporting_date')
      const reportingDate = reportingDateSetting?.value || ''

      // Generate admission PDF
      const studentDetails = {
        fullName: student.full_name,
        course: student.course,
        admissionNumber: student.admission_number,
        reportingDate,
        feeBalance: courseInfo?.fee_balance,
        feePerYear: courseInfo?.fee_per_year
      }
      
      const pdfBytes = await generateAdmissionPDF(studentDetails)
      
      // Send email with PDF attachment
      const emailSent = await EmailService.sendAdmissionPDF({
        fullName: student.full_name,
        email: student.email,
        course: student.course,
        admissionNumber: student.admission_number,
        pdfBytes
      })
      
      if (emailSent) {
        console.log(`✅ Auto-approval email sent successfully to ${student.email}`)
      } else {
        console.log(`⚠️ Failed to send auto-approval email to ${student.email}`)
      }
      
    } catch (error) {
      console.error('❌ Error sending auto-approval email:', error)
    }
  }

  // Check if auto-approval is enabled
  static async isAutoApprovalEnabled(): Promise<boolean> {
    try {
      const setting = await SupabaseService.getSetting('approval_mode')
      return setting?.value === 'automatic'
    } catch (error) {
      console.error('Error checking auto-approval setting:', error)
      return false
    }
  }

  // Get auto approval delay in minutes
  static async getAutoApprovalDelay(): Promise<number> {
    try {
      const setting = await SupabaseService.getSetting('auto_approval_delay')
      return parseInt(setting?.value || '5')
    } catch (error) {
      console.error('Error getting auto-approval delay:', error)
      return 5 // Default to 5 minutes
    }
  }

  // Initialize auto approval for existing pending students (on app start)
  static async initializeAutoApproval() {
    try {
      const isEnabled = await this.isAutoApprovalEnabled()
      if (!isEnabled) {
        console.log('🔘 Auto-approval is disabled')
        return
      }

      console.log('🚀 Initializing auto-approval system...')
      
      const delay = await this.getAutoApprovalDelay()
      const students = await SupabaseService.getStudents()
      const pendingStudents = students.filter(s => s.status === 'Pending')
      
      for (const student of pendingStudents) {
        // Calculate remaining time since application
        const appliedAt = new Date(student.applied_at).getTime()
        const now = Date.now()
        const elapsedMinutes = (now - appliedAt) / (1000 * 60)
        
        if (elapsedMinutes >= delay) {
          // Should have been auto-approved already, process immediately
          console.log(`⚡ Processing overdue auto-approval for ${student.full_name}`)
          await this.processAutoApproval(student.id)
        } else {
          // Schedule remaining time
          const remainingMinutes = delay - elapsedMinutes
          console.log(`⏰ Scheduling delayed auto-approval for ${student.full_name} in ${remainingMinutes.toFixed(1)} minutes`)
          this.scheduleAutoApproval(student.id, remainingMinutes)
        }
      }
      
    } catch (error) {
      console.error('Error initializing auto-approval:', error)
    }
  }

  // Clean up all timers (on app shutdown)
  static cleanup() {
    console.log('🧹 Cleaning up auto-approval timers')
    this.timers.forEach((timer, studentId) => {
      clearTimeout(timer)
      console.log(`⏹️ Cleared timer for student ${studentId}`)
    })
    this.timers.clear()
  }
}