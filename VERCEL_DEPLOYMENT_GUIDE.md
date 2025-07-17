# 🚀 Memory Box Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Firebase project with credentials
- Stripe account (for payments)

## Step 1: Prepare Repository

### 1.1 Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit - Memory Box platform"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create repository named `memory-box`
3. Don't initialize with README (we already have files)

### 1.3 Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/memory-box.git
git push -u origin main
```

## Step 2: Deploy Admin Dashboard

### 2.1 Create Vercel Project
1. Go to [Vercel](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `memory-box` repository
4. Configure project:
   - **Project Name**: `memory-box-admin`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `admin-dashboard`

### 2.2 Environment Variables for Admin Dashboard
Add these in Vercel → Project Settings → Environment Variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (Server-side)
FIREBASE_ADMIN_CREDENTIALS=eyJ0eXAiOiJKV1QiLCJhbGc... (base64 encoded service account)
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_live_51ABC123...
STRIPE_SECRET_KEY=sk_live_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_ABC123...

# PrizeOut Integration
PRIZEOUT_API_KEY=your_prizeout_api_key
PRIZEOUT_API_URL=https://api.prizeout.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=AC123456789...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Configuration
SENDGRID_API_KEY=SG.ABC123...
SENDGRID_FROM_EMAIL=admin@memorybox.app

# Security
ADMIN_SECRET_KEY=your_very_strong_secret_key_here
JWT_SECRET=your_jwt_secret_key

# URLs
NEXT_PUBLIC_APP_URL=https://admin.memorybox.app
NEXT_PUBLIC_API_URL=https://admin.memorybox.app/api

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENV=production
```

### 2.3 Deploy Admin Dashboard
Click "Deploy" and wait for deployment to complete.

## Step 3: Deploy Landing Page

### 3.1 Create Second Vercel Project
1. Go to [Vercel](https://vercel.com/new) again
2. Import the same `memory-box` repository
3. Configure project:
   - **Project Name**: `memory-box-landing`
   - **Framework Preset**: `Other`
   - **Root Directory**: `landing-page`

### 3.2 Environment Variables for Landing Page
Add these in Vercel → Project Settings → Environment Variables:

```bash
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe (Public)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_51ABC123...

# URLs
NEXT_PUBLIC_APP_URL=https://memorybox.app
NEXT_PUBLIC_ADMIN_URL=https://admin.memorybox.app
NEXT_PUBLIC_MOBILE_APP_URL=https://memorybox.app

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789

# SEO
NEXT_PUBLIC_SITE_NAME=Memory Box
NEXT_PUBLIC_SITE_DESCRIPTION=Preserve and share your precious family memories
NEXT_PUBLIC_SITE_URL=https://memorybox.app

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENV=production
```

### 3.3 Deploy Landing Page
Click "Deploy" and wait for deployment to complete.

## Step 4: Domain Configuration

### 4.1 Custom Domains (Optional)
If you own `memorybox.app`:

1. **Landing Page**:
   - Vercel → Project → Settings → Domains
   - Add: `memorybox.app` and `www.memorybox.app`

2. **Admin Dashboard**:
   - Vercel → Project → Settings → Domains
   - Add: `admin.memorybox.app`

### 4.2 DNS Configuration
Point your domains to Vercel:
```
A Record: memorybox.app → 76.76.19.61
CNAME: www.memorybox.app → cname.vercel-dns.com
CNAME: admin.memorybox.app → cname.vercel-dns.com
```

## Step 5: Verification

### 5.1 Test Admin Dashboard
1. Visit your admin dashboard URL
2. Test login functionality
3. Verify Firebase connection
4. Test Stripe integration

### 5.2 Test Landing Page
1. Visit your landing page URL
2. Check responsive design
3. Test form submissions
4. Verify analytics tracking

## Step 6: Firebase Admin Credentials

### 6.1 Generate Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file

### 6.2 Base64 Encode Credentials
```bash
# On macOS/Linux:
base64 -i service-account-key.json

# On Windows (PowerShell):
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("service-account-key.json"))
```

### 6.3 Add to Vercel
Copy the base64 string and add as `FIREBASE_ADMIN_CREDENTIALS` environment variable.

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check Next.js version compatibility
2. **Environment Variables**: Ensure all required variables are set
3. **Firebase Errors**: Verify credentials and project configuration
4. **Stripe Webhook**: Update webhook URL in Stripe dashboard

### Support:
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Firebase Documentation: https://firebase.google.com/docs

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Firebase security rules updated
- [ ] Stripe webhook endpoints secured
- [ ] Admin routes protected
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS properly configured

## 🎉 Deployment Complete!

Your Memory Box platform is now live:
- **Landing Page**: https://your-landing-url.vercel.app
- **Admin Dashboard**: https://your-admin-url.vercel.app

Remember to update your mobile app configuration to point to the new URLs!
