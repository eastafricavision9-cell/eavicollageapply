# 🔧 Vercel Environment Variables Setup Guide

## 📊 **Current Configuration Status**

### ✅ **Working Variables (Already Set):**
| Variable | Current Value | Status |
|----------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zaomcjovaiiuscbjjqch.supabase.co` | ✅ Working |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | ✅ Working |

### ⚠️ **Email Variables (Need to be Added to Vercel):**

## 🎯 **Required Environment Variables for Vercel**

### **Method 1: Standard SMTP Variables (Recommended)**

Add these **EXACT** variables in Vercel Dashboard:

| Key | Value | Notes |
|-----|-------|-------|
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `SMTP_PORT` | `587` | TLS port (recommended) |
| `SMTP_USER` | `eaviafrica@gmail.com` | Full Gmail address |
| `SMTP_PASS` | `cyeroelfhmblbnzp` | Google App Password |

### **Method 2: Current Variable Names (Alternative)**

Or use the current variable names:

| Key | Value | Notes |
|-----|-------|-------|
| `GMAIL_EMAIL` | `eaviafrica@gmail.com` | Gmail address |
| `GMAIL_PASSWORD` | `cyeroelfhmblbnzp` | App password |

## 🚀 **Step-by-Step Vercel Setup**

### **Step 1: Access Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project: `eavicollageapply`
3. Click on the project

### **Step 2: Navigate to Environment Variables**
1. Click **"Settings"** tab
2. Click **"Environment Variables"** in left sidebar

### **Step 3: Add Email Variables**
Click **"Add New"** and add each variable:

#### **Variable 1:**
- **Name**: `SMTP_HOST`
- **Value**: `smtp.gmail.com`
- **Environment**: All (Production, Preview, Development)

#### **Variable 2:**
- **Name**: `SMTP_PORT`
- **Value**: `587`
- **Environment**: All

#### **Variable 3:**
- **Name**: `SMTP_USER`
- **Value**: `eaviafrica@gmail.com`
- **Environment**: All

#### **Variable 4:**
- **Name**: `SMTP_PASS`
- **Value**: `cyeroelfhmblbnzp`
- **Environment**: All

### **Step 4: Save and Redeploy**
1. Click **"Save"** for each variable
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Wait for deployment to complete

## 🔄 **Alternative: Use Current Variables**

If you prefer to keep current variable names, just add these to Vercel:

- **Name**: `GMAIL_EMAIL`
- **Value**: `eaviafrica@gmail.com`

- **Name**: `GMAIL_PASSWORD` 
- **Value**: `cyeroelfhmblbnzp`

## 🧪 **Testing Email Configuration**

After adding variables, test by:

1. **Go to admin dashboard**: https://eavicollageapply.vercel.app/admin/login
2. **Add a test student** with your email
3. **Approve the student** 
4. **Check if email arrives** with PDF attachment

## 🎯 **Expected Results**

✅ **Success Indicators:**
- Console shows "✅ Email sent successfully"
- Student receives email with PDF attachment
- No error messages in Vercel function logs

❌ **Failure Indicators:**
- "Authentication failed" errors
- "Connection refused" errors
- No email received by student

## 🔍 **Troubleshooting**

### **Issue: "Invalid Login" Error**
**Cause**: Wrong email or app password
**Fix**: Double-check `SMTP_USER` and `SMTP_PASS` values

### **Issue: "Connection Timeout"**
**Cause**: Wrong SMTP settings
**Fix**: Ensure `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`

### **Issue: Variables Not Found**
**Cause**: Environment variables not set in Vercel
**Fix**: Verify all variables are added and redeployed

## 📱 **Gmail App Password Setup**

If you need a new app password:

1. **Go to**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. **Select**: "Mail" 
3. **Select device**: "Other" → Type "EAVI Dashboard"
4. **Copy**: The 16-character password (like: `abcd efgh ijkl mnop`)
5. **Use**: This password in `SMTP_PASS` (without spaces)

## ✅ **Final Checklist**

Before testing, confirm:
- [ ] All 4 environment variables added to Vercel
- [ ] Values are exactly correct (no extra spaces)
- [ ] Applied to all environments (Production, Preview, Development)
- [ ] Project has been redeployed after adding variables
- [ ] Gmail app password is valid and not expired

## 🎊 **Success!**

Once configured correctly, your admission dashboard will:
- ✅ Send application confirmation emails
- ✅ Send admission letters with PDF attachments
- ✅ Work reliably for all students
- ✅ Provide proper error logging

Your email system will be fully operational! 🚀