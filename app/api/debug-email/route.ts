import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Email Debug API called')
    
    // Check environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT ? '✅ Set' : '❌ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing',
      GMAIL_EMAIL: process.env.GMAIL_EMAIL ? '✅ Set' : '❌ Missing',
      GMAIL_PASSWORD: process.env.GMAIL_PASSWORD ? '✅ Set' : '❌ Missing',
    }
    
    // Check what values are being used
    const actualConfig = {
      user: process.env.SMTP_USER || process.env.GMAIL_EMAIL || 'eaviafrica@gmail.com',
      pass: process.env.SMTP_PASS || process.env.GMAIL_PASSWORD || 'cyeroelfhmblbnzp',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587'
    }
    
    console.log('Environment Variables Status:', envCheck)
    console.log('Actual Configuration (passwords masked):', {
      ...actualConfig,
      pass: actualConfig.pass ? `${actualConfig.pass.substring(0, 4)}****` : 'Not set'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Email configuration debug info',
      environmentVariables: envCheck,
      configuration: {
        ...actualConfig,
        pass: actualConfig.pass ? `${actualConfig.pass.substring(0, 4)}****` : 'Not set'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug API failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}