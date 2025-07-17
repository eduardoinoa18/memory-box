# Memory Box Mobile App Launcher (Alternative Version)
Write-Host "🚀 Starting Memory Box Mobile Application (Alternative Version)..." -ForegroundColor Cyan
Write-Host ""

# Change to the memory-box mobile app directory
Set-Location "c:\Users\eduar\OneDrive\Desktop\Belapp\memory-box\mobile-app"

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the Expo web app
Write-Host "🌐 Starting Expo web server..." -ForegroundColor Green
Write-Host "📱 App will be available at: http://localhost:19006" -ForegroundColor Cyan
Write-Host ""

# Start the app
npm run web
