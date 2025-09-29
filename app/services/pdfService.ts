import { PDFDocument } from 'pdf-lib'
import { SupabaseService } from './supabaseService'

export class PDFService {
  /**
   * Generate admission letter by filling the PDF template with student data
   * Based on the actual form fields found in the admission_template.pdf
   */
  static async generateAdmissionLetter(student: {
    fullName: string
    admissionNumber: string
    email: string
    phone: string
    course: string
    status: string
    kcseGrade?: string
    location?: string
    appliedAt?: string
  }, reportingDate?: string): Promise<Blob> {
    try {
      console.log('🎓 Generating admission letter for:', student.fullName)
      
      // Load the PDF template
      const templateResponse = await fetch('/admission_template.pdf')
      if (!templateResponse.ok) {
        throw new Error(`Failed to load admission template: ${templateResponse.status}`)
      }
      
      const templateArrayBuffer = await templateResponse.arrayBuffer()
      const pdfDoc = await PDFDocument.load(templateArrayBuffer)
      
      console.log('📄 PDF template loaded successfully')
      
      // Get the form from the PDF
      const form = pdfDoc.getForm()
      
      if (!form) {
        throw new Error('No form found in PDF template')
      }
      
      // Get current date for various date fields
      const currentDate = new Date()
      const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
      
      // Use reporting date from admin settings or calculate default
      let formattedReportingDate: string
      if (reportingDate) {
        // Use the reporting date from admin settings
        console.log('📅 Using reporting date from admin settings:', reportingDate)
        const settingsDate = new Date(reportingDate)
        formattedReportingDate = settingsDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        console.log('📅 Formatted reporting date:', formattedReportingDate)
      } else {
        // Fallback: Calculate reporting date (2 weeks from now)
        console.log('📅 No reporting date from settings, using fallback calculation')
        const defaultReportingDate = new Date()
        defaultReportingDate.setDate(defaultReportingDate.getDate() + 14)
        formattedReportingDate = defaultReportingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        console.log('📅 Fallback reporting date:', formattedReportingDate)
      }
      
      // Get fee information from courses table
      console.log('📊 Fetching course fee information for:', student.course)
      const courseInfo = await this.getCourseFeesFromDatabase(student.course)
      const feeBalance = courseInfo.feeBalance.toString()
      const totalFeePerYear = courseInfo.feePerYear.toString()
      
      console.log('📝 Filling PDF form fields...')
      
      // Map the exact field names from your PDF template to student data
      const fieldMappings = {
        // Student full names (appears in multiple fields)
        'text_1inxs': student.fullName,    // "student_full names"
        'text_7ijwa': student.fullName,    // "student_full names" 
        'text_8utet': student.fullName,    // "student_full names"
        'text_15n': student.fullName,      // "student_full names"
        
        // Course name (appears in multiple fields)
        'text_2zyxu': student.course,      // "course name"
        'text_9ynpv': student.course,      // "course name"
        
        // Admission number (appears in multiple fields)  
        'text_3ipjg': student.admissionNumber,  // "admision number"
        'text_14bkqt': student.admissionNumber, // "admision number"
        
        // Reporting date (from admin settings)
        'text_5khcd': formattedReportingDate,   // "reporting date"
        
        // Current date (appears in multiple fields)
        'text_6shix': formattedCurrentDate,     // "current date"
        'text_10xfmq': formattedCurrentDate,    // "current date"
        
        // Fee information
        'text_11uyvc': feeBalance,              // "fee balance"
        'text_12wzbr': totalFeePerYear,         // "total fee per year"
      }
      
      // Fill each field
      let fieldsFilledCount = 0
      for (const [fieldName, value] of Object.entries(fieldMappings)) {
        try {
          const field = form.getTextField(fieldName)
          field.setText(String(value))
          fieldsFilledCount++
          console.log(`✅ Filled "${fieldName}" with: "${value}"`)
        } catch (error) {
          console.warn(`⚠️ Could not fill field "${fieldName}":`, error instanceof Error ? error.message : String(error))
        }
      }
      
      console.log(`📊 Successfully filled ${fieldsFilledCount} out of ${Object.keys(fieldMappings).length} fields`)
      
      // Flatten the form to make it non-editable (optional)
      try {
        form.flatten()
        console.log('🔒 Form flattened (fields made non-editable)')
      } catch (error) {
        console.warn('⚠️ Could not flatten form:', error instanceof Error ? error.message : String(error))
      }
      
      // Save the filled PDF
      const pdfBytes = await pdfDoc.save()
      
      // Create and return blob
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      console.log('✅ PDF generated successfully! Size:', Math.round(blob.size / 1024), 'KB')
      
      return blob
      
    } catch (error) {
      console.error('❌ Error generating admission letter:', error)
      throw new Error(`Failed to generate admission letter: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Get course fee information from the database
   */
  private static async getCourseFeesFromDatabase(courseName: string): Promise<{ feeBalance: number; feePerYear: number }> {
    try {
      console.log('🔍 Looking up course fees for:', courseName)
      
      // Fetch course information from Supabase
      const courses = await SupabaseService.getCourses()
      const course = courses.find(c => c.name === courseName)
      
      if (course) {
        console.log('✅ Found course fees:', {
          feeBalance: course.fee_balance,
          feePerYear: course.fee_per_year
        })
        
        return {
          feeBalance: course.fee_balance,
          feePerYear: course.fee_per_year
        }
      } else {
        console.warn('⚠️ Course not found in database, using defaults for:', courseName)
        
        // Return default values if course not found
        return {
          feeBalance: 0,
          feePerYear: 150000
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching course fees:', error)
      
      // Return default values on error
      return {
        feeBalance: 0,
        feePerYear: 150000
      }
    }
  }
}