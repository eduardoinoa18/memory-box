# Memory Box - Production Deployment Guide

## 🚀 **COMPLETE DEPLOYMENT CHECKLIST**

This guide will help you deploy the Memory Box platform to production with all features enabled.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **✅ Development Setup Complete**
- [ ] Mobile app running locally
- [ ] Admin dashboard accessible
- [ ] Landing page functional
- [ ] Firebase emulators working
- [ ] All dependencies installed

### **✅ Business Requirements**
- [ ] Business plan decided
- [ ] Pricing tiers confirmed
- [ ] Legal documents prepared
- [ ] Support system planned
- [ ] Marketing strategy ready

---

## 🔥 **STEP 1: Firebase Project Setup**

### **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name: `memory-box-production`
4. Enable Google Analytics (recommended)
5. Choose default analytics location

### **Configure Authentication**
```bash
# In Firebase Console:
1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google (configure OAuth consent)
4. Add authorized domains:
   - localhost (for development)
   - your-app-domain.com
   - your-admin-domain.com
```

### **Set up Firestore Database**
```bash
# In Firebase Console:
1. Go to Firestore Database
2. Create database in production mode
3. Choose location (closest to your users)
4. Set up security rules (see firebase-rules.txt)
```

### **Configure Storage**
```bash
# In Firebase Console:
1. Go to Storage
2. Get started with default rules
3. Choose same location as Firestore
4. Update rules for memory files (see storage-rules.txt)
```

### **Update Firebase Config**
```javascript
// Update firebase.config.js with your project details:
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "memory-box-production.firebaseapp.com",
  projectId: "memory-box-production",
  storageBucket: "memory-box-production.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

---

## 💳 **STEP 2: Stripe Payment Setup**

### **Create Stripe Account**
1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete business verification
3. Enable required payment methods
4. Set up tax settings if applicable

### **Create Products and Prices**
```bash
# Create these products in Stripe Dashboard:

1. Premium Creator - $4.99/month
   - Price ID: price_premium_monthly
   - Billing: Recurring monthly

2. Family Legacy - $9.99/month  
   - Price ID: price_family_monthly
   - Billing: Recurring monthly

3. Premium Creator - $49.99/year (optional)
   - Price ID: price_premium_yearly
   - Billing: Recurring yearly

4. Family Legacy - $99.99/year (optional)
   - Price ID: price_family_yearly
   - Billing: Recurring yearly
