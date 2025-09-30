import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  try {
    console.log('🔍 Basic email test started')
    
    // Get credentials
    const user = process.env.GMAIL_EMAIL || 'eaviafrica@gmail.com'
    const pass = process.env.GMAIL_PASSWORD || 'cyeroelfhmblbnzp'
    
    console.log('Using email:', user)
    console.log('Password available:', pass ? 'YES' : 'NO')
    
    // Create very simple transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      }
    })
    
    console.log('Transporter created')
    
    // Very simple email
    const mailOptions = {
      from: user,
      to: user, // Send to self
      subject: 'SIMPLE TEST - EAVI System',
      text: 'This is a simple test email. If you receive this, the email system works!'
    }
    
    console.log('Sending email...')
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    
    return NextResponse.json({
      success: true,
      message: 'Basic email sent successfully!',
      messageId: result.messageId,
      to: user
    })
    
  } catch (error) {
    console.error('❌ Basic email test failed:', error)
    
    // Get detailed error info
    const errorInfo = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    }
    
    return NextResponse.json({
      success: false,
      error: 'Basic email test failed',
      details: errorInfo,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}