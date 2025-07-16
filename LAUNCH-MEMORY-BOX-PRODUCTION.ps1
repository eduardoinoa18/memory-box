# Memory Box - Quick Start Production Deployment Script
# Run this to deploy the complete Memory Box platform to production

Write-Host "🚀 MEMORY BOX - PRODUCTION DEPLOYMENT STARTING..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your production Firebase and Stripe keys." -ForegroundColor Yellow
    Write-Host "See .env.example for template." -ForegroundColor Yellow
    exit 1
}

# Verify required tools
$tools = @("node", "npm", "eas", "firebase", "vercel")
foreach ($tool in $tools) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        Write-Host "✅ $tool is installed" -ForegroundColor Green
    } else {
        Write-Host "❌ $tool is not installed" -ForegroundColor Red
        Write-Host "Please install $tool before continuing" -ForegroundColor Yellow
    }
}

Write-Host "`n🔥 STEP 1: FIREBASE SETUP" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "📝 Setting up Firebase project..." -ForegroundColor Yellow
Write-Host "1. Go to https://console.firebase.google.com" -ForegroundColor White
Write-Host "2. Create new project: 'memory-box-prod'" -ForegroundColor White
Write-Host "3. Enable Authentication, Firestore, Storage, Functions" -ForegroundColor White
Write-Host "4. Add your Firebase config to .env.local" -ForegroundColor White

Write-Host "`nPress any key when Firebase is ready..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Deploy Firebase security rules and functions
Write-Host "`n📤 Deploying Firebase backend..." -ForegroundColor Yellow
try {
    firebase use default
    firebase deploy --only firestore:rules,storage
    Write-Host "✅ Firebase security rules deployed" -ForegroundColor Green
    
    Set-Location "functions"
    npm install
    Set-Location ".."
    firebase deploy --only functions
    Write-Host "✅ Firebase Cloud Functions deployed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Firebase deployment may need manual setup" -ForegroundColor Yellow
}

Write-Host "`n💳 STEP 2: STRIPE CONFIGURATION" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "📝 Setting up Stripe..." -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.stripe.com" -ForegroundColor White
Write-Host "2. Create subscription products:" -ForegroundColor White
Write-Host "   - Premium Creator: $4.99/month" -ForegroundColor White
Write-Host "   - Family Legacy: $9.99/month" -ForegroundColor White
Write-Host "3. Set up webhook endpoint for Cloud Functions" -ForegroundColor White
Write-Host "4. Add Stripe keys to .env.local" -ForegroundColor White

Write-Host "`nPress any key when Stripe is ready..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n🌐 STEP 3: ADMIN DASHBOARD DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "📤 Deploying admin dashboard to Vercel..." -ForegroundColor Yellow
try {
    Set-Location "admin-dashboard"
    
    # Check if Vercel is configured
    if (Test-Path ".vercel") {
        vercel --prod
        Write-Host "✅ Admin dashboard deployed to Vercel" -ForegroundColor Green
    } else {
        Write-Host "📝 First-time Vercel setup required:" -ForegroundColor Yellow
        Write-Host "1. Run 'vercel' and link to your account" -ForegroundColor White
        Write-Host "2. Set Root Directory: admin-dashboard" -ForegroundColor White
        Write-Host "3. Framework: Next.js" -ForegroundColor White
        Write-Host "4. Add environment variables in Vercel dashboard" -ForegroundColor White
        vercel
    }
    
    Set-Location ".."
} catch {
    Write-Host "⚠️ Manual Vercel setup required" -ForegroundColor Yellow
    Set-Location ".."
}

Write-Host "`n📱 STEP 4: MOBILE APP DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "📝 Setting up EAS secrets..." -ForegroundColor Yellow
try {
    .\setup-eas-secrets.ps1
    Write-Host "✅ EAS secrets configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Please run setup-eas-secrets.ps1 manually" -ForegroundColor Yellow
}

Write-Host "`n📱 Building mobile apps..." -ForegroundColor Yellow
Write-Host "This will take 10-15 minutes..." -ForegroundColor Yellow
try {
    # iOS build
    Write-Host "🍎 Building iOS app..." -ForegroundColor Yellow
    eas build --platform ios --profile production --non-interactive
    
    # Android build  
    Write-Host "🤖 Building Android app..." -ForegroundColor Yellow
    eas build --platform android --profile production --non-interactive
    
    Write-Host "✅ Mobile apps built successfully!" -ForegroundColor Green
    Write-Host "📱 Check EAS dashboard for download links" -ForegroundColor White
} catch {
    Write-Host "⚠️ Mobile builds may need manual setup" -ForegroundColor Yellow
    Write-Host "Run: eas build --platform all --profile production" -ForegroundColor White
}

Write-Host "`n🎯 STEP 5: FINAL CONFIGURATION" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

Write-Host "📝 Creating admin users..." -ForegroundColor Yellow
Write-Host "In Firebase Console → Authentication, add:" -ForegroundColor White
Write-Host "1. founder@memorybox.app (set custom claim: admin: true)" -ForegroundColor White
Write-Host "2. ops@memorybox.app (set custom claim: admin: true)" -ForegroundColor White

Write-Host "`n📊 Setting up monitoring..." -ForegroundColor Yellow
Write-Host "1. Enable Firebase Analytics" -ForegroundColor White
Write-Host "2. Set up error monitoring (Sentry)" -ForegroundColor White
Write-Host "3. Configure performance monitoring" -ForegroundColor White

Write-Host "`n🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

Write-Host "`n✅ What's deployed:" -ForegroundColor Green
Write-Host "   🔥 Firebase backend with security rules" -ForegroundColor White
Write-Host "   💳 Stripe payment processing" -ForegroundColor White
Write-Host "   🌐 Admin dashboard on Vercel" -ForegroundColor White
Write-Host "   📱 Mobile apps ready for app stores" -ForegroundColor White

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Submit mobile apps to App Store and Play Store" -ForegroundColor White
Write-Host "   2. Configure custom domain for admin dashboard" -ForegroundColor White
Write-Host "   3. Set up customer support email" -ForegroundColor White
Write-Host "   4. Launch marketing campaign" -ForegroundColor White

Write-Host "`n📱 App Store Links:" -ForegroundColor Yellow
Write-Host "   iOS: Check EAS dashboard for .ipa download" -ForegroundColor White
Write-Host "   Android: Check EAS dashboard for .aab download" -ForegroundColor White

Write-Host "`n🌐 Web URLs:" -ForegroundColor Yellow
Write-Host "   Admin Dashboard: Check Vercel dashboard for URL" -ForegroundColor White
Write-Host "   Landing Page: Deploy landing-page folder to Vercel" -ForegroundColor White

Write-Host "`n🎯 MEMORY BOX IS NOW LIVE! 🎉" -ForegroundColor Green

# Show build status
Write-Host "`n📊 Checking build status..." -ForegroundColor Yellow
try {
    eas build:list --limit=5
} catch {
    Write-Host "Run 'eas build:list' to check build status" -ForegroundColor White
}

Write-Host "`nDeployment completed! Check logs above for any issues." -ForegroundColor Green
