# 🚀 Step-by-Step Vercel Deployment Instructions

## When you run `vercel` command, here's what to select:

### Step 1: Initial Setup
```
? Set up and deploy "~\Desktop\2024\2024"? 
👉 Type: Y (Yes)
```

### Step 2: Choose Scope
```
? Which scope should contain your project? 
👉 Select: eastafricavision9-5913's projects
(Use arrow keys to select, then press Enter)
```

### Step 3: Link to Existing Project
```
? Link to existing project? 
👉 Type: N (No) - We want to create a NEW project
```

### Step 4: Project Name
```
? What's your project's name? 
👉 Type: eavicollageapply
(This will be your project name on Vercel)
```

### Step 5: Code Location
```
? In which directory is your code located? 
👉 Press Enter (accept default: ./)
```

### Step 6: Auto-detect Settings
```
? Want to modify these settings? 
👉 Type: N (No) - Let Vercel auto-detect Next.js settings
```

## Expected Auto-detected Settings:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 7: Deploy
After configuration, Vercel will:
1. Install dependencies
2. Build your project
3. Deploy to a live URL
4. Give you the deployment URL

## Expected Output:
```
✅ Production: https://eavicollageapply-xxxx.vercel.app [2-3 minutes]
```

## If Something Goes Wrong:

### Build Errors:
- Don't worry! TypeScript errors are bypassed in your config
- The build should succeed

### Missing Project Error:
- Make sure you select "N" for "Link to existing project"
- Create a new project instead

### Network Issues:
- Check internet connection
- Try again with `vercel --prod`

## After Successful Deployment:

✅ Your admission dashboard will be live at the Vercel URL
✅ All pages will work: `/`, `/apply`, `/admin/dashboard`
✅ You can share this URL with anyone worldwide

## Ready to Start?

Run this command when ready:
```bash
vercel
```

Then follow the steps above! 🚀