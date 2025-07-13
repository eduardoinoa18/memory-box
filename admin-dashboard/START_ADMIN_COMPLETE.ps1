# 🚀 COMPLETE ADMIN DASHBOARD STARTUP SCRIPT

Write-Host "🚀 Starting Belapp Admin Dashboard System" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

$adminPath = "C:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1\admin-dashboard"
Set-Location $adminPath

# 1. Clean up first
Write-Host "`n🧹 Step 1: Cleaning up admin dashboard..." -ForegroundColor Yellow
if (Test-Path "CLEANUP_ADMIN.ps1") {
    .\CLEANUP_ADMIN.ps1
}
else {
    Write-Host "⚠️  Cleanup script not found, continuing..." -ForegroundColor Yellow
}

# 2. Check dependencies
Write-Host "`n📦 Step 2: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# 3. Check required files
Write-Host "`n🔍 Step 3: Verifying admin dashboard structure..." -ForegroundColor Yellow
$requiredFiles = @(
    "layouts\AdminLayout.jsx",
    "pages\admin\index.jsx", 
    "pages\admin\users.jsx",
    "pages\admin\content.jsx",
    "package.json",
    "next.config.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host "Please ensure all admin files are properly created." -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "✅ All required admin files present" -ForegroundColor Green
}

# 4. Start the admin dashboard
Write-Host "`n🌐 Step 4: Starting admin dashboard server..." -ForegroundColor Yellow
Write-Host "Port: 3001" -ForegroundColor Cyan
Write-Host "URL: http://localhost:3001" -ForegroundColor Cyan

# Check if port 3001 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 3001 is already in use!" -ForegroundColor Yellow
    Write-Host "Attempting to kill existing process..." -ForegroundColor Yellow
    
    # Try to kill the process using port 3001
    $processId = (Get-NetTCPConnection -LocalPort 3001).OwningProcess
    if ($processId) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Start the development server
Write-Host "`n🚀 Starting admin dashboard..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ ADMIN DASHBOARD FEATURES AVAILABLE:" -ForegroundColor Green
Write-Host "🏠 Dashboard Overview    - http://localhost:3001/admin" -ForegroundColor White
Write-Host "👥 User Management       - http://localhost:3001/admin/users" -ForegroundColor White  
Write-Host "📁 Content Management    - http://localhost:3001/admin/content" -ForegroundColor White
Write-Host "💌 Letter Management     - http://localhost:3001/admin/letters" -ForegroundColor White
Write-Host "🌐 Landing Page Builder  - http://localhost:3001/admin/landing" -ForegroundColor White
Write-Host "📖 Blog Management       - http://localhost:3001/admin/blog" -ForegroundColor White
Write-Host "📧 Email Marketing       - http://localhost:3001/admin/email" -ForegroundColor White
Write-Host "📊 Analytics Dashboard   - http://localhost:3001/admin/analytics" -ForegroundColor White
Write-Host "💰 Revenue Management    - http://localhost:3001/admin/revenue" -ForegroundColor White
Write-Host "🔧 Settings & Config     - http://localhost:3001/admin/settings" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n🎯 WHAT YOU CAN DO NOW:" -ForegroundColor Yellow
Write-Host "✅ Manage all platform users with advanced filtering" -ForegroundColor White
Write-Host "✅ Moderate content with approval/rejection system" -ForegroundColor White
Write-Host "✅ View real-time analytics and performance metrics" -ForegroundColor White
Write-Host "✅ Manage user roles and permissions" -ForegroundColor White
Write-Host "✅ Export reports and user data" -ForegroundColor White
Write-Host "✅ Clean, responsive interface optimized for productivity" -ForegroundColor White

Write-Host "`n🚀 Starting server now..." -ForegroundColor Green

# Start the server and open browser
Start-Process "http://localhost:3001/admin"
npm run dev