```

### **Configure Webhooks**
```bash
# In Stripe Dashboard > Webhooks:
1. Add endpoint: https://your-region-memory-box-production.cloudfunctions.net/stripeWebhook
2. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
3. Copy webhook signing secret
```

### **Set Stripe Environment Variables**
```bash
# In Firebase Functions config:
firebase functions:config:set stripe.secret_key="sk_live_..." stripe.webhook_secret="whsec_..."
```

---

## 🤖 **STEP 3: AI Services Setup (Optional)**

### **OpenAI API Setup**
```bash
# If using AI features:
1. Create account at https://platform.openai.com
2. Generate API key
3. Set usage limits and monitoring
4. Add to Firebase config:
firebase functions:config:set openai.api_key="sk-..."
```

### **Alternative AI Services**
```bash
# You can also use:
- Google Cloud Vision API (for image analysis)
- Google Cloud Natural Language API (for text analysis)
- AWS Rekognition (for image/video analysis)
```

---

## 📱 **STEP 4: Mobile App Deployment**

### **Prepare for App Stores**

#### **Update App Configuration**
```javascript
// Update app.json:
{
  "expo": {
    "name": "Memory Box",
    "slug": "memory-box",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#667eea"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.memorybox"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#667eea"
      },
      "package": "com.yourcompany.memorybox"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

#### **Create App Store Assets**
```bash
# Required assets:
- App icon (1024x1024 PNG)
- Splash screen (1242x2688 PNG)
- Screenshots for all devices
- App Store description
- Keywords and categories
- Privacy Policy URL
- Support URL
```

### **iOS Deployment**
```bash
# Prerequisites:
1. Apple Developer Account ($99/year)
2. Xcode installed on Mac
3. iOS device for testing

# Steps:
1. Create app in App Store Connect
2. Generate signing certificates
3. Build and upload with EAS:
   npx eas build --platform ios
4. Submit for review
```

### **Android Deployment**
```bash
# Prerequisites:
1. Google Play Console account ($25 one-time)
2. Android device for testing

# Steps:
1. Create app in Google Play Console
2. Generate upload keystore
3. Build and upload with EAS:
   npx eas build --platform android
4. Submit for review
```

---

## 🖥️ **STEP 5: Admin Dashboard Deployment**

### **Deploy to Vercel (Recommended)**
```bash
# Install Vercel CLI:
npm i -g vercel

# In admin-dashboard directory:
cd admin-dashboard

# Deploy:
vercel

# Add environment variables in Vercel dashboard:
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=memory-box-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=memory-box-production
# ... other Firebase config values
```

### **Deploy to Firebase Hosting (Alternative)**
```bash
# In admin-dashboard directory:
npm run build
firebase deploy --only hosting:admin

# Configure custom domain in Firebase Console
```

### **Deploy to Netlify (Alternative)**
```bash
# Connect GitHub repo to Netlify
# Set build command: npm run build
# Set publish directory: .next
# Add environment variables in Netlify dashboard
```

---

## 🌐 **STEP 6: Landing Page Deployment**

### **Deploy to Firebase Hosting**
```bash
# Copy landing-page/index-complete.html to public/index.html
firebase deploy --only hosting

# Or deploy to subdomain:
firebase hosting:channel:deploy marketing
```

### **Deploy to Netlify/Vercel**
```bash
# Simply upload the HTML file and assets
# Configure custom domain
# Enable HTTPS
```

---

## ⚡ **STEP 7: Backend Functions Deployment**

### **Deploy Firebase Functions**
```bash
# In functions directory:
cd functions
npm install

# Deploy all functions:
firebase deploy --only functions

# Deploy specific function:
firebase deploy --only functions:createCheckoutSession
```

### **Set Environment Variables**
```bash
# Required environment variables:
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="whsec_..." \
  openai.api_key="sk-..." \
  email.smtp_user="your-email@domain.com" \
  email.smtp_pass="your-email-password"
```

### **Monitor Function Performance**
```bash
# View logs:
firebase functions:log

# Monitor in Firebase Console:
# Functions > Dashboard > Performance monitoring
```

---

## 🔒 **STEP 8: Security Configuration**

### **Firestore Security Rules**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Folders belong to users
    match /folders/{folderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Memories belong to users
    match /memories/{memoryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Admin access for analytics (server-side only)
    match /analytics/{document=**} {
      allow read, write: if false; // Only server can write
    }
  }
}
```

### **Storage Security Rules**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /memories/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    match /avatars/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

---

## 📊 **STEP 9: Analytics & Monitoring**

### **Google Analytics 4**
```bash
# Already configured with Firebase Analytics
# View reports in Firebase Console > Analytics
# Create custom events for business metrics
```

### **Performance Monitoring**
```bash
# Enable in Firebase Console:
# Performance > Get started
# Monitor app startup time, screen rendering, etc.
```

### **Crash Reporting**
```bash
# Crashlytics is automatically enabled with Firebase
# Monitor crashes in Firebase Console > Crashlytics
```

### **Business Metrics Dashboard**
```bash
# Track important metrics:
- Daily/Monthly Active Users
- Subscription conversion rates
- Revenue per user
- Feature usage
- Support ticket volume
```

---

## 🎯 **STEP 10: Final Testing**

### **End-to-End Testing Checklist**
- [ ] User registration works
- [ ] Google sign-in works
- [ ] Password reset works
- [ ] Folder creation works
- [ ] Memory upload works
- [ ] Subscription upgrade works
- [ ] Payment processing works
- [ ] Admin dashboard loads
- [ ] Analytics tracking works
- [ ] Email notifications work
- [ ] Mobile app installs
- [ ] Landing page loads

### **Performance Testing**
```bash
# Test with tools:
- Lighthouse (web performance)
- Firebase Performance Monitoring
- Stripe Dashboard (payment testing)
- App store testing tools
```

---

## 🚀 **STEP 11: Go Live!**

### **Pre-Launch Checklist**
- [ ] All systems tested and working
- [ ] Customer support ready
- [ ] Marketing materials prepared
- [ ] Legal documents published
- [ ] Backup and recovery plan
- [ ] Monitoring and alerts configured

### **Launch Day Tasks**
1. **Submit apps for review** (can take 1-7 days)
2. **Announce on social media**
3. **Send launch emails**
4. **Monitor system performance**
5. **Respond to customer feedback**
6. **Track key metrics**

### **Post-Launch Monitoring**
```bash
# Monitor these metrics daily:
- App store ratings and reviews
- User registration rate
- Subscription conversion rate
- System performance and errors
- Customer support tickets
- Revenue and growth metrics
```

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

#### **Firebase Connection Issues**
```bash
# Check Firebase config
# Verify API keys are correct
# Check network connectivity
# Review security rules
```

#### **Stripe Payment Issues**
```bash
# Verify webhook endpoints
# Check API keys (live vs test)
# Review webhook event handling
# Test with Stripe test cards
```

#### **App Store Rejection**
```bash
# Common reasons:
- Missing privacy policy
- Incomplete app metadata
- App crashes or bugs
- Guideline violations

# Solutions:
- Review App Store guidelines
- Test thoroughly before submission
- Provide clear app description
- Include all required legal documents
```

---

## 📞 **SUPPORT & MAINTENANCE**

### **Ongoing Tasks**
- Monitor app performance
- Respond to user feedback
- Update dependencies
- Deploy bug fixes
- Add new features
- Scale infrastructure as needed

### **Monthly Reviews**
- Analyze user metrics
- Review financial performance
- Plan feature roadmap
- Update marketing strategy
- Optimize conversion rates

---

## 🎉 **CONGRATULATIONS!**

Your Memory Box platform is now live and ready to help families preserve their precious memories!

**Key Success Metrics to Track:**
- User acquisition rate
- Subscription conversion rate
- Monthly recurring revenue (MRR)
- User engagement metrics
- Customer satisfaction scores

**Next Steps:**
- Iterate based on user feedback
- Add new premium features
- Expand marketing efforts
- Consider international expansion
- Build community around the platform

---

**Memory Box Platform - Connecting Families Through Memories** 💝
