import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export interface StudentDetails {
  fullName: string
  course: string
  admissionNumber: string
  reportingDate?: string // Optional reporting date set by admin
  feeBalance?: number // Optional fee balance
  feePerYear?: number // Optional fee per year
}

export async function generateAdmissionPDF(studentDetails: StudentDetails): Promise<Uint8Array> {
  try {
    // Load the template PDF
    const templateResponse = await fetch('/admission_template.pdf')
    const templateArrayBuffer = await templateResponse.arrayBuffer()
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateArrayBuffer)
    
    // Get the form from the PDF
    const form = pdfDoc.getForm()
    
    // Use reporting date if provided, otherwise use current date
    let dateToUse: string
    if (studentDetails.reportingDate) {
      // Convert from YYYY-MM-DD to DD/MM/YYYY format
      const [year, month, day] = studentDetails.reportingDate.split('-')
      dateToUse = `${day}/${month}/${year}`
    } else {
      // Use current date as fallback
      dateToUse = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    }
    
    // Prepare date formatting (moved outside try block for fallback access)
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
    
    try {
      // Fill the form fields with student data using correct field names from PDF analysis
      console.log('📝 Filling PDF form fields with correct field names...')
      
      // Map the exact field names from your PDF template to student data
      const fieldMappings = {
        // Student full names (appears in multiple fields)
        'text_1inxs': studentDetails.fullName,   // "student_full names"
        'text_7ijwa': studentDetails.fullName,   // "student_full names"
        'text_8utet': studentDetails.fullName,   // "student_full names"
        'text_15n': studentDetails.fullName,     // "student_full names"
        
        // Course name (appears in multiple fields)
        'text_2zyxu': studentDetails.course,     // "course name"
        'text_9ynpv': studentDetails.course,     // "course name"
        
        // Admission number (appears in multiple fields)
        'text_3ipjg': studentDetails.admissionNumber,  // "admision number"
        'text_14bkqt': studentDetails.admissionNumber, // "admision number"
        
        // Reporting date
        'text_5khcd': dateToUse,                 // "reporting date"
        
        // Current date (appears in multiple fields)
        'text_6shix': currentDate,               // "current date"
        'text_10xfmq': currentDate,              // "current date"
        
        // Fee information
        'text_11uyvc': studentDetails.feeBalance ? 
          `KES ${studentDetails.feeBalance.toLocaleString()}` : 'CONTACT OFFICE',  // "fee balance"
        'text_12wzbr': studentDetails.feePerYear ? 
          `KES ${studentDetails.feePerYear.toLocaleString()}` : 'CONTACT OFFICE'   // "total fee per year"
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
      
      // Apply enhanced styling to fee fields if they were filled successfully
      try {
        const feeBalanceField = form.getTextField('text_11uyvc')
        feeBalanceField.updateAppearances(await pdfDoc.embedFont(StandardFonts.HelveticaBold))
        feeBalanceField.setFontSize(12)
      } catch (e) {
        // Fee balance field styling failed, but continue
      }
      
      try {
        const feePerYearField = form.getTextField('text_12wzbr')
        feePerYearField.updateAppearances(await pdfDoc.embedFont(StandardFonts.HelveticaBold))
        feePerYearField.setFontSize(12)
      } catch (e) {
        // Fee per year field styling failed, but continue
      }
      
    } catch (formError) {
      console.warn('Error filling form fields:', formError)
      // If form fields don't exist or have different names, fall back to text overlay
      console.log('Falling back to text overlay method')
      
      const page = pdfDoc.getPages()[0]
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const { width, height } = page.getSize()
      
      // Fallback text overlay positions (same as before)
      page.drawText(currentDate, {
        x: 750,
        y: height - 220,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText(studentDetails.fullName, {
        x: 80,
        y: height - 400,
        size: 11,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      })
      
      page.drawText(studentDetails.course, {
        x: 640,
        y: height - 550,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText(studentDetails.admissionNumber, {
        x: 270,
        y: height - 580,
        size: 11,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      })
      
      page.drawText(studentDetails.admissionNumber, {
        x: 410,
        y: height - 800,
        size: 11,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      })
    }
    
    // Generate and return PDF bytes
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate admission PDF: ' + (error instanceof Error ? error.message : String(error)))
  }
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  
  // Clean up
  URL.revokeObjectURL(url)
}

export function viewPDF(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  // Open in new tab
  window.open(url, '_blank')
  
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Debug function to list all form fields in a PDF
export async function debugPDFFields(): Promise<string[]> {
  try {
    const templateResponse = await fetch('/admission_template.pdf')
    const templateArrayBuffer = await templateResponse.arrayBuffer()
    const pdfDoc = await PDFDocument.load(templateArrayBuffer)
    const form = pdfDoc.getForm()
    
    const fields = form.getFields()
    const fieldNames = fields.map(field => {
      const name = field.getName()
      const type = field.constructor.name
      return `${name} (${type})`
    })
    
    console.log('Available PDF form fields:', fieldNames)
    return fieldNames
  } catch (error) {
    console.error('Error reading PDF fields:', error)
    return []
  }
}
