import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '../../../services/supabaseService'
import { PDFService } from '../../../services/pdfService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params
  try {
    console.log('📄 PDF Download request for student:', studentId)
    
    // Get student data from Supabase
    const students = await SupabaseService.getStudents()
    const student = students.find(s => s.id === studentId)
    
    if (!student) {
      console.error('❌ Student not found:', studentId)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    
    console.log('✅ Student found:', student.full_name)
    
    // Format student data for PDF generation
    const formattedStudent = {
      id: student.id,
      fullName: student.full_name,
      admissionNumber: student.admission_number,
      email: student.email || '',
      phone: student.phone,
      course: student.course,
      status: student.status,
      kcseGrade: student.kcse_grade,
      location: student.location,
      appliedAt: student.applied_at
    }
    
    // Get reporting date from settings
    const reportingDateSetting = await SupabaseService.getSetting('reportingDate')
    const reportingDate = reportingDateSetting?.value || ''
    
    // Generate PDF with reporting date from settings
    const pdfBlob = await PDFService.generateAdmissionLetter(formattedStudent, reportingDate)
    const pdfBuffer = await pdfBlob.arrayBuffer()
    
    // Generate filename
    const filename = `${student.full_name.replace(/\s+/g, '_')}_Admission_Letter.pdf`
    
    console.log('✅ PDF generated successfully for:', student.full_name)
    
    // Return PDF as downloadable response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('❌ Error generating PDF for download:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: errorMessage },
      { status: 500 }
    )
  }
}