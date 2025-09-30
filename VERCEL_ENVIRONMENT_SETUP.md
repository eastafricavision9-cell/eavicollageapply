# Vercel Environment Variables Setup

## Required Environment Variables

Add these **EXACT** environment variables to your Vercel project:

### **Method 1: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/dashboard
2. Click on your project: `eavicollageapply`
3. Click: **Settings** → **Environment Variables**
4. Add these variables one by one:

| Variable Name | Variable Value | Environment |
|---------------|----------------|-------------|
| `GMAIL_EMAIL` | `eaviafrica@gmail.com` | Production, Preview |
| `GMAIL_PASSWORD` | `cyeroelfhmblbnzp` | Production, Preview |
| `SMTP_USER` | `eaviafrica@gmail.com` | Production, Preview |
| `SMTP_PASS` | `cyeroelfhmblbnzp` | Production, Preview |
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview |
| `SMTP_PORT` | `587` | Production, Preview |

### **Method 2: Via Vercel CLI**

```bash
vercel env add GMAIL_EMAIL production
# Enter: eaviafrica@gmail.com

vercel env add GMAIL_PASSWORD production
# Enter: cyeroelfhmblbnzp

vercel env add SMTP_USER production
# Enter: eaviafrica@gmail.com

vercel env add SMTP_PASS production
# Enter: cyeroelfhmblbnzp

vercel env add SMTP_HOST production
# Enter: smtp.gmail.com

vercel env add SMTP_PORT production
# Enter: 587
```

## After Adding Variables

1. **Redeploy**: Go to Deployments → Click ⋯ → Redeploy
2. **Test**: Visit `/api/debug-email` to verify variables are loaded
3. **Verify**: Test email functionality in the dashboard

## Troubleshooting

- If variables don't appear, wait 5-10 minutes after adding them
- Make sure to select both "Production" and "Preview" environments
- After adding variables, always redeploy the project

## Test Endpoints

- **Debug**: `https://your-domain.vercel.app/api/debug-email`
- **Test Email**: `https://your-domain.vercel.app/api/test-email`

## Features That Will Work

✅ Student approval emails  
✅ Resend admission letters  
✅ PDF email attachments  
✅ All dashboard email functionality  
✅ Manual email sending  
✅ Automatic approval emails  