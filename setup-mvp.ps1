# Memory Box MVP - Quick Setup and Deployment Script
# Run this in PowerShell to set up the complete platform

Write-Host "🚀 Memory Box MVP - Version 1 Setup" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the memory-box-mvp-v1 directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm run install:all

Write-Host "🔧 Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env"
    Write-Host "📝 Please edit .env with your Firebase configuration before continuing" -ForegroundColor Red
    Write-Host "Press any key to continue after configuring .env..."
    Read-Host
}

Write-Host "🏗️  Building all components..." -ForegroundColor Yellow
npm run build:all

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure .env with your Firebase settings"
Write-Host "2. Run 'npm run dev:admin' to test admin panel"
Write-Host "3. Run 'npm run dev:landing' to test landing page"  
Write-Host "4. Run 'npm run dev:app' to test main app"
Write-Host "5. Run 'npm run deploy:all' when ready for production"
Write-Host ""
Write-Host "📚 Documentation: README.md"
Write-Host "🔧 Existing config reference: ../Belapp-1/"
