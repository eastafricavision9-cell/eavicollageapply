const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function checkReportingDateField() {
  try {
    console.log('🔍 Looking for REPORTING DATE field in PDF...\n');
    const pdfBytes = fs.readFileSync('./public/admission_template.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('=== ALL PDF FIELDS ===');
    console.log('Total fields found:', fields.length);
    console.log('');
    
    let reportingDateField = null;
    
    fields.forEach((field, index) => {
      try {
        const name = field.getName();
        const type = field.constructor.name;
        const currentValue = field.getText ? field.getText() : 'N/A';
        
        console.log(`${index + 1}. Field Name: "${name}"`);
        console.log(`   Type: ${type}`);
        console.log(`   Current Value: "${currentValue}"`);
        
        // Check if this is the reporting date field
        if (currentValue.toLowerCase().includes('reporting date') || 
            currentValue.toLowerCase().includes('report date') ||
            name.toLowerCase().includes('reporting') ||
            name.toLowerCase().includes('report')) {
          reportingDateField = { name, value: currentValue };
          console.log(`   🎯 FOUND REPORTING DATE FIELD! 🎯`);
        }
        
        console.log('');
      } catch (e) {
        console.log(`${index + 1}. Error reading field: ${e.message}`);
      }
    });
    
    if (reportingDateField) {
      console.log('=== REPORTING DATE FIELD DETAILS ===');
      console.log(`Field Name: "${reportingDateField.name}"`);
      console.log(`Field Value: "${reportingDateField.value}"`);
      console.log('');
      console.log('📝 CODE UPDATE NEEDED:');
      console.log(`Add this to PDF generator:`);
      console.log(`const reportingDateField = form.getTextField('${reportingDateField.name}')`);
      console.log(`reportingDateField.setText(dateToUse)`);
    } else {
      console.log('❌ No reporting date field found');
      console.log('Available field values:', fields.map(f => f.getText ? f.getText() : 'N/A'));
    }
    
  } catch (error) {
    console.error('❌ Error analyzing PDF:', error.message);
  }
}

checkReportingDateField();