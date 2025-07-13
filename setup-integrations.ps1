# Memory Box Integrations Hub - Quick Setup Script (PowerShell)
# This script helps set up the integrations hub and webhook system

Write-Host "🚀 Memory Box Integrations Hub - Quick Setup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the root directory of your Memory Box project" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Installing dependencies..." -ForegroundColor Yellow

# Install main app dependencies
Write-Host "Installing main app dependencies..." -ForegroundColor Cyan
npm install

# Install admin dashboard dependencies
Write-Host "Installing admin dashboard dependencies..." -ForegroundColor Cyan
Set-Location admin-dashboard
npm install
Set-Location ..

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Step 2: Environment Setup" -ForegroundColor Yellow
Write-Host "Please ensure you have the following environment files configured:" -ForegroundColor White
Write-Host ""
Write-Host "📄 .env.local (main app):" -ForegroundColor Cyan
Write-Host "  - EXPO_PUBLIC_FIREBASE_* variables" -ForegroundColor White
Write-Host "  - EXPO_PUBLIC_STRIPE_* variables" -ForegroundColor White
Write-Host ""
Write-Host "📄 admin-dashboard/.env.local (admin dashboard):" -ForegroundColor Cyan
Write-Host "  - NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "  - NEXTAUTH_URL" -ForegroundColor White
Write-Host "  - Firebase config variables" -ForegroundColor White
Write-Host ""

Write-Host "📋 Step 3: Firebase Setup" -ForegroundColor Yellow
Write-Host "Make sure your Firebase project is configured with:" -ForegroundColor White
Write-Host "  ✅ Authentication enabled" -ForegroundColor Green
Write-Host "  ✅ Firestore database created" -ForegroundColor Green
Write-Host "  ✅ Storage bucket enabled" -ForegroundColor Green
Write-Host "  ✅ Functions deployed" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 4: Stripe Setup" -ForegroundColor Yellow
Write-Host "1. Go to your admin dashboard: http://localhost:3000/integrations" -ForegroundColor White
Write-Host "2. Configure your Stripe keys in the Integrations Hub" -ForegroundColor White
Write-Host "3. Set up webhooks using the Webhook Setup Guide" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Quick Start Commands:" -ForegroundColor Magenta
Write-Host ""
Write-Host "Start the main app:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Start the admin dashboard:" -ForegroundColor Cyan
Write-Host "  cd admin-dashboard; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Deploy Firebase Functions:" -ForegroundColor Cyan
Write-Host "  firebase deploy --only functions" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - INTEGRATIONS_HUB_COMPLETE.md - Complete setup guide" -ForegroundColor White
Write-Host "  - WEBHOOK_SETUP_GUIDE.md - Webhook configuration" -ForegroundColor White
Write-Host "  - STRIPE_QUICK_REFERENCE.md - Stripe integration reference" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup complete! Your Integrations Hub is ready to use." -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next steps:" -ForegroundColor Magenta
Write-Host "1. Start your admin dashboard: cd admin-dashboard; npm run dev" -ForegroundColor White
Write-Host "2. Visit http://localhost:3000/integrations" -ForegroundColor White
Write-Host "3. Configure your Stripe integration" -ForegroundColor White
Write-Host "4. Set up webhooks using the guide" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
