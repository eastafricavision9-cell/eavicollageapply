import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  try {
    console.log('🧪 Testing email configuration...')
    
    // Check environment variables
    const emailConfig = {
      user: process.env.SMTP_USER || process.env.GMAIL_EMAIL,
      pass: process.env.SMTP_PASS || process.env.GMAIL_PASSWORD,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587'
    }
    
    console.log('Email config:', {
      ...emailConfig,
      pass: emailConfig.pass ? emailConfig.pass.substring(0, 4) + '****' : 'MISSING'
    })
    
    if (!emailConfig.user || !emailConfig.pass) {
      return NextResponse.json({
        success: false,
        error: 'Missing email credentials',
        config: emailConfig
      })
    }
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
      }
    })
    
    // Test connection
    console.log('Testing SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful')
    
    // Send test email
    console.log('Sending test email...')
    const result = await transporter.sendMail({
      from: {
        name: 'EAVI Test',
        address: emailConfig.user
      },
      to: emailConfig.user, // Send to self
      subject: 'Test Email - EAVI System',
      html: `
        <h1>✅ Email System Test Successful</h1>
        <p>This is a test email from your EAVI admission system.</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> Vercel Production Environment</p>
        <p>If you received this email, your email configuration is working correctly!</p>
      `
    })
    
    console.log('✅ Test email sent successfully:', result.messageId)
    
    return NextResponse.json({
      success: true,
      message: 'Email test completed successfully',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}