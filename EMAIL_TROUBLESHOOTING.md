# 📧 Email System Troubleshooting Guide

## 🚨 **Common Issues When Sending Admission PDFs**

### **Issue 1: Gmail Authentication Error**
**Symptoms:** "Invalid login" or "Authentication failed"

**Causes:**
- App password expired or incorrect
- Gmail account security settings
- Two-factor authentication not enabled

**Solutions:**
1. **Check App Password:**
   - Current password: `cyeroelfhmblbnzp`
   - If expired, generate new at: https://myaccount.google.com/apppasswords

2. **Gmail Account Settings:**
   - Enable 2-factor authentication
   - Create new app password for "Mail"
   - Update `.env.local` with new password

### **Issue 2: Large PDF Attachment**
**Symptoms:** "Message too large" or "Attachment failed"

**Causes:**
- PDF file too large (>25MB Gmail limit)
- Base64 encoding issues

**Solutions:**
1. **Check PDF size:**
   ```javascript
   console.log('PDF size:', Math.round(pdfBytes.length / 1024), 'KB');
   ```

2. **If too large (>20MB):**
   - Use PDF compression
   - Send PDF link instead of attachment
   - Split into multiple parts

### **Issue 3: Network/Firewall Issues**
**Symptoms:** "Connection timeout" or "ECONNREFUSED"

**Causes:**
- Vercel function timeout
- ISP blocking SMTP
- Corporate firewall

**Solutions:**
1. **Use alternative SMTP:**
   - SendGrid API
   - AWS SES
   - Postmark

2. **Test connection:**
   ```bash
   telnet smtp.gmail.com 587
   ```

### **Issue 4: Student Email Invalid**
**Symptoms:** "Recipient address rejected"

**Causes:**
- Invalid email format
- Email doesn't exist
- Temporary email service

**Solutions:**
1. **Validate email before sending:**
   ```javascript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(studentData.email)) {
     throw new Error('Invalid email format');
   }
   ```

## 🔧 **Quick Fixes**

### **1. Test Email Configuration**
Run the test file:
```bash
node test-email.js
```

### **2. Check Environment Variables**
Verify in Vercel dashboard:
- `GMAIL_EMAIL=eaviafrica@gmail.com`
- `GMAIL_PASSWORD=cyeroelfhmblbnzp`

### **3. Enable Debug Logging**
The system now has enhanced logging. Check:
- Browser Console (F12)
- Vercel Function Logs
- Network tab in DevTools

### **4. Alternative Email Method**
If Gmail fails, use email link instead:
```javascript
// Instead of PDF attachment, send download link
const pdfDownloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download-pdf/${studentId}`;
```

## 🆘 **Emergency Workarounds**

### **Method 1: Manual Email**
1. Generate PDF in dashboard
2. Download PDF
3. Send manually via Gmail

### **Method 2: WhatsApp Only**
1. Generate PDF 
2. Share via WhatsApp with download link
3. Skip email notification

### **Method 3: Batch Processing**
1. Collect all approved students
2. Send emails in batches
3. Retry failed emails

## 🧪 **Testing Steps**

### **1. Component Testing**
Test each part individually:
```javascript
// Test PDF generation
const pdf = await PDFService.generateAdmissionLetter(student);

// Test email service
const emailSent = await EmailService.sendAdmissionPDF(studentData);

// Check API directly
const response = await fetch('/api/send-email', { ... });
```

### **2. Live Testing**
1. Create test student with your email
2. Approve the test student
3. Check if email arrives
4. Verify PDF attachment

### **3. Network Testing**
```bash
# Test SMTP connection
curl -v smtp://smtp.gmail.com:587

# Test API endpoint
curl -X POST https://eavicollageapply.vercel.app/api/send-email
```

## 📊 **Common Error Messages**

| Error | Meaning | Solution |
|-------|---------|----------|
| `Error: Invalid login` | Wrong credentials | Update app password |
| `Error: Message too large` | PDF too big | Compress or use link |
| `Error: ECONNREFUSED` | Network blocked | Try different SMTP |
| `Error: Recipient address rejected` | Invalid email | Validate format |
| `Error: Timeout` | Function timeout | Optimize code |

## 🎯 **Success Indicators**

✅ **Email Working Correctly:**
- Console shows "✅ Email sent successfully"
- Student receives email with PDF
- Message ID returned from Gmail
- No error in Vercel logs

✅ **PDF Attachment Working:**
- PDF file appears in email
- PDF opens correctly
- File size reasonable (<5MB)
- Contains student data

## 📞 **Still Not Working?**

### **Quick Diagnostic:**
1. Check Gmail inbox for test email
2. Verify app password is correct
3. Test with simple email (no PDF)
4. Check Vercel function logs
5. Try different student email

### **Alternative Solutions:**
1. Use SendGrid instead of Gmail
2. Store PDFs in cloud and send links
3. Use WhatsApp for PDF sharing
4. Manual email process

The email system should work with the current configuration, but these troubleshooting steps will help identify and resolve any issues! 🚀