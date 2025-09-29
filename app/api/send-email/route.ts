import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// SMTP configuration with multiple environment variable options
const smtpConfig = {
  ...(process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  } : {
    service: 'gmail', // fallback to Gmail service
  }),
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_EMAIL || 'eaviafrica@gmail.com',
    pass: process.env.SMTP_PASS || process.env.GMAIL_PASSWORD || 'cyeroelfhmblbnzp' // App password
  }
}

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig)

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error)
  } else {
    console.log('✅ Email server is ready to take our messages')
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API called')
    const body = await request.json()
    const { type, studentData, pdfBytes } = body
    
    console.log('Email request details:', { 
      type, 
      studentEmail: studentData?.email,
      hasAttachment: !!pdfBytes 
    })

    let mailOptions: any

    if (type === 'application_confirmation') {
      mailOptions = {
        from: {
          name: 'East Africa Vision Institute',
          address: 'eaviafrica@gmail.com'
        },
        to: studentData.email,
        subject: 'Application Received - East Africa Vision Institute',
        html: generateApplicationConfirmationHTML(studentData)
      }
    } else if (type === 'admission_pdf') {
      mailOptions = {
        from: {
          name: 'East Africa Vision Institute',
          address: 'eaviafrica@gmail.com'
        },
        to: studentData.email,
        subject: `🎉 Congratulations! Your Admission to EAVI - ${studentData.admissionNumber}`,
        html: generateAdmissionPDFHTML(studentData),
        attachments: [
          {
            filename: `${studentData.fullName}-Admission-Letter.pdf`,
            content: Buffer.from(pdfBytes, 'base64'),
            contentType: 'application/pdf'
          }
        ]
      }
    }

    console.log('📤 Attempting to send email to:', mailOptions.to)
    
    // Send email
    const result = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email sent successfully:', result.messageId)
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully' 
    })

  } catch (error) {
    console.error('❌ Error sending email:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// HTML template for application confirmation
function generateApplicationConfirmationHTML(studentData: {
  fullName: string
  email: string
  course: string
  appliedAt: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received - EAVI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 24px; }
        .highlight { background: linear-gradient(135deg, #e0f2fe, #b3e5fc); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6; }
        .highlight h3 { margin: 0 0 15px 0; color: #1565c0; font-size: 18px; }
        .highlight p { margin: 8px 0; }
        .highlight strong { color: #0d47a1; }
        .steps { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .steps h3 { color: #1f2937; margin: 0 0 15px 0; }
        .steps ol { margin: 0; padding-left: 20px; }
        .steps li { margin: 8px 0; color: #4b5563; }
        .contact-info { background: #fff8e1; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107; }
        .contact-info h3 { color: #f57f17; margin: 0 0 15px 0; }
        .contact-info ul { margin: 0; padding-left: 20px; list-style: none; }
        .contact-info li { margin: 8px 0; color: #795548; }
        .contact-info li:before { content: "📧 "; margin-right: 8px; }
        .contact-info li:nth-child(1):before { content: "📱 "; }
        .contact-info li:nth-child(2):before { content: "📱 "; }
        .contact-info li:nth-child(3):before { content: "📧 "; }
        .contact-info li:nth-child(4):before { content: ""; }
        .footer { background: #1f2937; color: #d1d5db; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; }
        .footer .motto { font-style: italic; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 East Africa Vision Institute</h1>
          <p>Application Received Successfully</p>
        </div>
        <div class="content">
          <h2>Dear ${studentData.fullName},</h2>
          <p>Thank you for submitting your application to East Africa Vision Institute. We have successfully received your application and it is now under review by our admissions team.</p>
          
          <div class="highlight">
            <h3>📋 Application Summary:</h3>
            <p><strong>Course:</strong> ${studentData.course}</p>
            <p><strong>Email:</strong> ${studentData.email}</p>
            <p><strong>Applied Date:</strong> ${new Date(studentData.appliedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Status:</strong> Under Review</p>
          </div>
          
          <div class="steps">
            <h3>What Happens Next?</h3>
            <ol>
              <li>Our admissions team will carefully review your application</li>
              <li>You will receive a decision within 3-5 business days</li>
              <li>If accepted, you'll receive your official admission letter with all details</li>
              <li>If we need additional information, we'll contact you directly</li>
            </ol>
          </div>
          
          <div class="contact-info">
            <h3>📞 Contact Information</h3>
            <p>If you have any questions or need assistance, please don't hesitate to reach out:</p>
            <ul>
              <li>0726022044 or 0748022044</li>
              <li>WhatsApp: +254 726 022 044</li>
              <li>Info.eavi.college.it.depertment@gmail.com</li>
              <li>Town Office: Skymart Building, 1st Floor, Room F45, next to Raiya Supermarket</li>
            </ul>
          </div>
          
          <p>We appreciate your interest in EAVI and look forward to potentially welcoming you to our community of future leaders. Your journey toward academic excellence and professional success starts here!</p>
          
          <p>Best regards,<br><strong>East Africa Vision Institute Admissions Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2025 East Africa Vision Institute. All rights reserved.</p>
          <p class="motto">Leading the leaders. Nurturing quality and affordable education.</p>
          <p><img src="https://eavi.example/location.webp" alt="Location" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;"/> Eldoret, Kenya</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// HTML template for admission PDF email
function generateAdmissionPDFHTML(studentData: {
  fullName: string
  email: string
  course: string
  admissionNumber: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations! Admission Approved - EAVI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f0f9ff; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px 30px; text-align: center; position: relative; }
        .header::before { content: '🎉'; font-size: 48px; display: block; margin-bottom: 10px; }
        .header h1 { margin: 0 0 10px 0; font-size: 32px; font-weight: bold; }
        .header p { margin: 0; font-size: 18px; opacity: 0.95; }
        .celebration { background: linear-gradient(135deg, #fef3c7, #fbbf24); color: #92400e; padding: 25px; text-align: center; margin: 0; }
        .celebration h2 { margin: 0 0 10px 0; font-size: 24px; }
        .celebration p { margin: 0; font-size: 16px; font-weight: 500; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 24px; }
        .success-box { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-left: 6px solid #10b981; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .success-box h3 { margin: 0 0 15px 0; color: #065f46; font-size: 18px; }
        .success-box p { margin: 8px 0; color: #064e3b; }
        .success-box strong { color: #065f46; }
        .attachment-info { background: #e0f2fe; border: 2px dashed #0284c7; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; }
        .attachment-info h3 { color: #0c4a6e; margin: 0 0 15px 0; }
        .attachment-info p { color: #0369a1; margin: 0; }
        .steps { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .steps h3 { color: #1f2937; margin: 0 0 15px 0; }
        .steps ol { margin: 0; padding-left: 20px; }
        .steps li { margin: 12px 0; color: #4b5563; }
        .steps strong { color: #1f2937; }
        .contact-info { background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6; }
        .contact-info h3 { color: #1e40af; margin: 0 0 15px 0; }
        .contact-info ul { margin: 0; padding-left: 20px; list-style: none; }
        .contact-info li { margin: 10px 0; color: #1e3a8a; font-weight: 500; }
        .contact-info li:before { margin-right: 10px; }
        .contact-info li:nth-child(1):before { content: "📱"; }
        .contact-info li:nth-child(2):before { content: "📧"; }
        .contact-info li:nth-child(3):before { content: "🏢"; }
        .contact-info li:nth-child(4):before { content: "🎓"; }
        .footer { background: #1f2937; color: #d1d5db; padding: 30px; text-align: center; }
        .footer p { margin: 8px 0; }
        .footer .motto { font-style: italic; color: #9ca3af; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations!</h1>
          <p>You've been accepted to EAVI!</p>
        </div>
        <div class="celebration">
          <h2>🎓 Welcome to East Africa Vision Institute!</h2>
          <p>Your journey to academic excellence begins now!</p>
        </div>
        <div class="content">
          <h2>Dear ${studentData.fullName},</h2>
          <p>We are absolutely delighted to inform you that your application has been <strong>APPROVED</strong>! On behalf of the entire East Africa Vision Institute community, we extend our warmest congratulations and welcome you to our prestigious institution.</p>
          
          <div class="success-box">
            <h3>✅ Your Admission Details:</h3>
            <p><strong>Admission Number:</strong> ${studentData.admissionNumber}</p>
            <p><strong>Course:</strong> ${studentData.course}</p>
            <p><strong>Email:</strong> ${studentData.email}</p>
            <p><strong>Status:</strong> ACCEPTED ✅</p>
            <p><strong>Academic Year:</strong> 2024/2025</p>
          </div>
          
          <div class="attachment-info">
            <h3>📎 Official Admission Letter Attached</h3>
            <p>Your official admission letter is attached to this email as a PDF document. Please download, print, and save multiple copies for your records. You will need to present this document during registration and orientation.</p>
          </div>
          
          <div class="steps">
            <h3>🚀 Next Steps to Secure Your Place:</h3>
            <ol>
              <li><strong>Download & Print:</strong> Save the attached admission letter and print several copies</li>
              <li><strong>Fee Payment:</strong> Review the fee structure in your admission letter and make payment arrangements</li>
              <li><strong>Document Preparation:</strong> Gather all required documents as listed in your admission letter</li>
              <li><strong>Registration:</strong> Visit our campus for final registration and orientation</li>
              <li><strong>Academic Preparation:</strong> Begin preparing for your exciting academic journey</li>
            </ol>
          </div>
          
          <div class="contact-info">
            <h3>📞 We're Here to Help!</h3>
            <p>Our dedicated admissions and student services team is ready to assist you:</p>
            <ul>
              <li>Call us: 0726022044 or 0748022044</li>
              <li>Email: Info.eavi.college.it.depertment@gmail.com</li>
              <li>Town Office: Skymart Building, 1st Floor, Room F45 (next to Raiya Supermarket)</li>
              <li>Main Campus: City Plaza (next to Bandaptai Hotel)</li>
            </ul>
          </div>
          
          <p>We're incredibly excited to have you join our community of ambitious students and future leaders. Your dedication to education and personal growth perfectly aligns with our mission of "Leading the leaders. Nurturing quality and affordable education."</p>
          
          <p>This is just the beginning of an amazing journey that will prepare you for success in your chosen career and as a leader in your community.</p>
          
          <p><strong>Once again, congratulations and welcome to the EAVI family!</strong></p>
          
          <p>With warm regards and best wishes,<br><strong>East Africa Vision Institute<br>Admissions Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2025 East Africa Vision Institute. All rights reserved.</p>
          <p class="motto">Leading the leaders. Nurturing quality and affordable education.</p>
          <p>📍 Eldoret, Kenya | Shaping tomorrow's leaders today</p>
        </div>
      </div>
    </body>
    </html>
  `
}