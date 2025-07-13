# 🧹 ADMIN DASHBOARD CLEANUP & OPTIMIZATION SCRIPT

Write-Host "🧹 Starting Admin Dashboard Cleanup..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$adminPath = "C:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1\admin-dashboard"
Set-Location $adminPath

Write-Host "📋 Current directory: $((Get-Location).Path)" -ForegroundColor Yellow

# 1. Remove unnecessary documentation files
Write-Host "`n1. Removing unnecessary documentation files..." -ForegroundColor Yellow
$filesToRemove = @(
    "DESIGN_ENHANCEMENT_COMPLETE.md",
    "EFFICIENCY_REFINEMENT_COMPLETE.md", 
    "EMERGENCY_START_GUIDE.md",
    "FINAL_LAYOUT_SUCCESS_SUMMARY.md",
    "ISSUES_FIXED_COMPLETE.md",
    "LAYOUT_DUPLICATION_FIX_COMPLETE.md",
    "LAYOUT_REFACTOR_COMPLETE.md",
    "PROFESSIONAL_ENHANCEMENT_COMPLETE.md",
    "SECURITY_IMPLEMENTATION.md",
    "SERVER_ACCESS_GUIDE.md",
    "TESTING_COMPLETE.md",
    "fix-pages.sh",
    "index.html"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ Removed: $file" -ForegroundColor Green
    }
}

# 2. Clean up redundant startup scripts
Write-Host "`n2. Consolidating startup scripts..." -ForegroundColor Yellow
$scriptsToRemove = @(
    "setup.bat",
    "setup.sh", 
    "start-admin.bat",
    "start-admin.sh",
    "start-dashboard.bat",
    "start-server.bat",
    "start-server.sh"
)

foreach ($script in $scriptsToRemove) {
    if (Test-Path $script) {
        Remove-Item $script -Force
        Write-Host "✅ Removed: $script" -ForegroundColor Green
    }
}

# 3. Clear Next.js cache and build files
Write-Host "`n3. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cleared .next cache" -ForegroundColor Green
}

# 4. Clean node_modules if needed (optional)
$nodeModulesSize = 0
if (Test-Path "node_modules") {
    $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📦 node_modules size: $([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Cyan
    
    if ($nodeModulesSize -gt 500) {
        Write-Host "⚠️  Large node_modules detected. Consider running: npm ci" -ForegroundColor Yellow
    }
}

# 5. Create optimized folder structure
Write-Host "`n4. Creating optimized folder structure..." -ForegroundColor Yellow

$folders = @(
    "components\auth",
    "components\users", 
    "components\content",
    "components\analytics",
    "components\marketing",
    "components\settings",
    "components\shared",
    "layouts",
    "lib\auth",
    "lib\firebase",
    "lib\utils",
    "hooks",
    "data",
    "public\assets\icons",
    "public\assets\images"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "📁 Created: $folder" -ForegroundColor Green
    }
}

# 6. Check current file count
$totalFiles = (Get-ChildItem -Recurse -File | Where-Object { $_.Name -notlike "node_modules*" -and $_.Name -notlike ".next*" }).Count
Write-Host "`n📊 Current file count: $totalFiles" -ForegroundColor Cyan

Write-Host "`n✅ Admin Dashboard cleanup completed!" -ForegroundColor Green
Write-Host "🚀 Ready for modular development" -ForegroundColor Cyan

# 7. Install any missing dependencies
Write-Host "`n5. Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}
else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run dev' to start the admin dashboard" -ForegroundColor White
Write-Host "2. Visit http://localhost:3001 to access admin panel" -ForegroundColor White
Write-Host "3. Ready to build advanced admin features!" -ForegroundColor White
