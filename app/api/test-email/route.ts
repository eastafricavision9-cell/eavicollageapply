import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Email test API called')
    
    const body = await request.json()
    const { testEmail = 'eaviafrica@gmail.com' } = body
    
    // Configuration with fallbacks
    const emailConfig = {
      user: process.env.SMTP_USER || process.env.GMAIL_EMAIL || 'eaviafrica@gmail.com',
      pass: process.env.SMTP_PASS || process.env.GMAIL_PASSWORD || 'cyeroelfhmblbnzp',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587')
    }
    
    console.log('📧 Email configuration (password masked):', {
      ...emailConfig,
      pass: `${emailConfig.pass.substring(0, 4)}****`
    })
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
      }
    })
    
    console.log('🔍 Verifying transporter...')
    
    // Test connection first
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError)
      return NextResponse.json({
        success: false,
        error: 'SMTP verification failed',
        details: verifyError instanceof Error ? verifyError.message : String(verifyError),
        config: {
          ...emailConfig,
          pass: `${emailConfig.pass.substring(0, 4)}****`
        }
      }, { status: 500 })
    }
    
    console.log('📤 Sending test email...')
    
    // Send test email
    const result = await transporter.sendMail({
      from: {
        name: 'EAVI Email Test',
        address: emailConfig.user
      },
      to: testEmail,
      subject: '🧪 Email System Test - EAVI Dashboard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🎉 Email Test Successful!</h2>
          <p>This email confirms that the EAVI admission dashboard email system is working correctly.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">✅ Test Results:</h3>
            <ul style="margin: 0;">
              <li>SMTP Connection: ✅ Success</li>
              <li>Authentication: ✅ Success</li>
              <li>Email Delivery: ✅ Success</li>
              <li>HTML Rendering: ✅ Success</li>
            </ul>
          </div>
          
          <p><strong>Test Details:</strong></p>
          <ul>
            <li><strong>From:</strong> ${emailConfig.user}</li>
            <li><strong>To:</strong> ${testEmail}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Host:</strong> ${emailConfig.host}</li>
            <li><strong>Port:</strong> ${emailConfig.port}</li>
          </ul>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;"><strong>🎊 Your email system is ready!</strong></p>
            <p style="margin: 5px 0 0 0; color: #166534;">Students will now receive admission letters when approved.</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            East Africa Vision Institute<br>
            Leading the leaders. Nurturing quality and affordable education.<br>
            Eldoret, Kenya
          </p>
        </div>
      `
    })
    
    console.log('✅ Test email sent successfully!')
    console.log('Message ID:', result.messageId)
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      config: {
        ...emailConfig,
        pass: `${emailConfig.pass.substring(0, 4)}****`
      },
      testEmail,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Email test failed:', error)
    
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      errno: error.errno,
      syscall: error.syscall
    }
    
    console.error('Error details:', errorDetails)
    
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error.message,
      errorInfo: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Email test endpoint. Use POST with { "testEmail": "your@email.com" } to test email functionality.',
    usage: 'POST /api/test-email',
    body: {
      testEmail: 'optional-email@example.com'
    }
  })
}