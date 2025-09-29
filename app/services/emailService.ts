import { SupabaseService } from './supabaseService'

// Email service for handling student notifications
export interface EmailData {
  to: string
  subject: string
  htmlContent: string
  attachments?: Array<{
    name: string
    content: string
    type: string
  }>
}

// Since we can't send actual emails from the frontend, we'll simulate the process
// In a real app, this would connect to an email service like SendGrid, AWS SES, etc.
export class EmailService {
  
  // Send real application confirmation email via Gmail SMTP
  static async sendApplicationConfirmation(studentData: {
    fullName: string
    email: string
    course: string
    appliedAt: string
  }): Promise<boolean> {
    try {
      console.log('📧 Sending application confirmation email to:', studentData.email)
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'application_confirmation',
          studentData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Application confirmation email sent successfully:', result.messageId)
        // Store email log in Supabase
        await this.logEmailToSupabase('application_confirmation', {
          to: studentData.email,
          subject: "Application Received - East Africa Vision Institute",
          htmlContent: ''
        }, studentData.fullName)
        return true
      } else {
        console.error('❌ Failed to send application confirmation email:', result.error)
        return false
      }
    } catch (error) {
      console.error('Failed to send application confirmation email:', error)
      return false
    }
  }

  // Send real admission PDF email via Gmail SMTP
  static async sendAdmissionPDF(studentData: {
    fullName: string
    email: string
    course: string
    admissionNumber: string
    pdfBytes: Uint8Array
  }): Promise<boolean> {
    try {
      // Convert PDF bytes to base64 for API transmission
      const pdfBase64 = this.uint8ArrayToBase64(studentData.pdfBytes)
      
      console.log('📧 Sending admission PDF email to:', studentData.email, {
        attachmentSize: `${Math.round(studentData.pdfBytes.length / 1024)}KB`
      })
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'admission_pdf',
          studentData,
          pdfBytes: pdfBase64
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Admission PDF email sent successfully:', result.messageId)
        // Store email log in Supabase
        await this.logEmailToSupabase('admission_pdf', {
          to: studentData.email,
          subject: `Congratulations! Your Admission to EAVI - ${studentData.admissionNumber}`,
          htmlContent: ''
        }, studentData.fullName)
        return true
      } else {
        console.error('❌ Failed to send admission PDF email:', result.error)
        console.error('Response details:', result)
        return false
      }
    } catch (error) {
      console.error('Failed to send admission PDF email:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      return false
    }
  }


  // Utility: Convert Uint8Array to base64
  private static uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = ''
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Log email to Supabase
  private static async logEmailToSupabase(type: string, emailData: EmailData, studentName: string) {
    try {
      await SupabaseService.createEmailLog({
        type,
        to: emailData.to,
        subject: emailData.subject,
        student_name: studentName,
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
    } catch (error) {
      console.error('Failed to log email to Supabase:', error)
    }
  }

  // Get email logs from Supabase
  static async getEmailLogs(): Promise<any[]> {
    try {
      return await SupabaseService.getEmailLogs()
    } catch (error) {
      console.error('Failed to get email logs from Supabase:', error)
      return []
    }
  }
}