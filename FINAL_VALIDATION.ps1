# 🔍 FINAL VALIDATION SCRIPT
# Validates project health after cleanup and before launch

Write-Host "🔍 BELAPP FINAL VALIDATION" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1"
Set-Location $rootPath

$errors = @()
$warnings = @()

Write-Host "📋 Checking Essential Files..." -ForegroundColor Yellow

# Essential files check
$essentialFiles = @{
    "App.js"          = "Main application file"
    "app.json"        = "Expo configuration"
    "eas.json"        = "EAS build configuration"
    "package.json"    = "Dependencies and scripts"
    ".env.local"      = "Environment variables"
    "babel.config.js" = "Babel configuration"
    "metro.config.js" = "Metro bundler configuration"
}

foreach ($file in $essentialFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "✅ $file - $($essentialFiles[$file])" -ForegroundColor Green
    }
    else {
        $errors += "Missing essential file: $file"
        Write-Host "❌ $file - MISSING!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Checking Project Structure..." -ForegroundColor Yellow

# Directory structure check
$essentialDirs = @{
    "components"      = "React components"
    "services"        = "Firebase and business logic services"
    "config"          = "Configuration files"
    "utils"           = "Utility functions"
    "screens"         = "Screen components"
    "assets"          = "Images and static assets"
    "functions"       = "Firebase Cloud Functions"
    "admin-dashboard" = "Admin dashboard application"
}

foreach ($dir in $essentialDirs.Keys) {
    if (Test-Path $dir -PathType Container) {
        Write-Host "✅ /$dir - $($essentialDirs[$dir])" -ForegroundColor Green
    }
    else {
        $warnings += "Missing directory: $dir"
        Write-Host "⚠️  /$dir - Missing (may be optional)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 Checking Environment Configuration..." -ForegroundColor Yellow

# Check .env.local content
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $requiredEnvVars = @(
        "EXPO_PUBLIC_FIREBASE_API_KEY",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", 
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
        "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "EXPO_PUBLIC_FIREBASE_APP_ID",
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    
    foreach ($envVar in $requiredEnvVars) {
        $found = $envContent | Where-Object { $_ -like "$envVar=*" }
        if ($found) {
            Write-Host "✅ $envVar configured" -ForegroundColor Green
        }
        else {
            $errors += "Missing environment variable: $envVar"
            Write-Host "❌ $envVar - Missing!" -ForegroundColor Red
        }
    }
}
else {
    $errors += "Missing .env.local file"
}

Write-Host ""
Write-Host "📋 Checking Package Dependencies..." -ForegroundColor Yellow

# Check package.json content
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        # Check essential dependencies
        $essentialDeps = @(
            "@expo/vector-icons",
            "@react-navigation/native",
            "@react-navigation/bottom-tabs",
            "expo",
            "react-native",
            "firebase"
        )
        
        foreach ($dep in $essentialDeps) {
            if ($packageJson.dependencies.$dep) {
                Write-Host "✅ $dep installed" -ForegroundColor Green
            }
            else {
                $warnings += "Dependency not found: $dep"
                Write-Host "⚠️  $dep - Not found (check if needed)" -ForegroundColor Yellow
            }
        }
        
        # Check scripts
        $requiredScripts = @("start", "build:production", "deploy")
        foreach ($script in $requiredScripts) {
            if ($packageJson.scripts.$script) {
                Write-Host "✅ Script '$script' available" -ForegroundColor Green
            }
            else {
                $warnings += "Missing script: $script"
                Write-Host "⚠️  Script '$script' - Missing" -ForegroundColor Yellow
            }
        }
        
    }
    catch {
        $errors += "Invalid package.json format"
        Write-Host "❌ package.json - Invalid JSON format!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Checking App Configuration..." -ForegroundColor Yellow

# Check app.json content
if (Test-Path "app.json") {
    try {
        $appJson = Get-Content "app.json" | ConvertFrom-Json
        
        if ($appJson.expo.name) {
            Write-Host "✅ App name: $($appJson.expo.name)" -ForegroundColor Green
        }
        else {
            $errors += "Missing app name in app.json"
        }
        
        if ($appJson.expo.version) {
            Write-Host "✅ App version: $($appJson.expo.version)" -ForegroundColor Green
        }
        else {
            $errors += "Missing app version in app.json"
        }
        
        if ($appJson.expo.ios.bundleIdentifier) {
            Write-Host "✅ iOS bundle ID: $($appJson.expo.ios.bundleIdentifier)" -ForegroundColor Green
        }
        else {
            $warnings += "Missing iOS bundle identifier"
        }
        
        if ($appJson.expo.android.package) {
            Write-Host "✅ Android package: $($appJson.expo.android.package)" -ForegroundColor Green
        }
        else {
            $warnings += "Missing Android package name"
        }
        
    }
    catch {
        $errors += "Invalid app.json format"
        Write-Host "❌ app.json - Invalid JSON format!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Checking Assets..." -ForegroundColor Yellow

# Check essential assets
$essentialAssets = @{
    "assets/icon.png"          = "App icon"
    "assets/splash.png"        = "Splash screen"
    "assets/adaptive-icon.png" = "Android adaptive icon"
}

foreach ($asset in $essentialAssets.Keys) {
    if (Test-Path $asset) {
        Write-Host "✅ $asset - $($essentialAssets[$asset])" -ForegroundColor Green
    }
    else {
        $warnings += "Missing asset: $asset"
        Write-Host "⚠️  $asset - Missing" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 Checking Admin Dashboard..." -ForegroundColor Yellow

if (Test-Path "admin-dashboard" -PathType Container) {
    Set-Location "admin-dashboard"
    
    if (Test-Path "package.json") {
        Write-Host "✅ Admin dashboard package.json exists" -ForegroundColor Green
    }
    else {
        $warnings += "Admin dashboard package.json missing"
    }
    
    if (Test-Path "pages") {
        Write-Host "✅ Admin dashboard pages directory exists" -ForegroundColor Green
    }
    else {
        $warnings += "Admin dashboard pages directory missing"
    }
    
    Set-Location $rootPath
}
else {
    $warnings += "Admin dashboard directory missing"
}

Write-Host ""
Write-Host "📋 Checking Firebase Functions..." -ForegroundColor Yellow

if (Test-Path "functions" -PathType Container) {
    Set-Location "functions"
    
    if (Test-Path "index.js") {
        Write-Host "✅ Firebase Functions index.js exists" -ForegroundColor Green
    }
    else {
        $warnings += "Firebase Functions index.js missing"
    }
    
    if (Test-Path "package.json") {
        Write-Host "✅ Firebase Functions package.json exists" -ForegroundColor Green
    }
    else {
        $warnings += "Firebase Functions package.json missing"
    }
    
    Set-Location $rootPath
}
else {
    $warnings += "Firebase Functions directory missing"
}

Write-Host ""
Write-Host "🎯 VALIDATION RESULTS" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 PERFECT! Your project is 100% ready for launch!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All essential files present" -ForegroundColor Green
    Write-Host "✅ Configuration files valid" -ForegroundColor Green
    Write-Host "✅ Dependencies properly configured" -ForegroundColor Green
    Write-Host "✅ Assets ready for deployment" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can proceed with mobile deployment!" -ForegroundColor Green
    
}
elseif ($errors.Count -eq 0) {
    Write-Host "✅ GOOD! Project is ready with minor warnings:" -ForegroundColor Green
    Write-Host ""
    foreach ($warning in $warnings) {
        Write-Host "⚠️  $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "🚀 You can proceed with deployment, but consider addressing warnings." -ForegroundColor Green
    
}
else {
    Write-Host "❌ ISSUES FOUND! Please fix these errors before launch:" -ForegroundColor Red
    Write-Host ""
    foreach ($error in $errors) {
        Write-Host "❌ $error" -ForegroundColor Red
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Also consider these warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "⚠️  $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🛠️  Fix all errors before proceeding with deployment." -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Quick Test Commands:" -ForegroundColor Cyan
Write-Host "npm start              - Test main app" -ForegroundColor White
Write-Host "cd admin-dashboard && npm run dev - Test admin dashboard" -ForegroundColor White
Write-Host "eas build --profile preview - Test mobile build" -ForegroundColor White
