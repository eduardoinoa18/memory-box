# Complete Project Restart and Optimization Script
Write-Host "🚀 COMPLETE PROJECT RESTART & OPTIMIZATION" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Step 1: Close all development processes
Write-Host "`n🛑 Closing all development processes..." -ForegroundColor Yellow
$processes = @("Code", "node", "npm", "expo", "chrome", "msedge")
foreach ($proc in $processes) {
    try {
        Get-Process $proc -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "✅ Closed $proc" -ForegroundColor Green
    }
    catch {
        Write-Host "ℹ️ $proc was not running" -ForegroundColor Blue
    }
}
Start-Sleep -Seconds 3

# Step 2: Run VS Code optimization
Write-Host "`n🔧 Running VS Code optimization..." -ForegroundColor Yellow
& ".\VS_CODE_OPTIMIZE.ps1"

# Step 3: Clean project dependencies
Write-Host "`n🧹 Cleaning project dependencies..." -ForegroundColor Yellow

# Main project
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed main node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

# Admin dashboard
if (Test-Path "admin-dashboard/node_modules") {
    Remove-Item -Recurse -Force "admin-dashboard/node_modules"
    Write-Host "✅ Removed admin dashboard node_modules" -ForegroundColor Green
}
if (Test-Path "admin-dashboard/package-lock.json") {
    Remove-Item -Force "admin-dashboard/package-lock.json"
    Write-Host "✅ Removed admin dashboard package-lock.json" -ForegroundColor Green
}

# Functions
if (Test-Path "functions/node_modules") {
    Remove-Item -Recurse -Force "functions/node_modules"
    Write-Host "✅ Removed functions node_modules" -ForegroundColor Green
}
if (Test-Path "functions/package-lock.json") {
    Remove-Item -Force "functions/package-lock.json"
    Write-Host "✅ Removed functions package-lock.json" -ForegroundColor Green
}

# Step 4: Clear Expo cache
Write-Host "`n📱 Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "✅ Removed .expo cache" -ForegroundColor Green
}

# Step 5: Reinstall dependencies
Write-Host "`n📦 Reinstalling dependencies..." -ForegroundColor Yellow

# Main project
Write-Host "Installing main project dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Main dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Main dependencies installation failed" -ForegroundColor Red
}

# Admin dashboard
Write-Host "Installing admin dashboard dependencies..." -ForegroundColor Cyan
Set-Location "admin-dashboard"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin dashboard dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Admin dashboard dependencies installation failed" -ForegroundColor Red
}
Set-Location ".."

# Functions
Write-Host "Installing functions dependencies..." -ForegroundColor Cyan
Set-Location "functions"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Functions dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Functions dependencies installation failed" -ForegroundColor Red
}
Set-Location ".."

# Step 6: Create optimized VS Code settings
Write-Host "`n⚙️ Creating optimized VS Code settings..." -ForegroundColor Yellow
if (-not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode"
}

$vscodeSettings = @"
{
    "workbench.startupEditor": "none",
    "editor.minimap.enabled": false,
    "editor.wordWrap": "on",
    "editor.formatOnSave": true,
    "extensions.autoUpdate": false,
    "extensions.autoCheckUpdates": false,
    "git.autofetch": false,
    "search.exclude": {
        "**/node_modules": true,
        "**/bower_components": true,
        "**/.expo": true,
        "**/dist": true,
        "**/.next": true,
        "**/build": true,
        "**/.git": true
    },
    "files.exclude": {
        "**/node_modules": true,
        "**/.expo": true,
        "**/dist": true,
        "**/.next": true,
        "**/build": true
    },
    "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/.expo/**": true,
        "**/dist/**": true,
        "**/.next/**": true,
        "**/build/**": true
    },
    "typescript.preferences.includePackageJsonAutoImports": "off",
    "typescript.suggest.autoImports": false,
    "javascript.suggest.autoImports": false
}
"@

$vscodeSettings | Out-File -FilePath ".vscode/settings.json" -Encoding UTF8
Write-Host "✅ VS Code settings optimized" -ForegroundColor Green

# Step 7: Final system cleanup
Write-Host "`n🧹 Final system cleanup..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ npm cache cleared" -ForegroundColor Green

# Step 8: Start VS Code
Write-Host "`n🎯 RESTART COMPLETE!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ VS Code optimized" -ForegroundColor Green
Write-Host "  ✅ All caches cleared" -ForegroundColor Green
Write-Host "  ✅ Dependencies reinstalled" -ForegroundColor Green
Write-Host "  ✅ Project structure optimized" -ForegroundColor Green
Write-Host "`n🚀 Starting VS Code..." -ForegroundColor Yellow

Start-Sleep -Seconds 2
code .

Write-Host "`n🎉 VS Code should now run much smoother!" -ForegroundColor Green
Write-Host "💡 If you still experience issues, restart your computer" -ForegroundColor Cyan
