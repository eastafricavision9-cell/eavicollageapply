// Quick script to analyze PDF form fields
const { PDFDocument } = require('pdf-lib')
const fs = require('fs')
const path = require('path')

async function analyzePDFFields() {
  try {
    console.log('🔍 Analyzing PDF template fields...\n')
    
    // Load the PDF template
    const pdfPath = path.join(__dirname, '../public/admission_template.pdf')
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    
    console.log('📄 PDF loaded successfully!')
    console.log('📊 Number of pages:', pdfDoc.getPageCount())
    
    // Get the form
    const form = pdfDoc.getForm()
    
    if (!form) {
      console.log('❌ No form found in PDF')
      return
    }
    
    // Get all fields
    const fields = form.getFields()
    console.log(`\n📝 Found ${fields.length} form fields:\n`)
    
    if (fields.length === 0) {
      console.log('❌ No form fields found. This might be a static PDF without fillable fields.')
      console.log('\n💡 Common field names to look for in templates:')
      console.log('   • student_name, fullName, name')
      console.log('   • admission_number, admissionNumber')
      console.log('   • course, course_name')
      console.log('   • date, admission_date')
      console.log('   • phone, email')
      console.log('   • location, county')
      console.log('   • kcse_grade, grade')
      return
    }
    
    // Analyze each field
    fields.forEach((field, index) => {
      console.log(`${index + 1}. Field: "${field.getName()}"`)
      console.log(`   Type: ${field.constructor.name}`)
      
      try {
        // Try to get current value if any
        if ('getText' in field) {
          const currentValue = field.getText()
          console.log(`   Current value: "${currentValue}"`)
        } else if ('getSelected' in field) {
          const options = field.getOptions()
          const selected = field.getSelected()
          console.log(`   Options: [${options.join(', ')}]`)
          console.log(`   Selected: [${selected.join(', ')}]`)
        } else if ('isChecked' in field) {
          const checked = field.isChecked()
          console.log(`   Checked: ${checked}`)
        }
      } catch (e) {
        console.log(`   Value: (unable to read)`)
      }
      
      console.log('') // Empty line for readability
    })
    
    // Additional PDF info
    console.log('\n📋 PDF Metadata:')
    const info = pdfDoc.getDocumentInfo()
    if (info.Title) console.log(`   Title: ${info.Title}`)
    if (info.Author) console.log(`   Author: ${info.Author}`)
    if (info.Subject) console.log(`   Subject: ${info.Subject}`)
    if (info.Creator) console.log(`   Creator: ${info.Creator}`)
    
    console.log('\n✅ Analysis complete!')
    
  } catch (error) {
    console.error('❌ Error analyzing PDF:', error.message)
    
    if (error.message.includes('pdf-lib')) {
      console.log('\n💡 Installing pdf-lib...')
      console.log('Run: npm install pdf-lib')
    }
  }
}

// Run the analysis
analyzePDFFields()