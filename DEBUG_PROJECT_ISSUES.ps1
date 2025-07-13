# Project Debug and Issue Resolution Script
Write-Host "🔍 Starting Project Debug Analysis..." -ForegroundColor Green

# Step 1: Check project structure
Write-Host "`n📁 Analyzing project structure..." -ForegroundColor Yellow
$projectFiles = Get-ChildItem -Path . -Name
Write-Host "📄 Found $($projectFiles.Count) items in project root" -ForegroundColor Blue

# Step 2: Check for large files that might slow down VS Code
Write-Host "`n📊 Checking for large files..." -ForegroundColor Yellow
$largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 1MB -and $_.FullName -notmatch "node_modules|\.git" } | Sort-Object Length -Descending
if ($largeFiles) {
    Write-Host "🔍 Large files found:" -ForegroundColor Red
    $largeFiles | ForEach-Object { 
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  📄 $($_.Name) - ${sizeMB}MB" -ForegroundColor Yellow
    }
}
else {
    Write-Host "✅ No large files found" -ForegroundColor Green
}

# Step 3: Check node_modules status
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    if (Test-Path "node_modules") {
        $nodeModulesSize = (Get-ChildItem -Recurse "node_modules" | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($nodeModulesSize / 1MB, 2)
        Write-Host "📦 node_modules exists - ${sizeMB}MB" -ForegroundColor Blue
    }
    else {
        Write-Host "⚠️ node_modules missing - need to install dependencies" -ForegroundColor Red
    }
}
else {
    Write-Host "⚠️ package.json not found" -ForegroundColor Red
}

# Step 4: Check admin dashboard
Write-Host "`n🔧 Checking admin dashboard..." -ForegroundColor Yellow
if (Test-Path "admin-dashboard") {
    if (Test-Path "admin-dashboard/package.json") {
        Write-Host "✅ Admin dashboard found" -ForegroundColor Green
        if (Test-Path "admin-dashboard/node_modules") {
            Write-Host "✅ Admin dashboard dependencies installed" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Admin dashboard missing dependencies" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️ Admin dashboard package.json missing" -ForegroundColor Red
    }
}
else {
    Write-Host "⚠️ Admin dashboard folder not found" -ForegroundColor Red
}

# Step 5: Check Firebase functions
Write-Host "`n🔥 Checking Firebase functions..." -ForegroundColor Yellow
if (Test-Path "functions") {
    if (Test-Path "functions/package.json") {
        Write-Host "✅ Firebase functions found" -ForegroundColor Green
        if (Test-Path "functions/node_modules") {
            Write-Host "✅ Functions dependencies installed" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Functions missing dependencies" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️ Functions package.json missing" -ForegroundColor Red
    }
}
else {
    Write-Host "ℹ️ Firebase functions folder not found" -ForegroundColor Blue
}

# Step 6: Check for common issues
Write-Host "`n🩺 Checking for common issues..." -ForegroundColor Yellow

# Check for duplicate dependencies
if (Test-Path "package-lock.json") {
    Write-Host "✅ package-lock.json found" -ForegroundColor Green
}
else {
    Write-Host "⚠️ package-lock.json missing" -ForegroundColor Yellow
}

# Check for .expo folder
if (Test-Path ".expo") {
    $expoSize = (Get-ChildItem -Recurse ".expo" | Measure-Object -Property Length -Sum).Sum
    $sizeMB = [math]::Round($expoSize / 1MB, 2)
    Write-Host "📱 .expo folder exists - ${sizeMB}MB" -ForegroundColor Blue
}

# Step 7: Provide recommendations
Write-Host "`n💡 Recommendations:" -ForegroundColor Green
Write-Host "1. Install missing dependencies with: npm install" -ForegroundColor Cyan
Write-Host "2. For admin dashboard: cd admin-dashboard && npm install" -ForegroundColor Cyan
Write-Host "3. For functions: cd functions && npm install" -ForegroundColor Cyan
Write-Host "4. Clear .expo cache if needed: rm -rf .expo" -ForegroundColor Cyan
Write-Host "5. Restart VS Code after running optimizations" -ForegroundColor Cyan

Write-Host "`n🎯 Debug analysis complete!" -ForegroundColor Green
