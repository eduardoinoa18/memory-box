# 📋 Pre-Deployment Checklist for Belapp Mobile

## ✅ Account Setup Required

### Apple Developer Account (iOS)
- [ ] Apple Developer Program membership ($99/year)
- [ ] App Store Connect access
- [ ] Team ID and Apple ID configured
- [ ] Bundle identifier reserved: `com.belapp.memorybox`

### Google Play Console (Android)  
- [ ] Google Play Console account ($25 one-time)
- [ ] Package name reserved: `com.belapp.memorybox`
- [ ] Service account key for automated uploads (optional)

### Expo Account
- [ ] Expo account created and verified
- [ ] EAS CLI installed globally (`npm install -g @expo/eas-cli`)
- [ ] Logged into EAS CLI (`eas login`)

---

## 🔧 Technical Configuration

### Firebase Setup
- [ ] Firebase project created and configured
- [ ] Authentication enabled (Email/Password, Google, etc.)
- [ ] Firestore database created with security rules
- [ ] Firebase Storage configured with security rules
- [ ] Firebase Functions deployed (Stripe webhooks)
- [ ] Environment variables in `.env.local` validated

### Stripe Configuration
- [ ] Stripe account verified and activated
- [ ] Products and pricing configured in Stripe Dashboard
- [ ] Webhook endpoints configured (admin dashboard)
- [ ] **IMPORTANT**: Using PRODUCTION Stripe keys for app store builds
- [ ] Test payments working in development

### App Configuration
- [ ] `app.json` updated with correct bundle ID and package name
- [ ] `eas.json` created and configured
- [ ] App icons and splash screens optimized (check `assets/` folder)
- [ ] Privacy policy and terms of service prepared
- [ ] App store listings and screenshots ready

---

## 🧪 Testing Completed

### Core Functionality
- [ ] User registration and authentication
- [ ] File upload to Firebase Storage
- [ ] Stripe subscription flow (sign up, manage, cancel)
- [ ] Admin dashboard access and functionality
- [ ] Offline functionality (if implemented)
- [ ] Push notifications (if implemented)

### Platform Testing
- [ ] iOS Simulator testing completed
- [ ] Android Emulator testing completed
- [ ] Real device testing on iPhone
- [ ] Real device testing on Android
- [ ] Tablet testing (if supporting tablets)

### Performance Testing
- [ ] App launch time acceptable (<3 seconds)
- [ ] File upload performance tested with large files
- [ ] Memory usage optimized (no leaks)
- [ ] Network handling (offline/poor connection)

---

## 📱 Assets and Content

### Required Assets (check `assets/` folder)
- [ ] App icon: 1024x1024 PNG (`assets/icon.png`)
- [ ] Adaptive icon: 1024x1024 PNG (`assets/adaptive-icon.png`) 
- [ ] Splash screen: 1284x2778 PNG (`assets/splash.png`)
- [ ] Favicon: 48x48 PNG (`assets/favicon.png`)

### App Store Assets (prepare separately)
- [ ] iOS Screenshots: 6.7", 6.5", 5.5", 12.9" sizes
- [ ] Android Screenshots: Phone and tablet sizes  
- [ ] App preview video (optional but recommended)
- [ ] Feature graphic for Google Play (1024x500)

### Legal Documents
- [ ] Privacy Policy URL ready
- [ ] Terms of Service URL ready
- [ ] App description and keywords prepared
- [ ] Age rating assessment completed

---

## 🔐 Security and Privacy

### Data Protection
- [ ] Firebase security rules reviewed and tested
- [ ] User data encryption at rest (Firebase handles this)
- [ ] HTTPS enforced for all API calls
- [ ] No sensitive data logged or exposed
- [ ] GDPR compliance considerations addressed

### App Store Guidelines
- [ ] No prohibited content or functionality
- [ ] Age-appropriate content rating
- [ ] Follows platform design guidelines
- [ ] No misleading functionality or descriptions
- [ ] Subscription cancellation clearly explained

---

## 🚀 Deployment Process

### EAS Setup
- [ ] Run `setup-eas-secrets.ps1` to configure environment variables
- [ ] Update `app.json` with your EAS project ID
- [ ] Update `eas.json` with Apple/Google Play credentials
- [ ] Test build with development profile first

### Build and Submit
- [ ] Development build tested successfully
- [ ] Preview build shared with beta testers
- [ ] Production build completed without errors
- [ ] Submitted to Apple App Store for review
- [ ] Submitted to Google Play Console for review

---

## 📊 Post-Launch Monitoring

### Analytics Setup
- [ ] Firebase Analytics configured
- [ ] Expo Analytics enabled
- [ ] Stripe Dashboard monitoring set up
- [ ] App Store Connect analytics access
- [ ] Google Play Console analytics access

### Support Preparation
- [ ] Customer support email configured
- [ ] FAQ documentation prepared
- [ ] Bug reporting process established
- [ ] Update/hotfix deployment process ready

---

## ⚠️ Important Reminders

1. **Use Production Keys**: Ensure you're using production Firebase and Stripe keys for app store builds
2. **Test Payments**: Test the complete payment flow with real (small amount) transactions
3. **Privacy Policy**: Must be accessible and compliant with app store requirements
4. **Review Guidelines**: Read and follow Apple App Store and Google Play Store guidelines
5. **Backup Plan**: Have a rollback plan if issues are discovered post-launch

---

## 🎯 Quick Commands

```bash
# Setup EAS secrets
./setup-eas-secrets.ps1

# Deploy to app stores
./deploy-mobile.ps1

# Check build status
eas build:list

# Check submission status  
eas submit:list
```

---

## ✅ Final Sign-Off

**Developer:** _________________ **Date:** _________

**QA Tester:** ________________ **Date:** _________

**Product Owner:** _____________ **Date:** _________

---

*Complete this checklist before running the deployment scripts. Each checkbox represents a critical step for successful app store submission.*
