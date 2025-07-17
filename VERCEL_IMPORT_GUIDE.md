## 🚀 VERCEL DEPLOYMENT SETUP GUIDE

### **OPTION 1: Use Existing Repository (if it exists)**

If you already created the repository on GitHub:

1. **Repository URL**: `https://github.com/eduardoinoa18/memory-box`
2. **Make sure it's PUBLIC** (or Vercel has access)
3. **Upload these files to GitHub**

### **OPTION 2: Create New Repository**

If the repository doesn't exist yet:

1. **Go to**: https://github.com/new
2. **Owner**: eduardoinoa18
3. **Repository name**: memory-box
4. **Visibility**: Public (recommended for easier Vercel access)
5. **DON'T initialize** with README, .gitignore, or license
6. **Click "Create repository"**

### **VERCEL IMPORT INFORMATION**

Once your repository is on GitHub, use these settings in Vercel:

#### **🔐 ADMIN DASHBOARD PROJECT**
- **Repository**: `eduardoinoa18/memory-box`
- **Root Directory**: `admin-dashboard`
- **Framework Preset**: `Next.js`
- **Project Name**: `memory-box-admin`

#### **🌐 LANDING PAGE PROJECT**
- **Repository**: `eduardoinoa18/memory-box` (same repo)
- **Root Directory**: `landing-page`
- **Framework Preset**: `Other`
- **Project Name**: `memory-box-landing`

### **📋 ENVIRONMENT VARIABLES FOR VERCEL**

Copy these from the files I created:

#### **Admin Dashboard Variables** (from `admin-dashboard/.env.vercel.example`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CREDENTIALS=base64_encoded_service_account
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

#### **Landing Page Variables** (from `landing-page/.env.vercel.example`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### **🔄 ALTERNATIVE: Manual Upload**

If Git isn't working, you can:

1. **Zip the folders**:
   - Create `admin-dashboard.zip` with contents of `admin-dashboard/` folder
   - Create `landing-page.zip` with contents of `landing-page/` folder

2. **Upload to GitHub**:
   - Use GitHub's web interface to upload files
   - Or use GitHub Desktop application

3. **Then import to Vercel**

### **✅ VERIFICATION CHECKLIST**

Before importing to Vercel, ensure:
- [ ] Repository exists at `https://github.com/eduardoinoa18/memory-box`
- [ ] Repository is public or Vercel has access
- [ ] `admin-dashboard/` folder contains Next.js files
- [ ] `landing-page/` folder contains HTML files
- [ ] You have all required environment variables ready

**Need help with any specific step? Let me know!**
