# 🚀 Vercel Deployment - Complete Setup Guide

## ✅ Pre-Deployment Checklist

**Repository Status**: ✅ All 355 files uploaded to GitHub  
**GitHub Repository**: https://github.com/eduardoinoa18/memory-box  
**Ready for Deployment**: ✅ YES

## 🎯 Step-by-Step Vercel Deployment

### 1. **Access Vercel Dashboard**
- Go to: https://vercel.com
- Sign in with GitHub account
- Click **"New Project"**

### 2. **Import Memory Box Repository**
- Click **"Import Git Repository"**
- Search for: `eduardoinoa18/memory-box`
- Click **"Import"**

### 3. **Deploy Admin Dashboard (Project 1)**

**Project Configuration**:
```
Project Name: memory-box-admin
Root Directory: admin-dashboard
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Environment Variables** (Copy from `admin-dashboard/.env.vercel.example`):
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Configuration
ADMIN_SECRET_KEY=your_secure_admin_secret
NEXT_PUBLIC_ADMIN_URL=https://your-admin-domain.vercel.app

# Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Additional APIs
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### 4. **Deploy Landing Page (Project 2)**

**Project Configuration**:
```
Project Name: memory-box-landing
Root Directory: landing-page
Framework Preset: Other
Build Command: (leave empty for static)
Output Directory: (leave empty)
Install Command: (leave empty)
```

**Environment Variables** (Copy from `landing-page/.env.vercel.example`):
```
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id

# Contact Form
SENDGRID_API_KEY=your_sendgrid_key
CONTACT_EMAIL=contact@memorybox.com

# Social Media
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/memorybox
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/memorybox
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/memorybox
```

## 🎛️ **Vercel Configuration Files**

### Admin Dashboard (`vercel-admin.json`)
```json
{
  "version": 2,
  "name": "memory-box-admin",
  "builds": [
    {
      "src": "admin-dashboard/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/admin-dashboard/$1"
    }
  ]
}
```

### Landing Page (`vercel-landing.json`)
```json
{
  "version": 2,
  "name": "memory-box-landing",
  "builds": [
    {
      "src": "landing-page/**",
      "use": "@vercel/static"
    }
  ]
}
```

## 🔧 **Quick Deployment Commands**

If you prefer using Vercel CLI:

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Admin Dashboard
```bash
cd admin-dashboard
vercel --prod
```

### Deploy Landing Page
```bash
cd landing-page
vercel --prod
```

## 🌐 **Expected URLs After Deployment**

- **Admin Dashboard**: `https://memory-box-admin.vercel.app`
- **Landing Page**: `https://memory-box-landing.vercel.app`

## ⚡ **Troubleshooting Common Issues**

### Issue 1: Build Fails
**Solution**: Check that all dependencies are in `package.json`
```bash
# In admin-dashboard folder
npm install
npm run build
```

### Issue 2: Environment Variables Missing
**Solution**: Copy all variables from `.env.vercel.example` files

### Issue 3: Root Directory Not Found
**Solution**: Ensure root directory is set correctly:
- Admin: `admin-dashboard`
- Landing: `landing-page`

## 🎉 **Post-Deployment Steps**

1. **Test Admin Dashboard**:
   - Visit your admin URL
   - Test login functionality
   - Verify all pages load correctly

2. **Test Landing Page**:
   - Check responsive design
   - Test contact forms
   - Verify analytics tracking

3. **Update Domain Settings** (Optional):
   - Add custom domains in Vercel dashboard
   - Configure DNS records
   - Enable HTTPS

## 📊 **Deployment Status Tracking**

- [ ] Repository imported to Vercel
- [ ] Admin dashboard deployed
- [ ] Landing page deployed
- [ ] Environment variables configured
- [ ] SSL certificates active
- [ ] Custom domains configured (optional)

---

**🚀 Ready to Deploy!** Your Memory Box platform is fully prepared for Vercel deployment with all necessary configuration files and documentation in place.
