# Firebase Setup Validation Script
# PowerShell version for Windows

Write-Host "🔥 Firebase Setup Validation" -ForegroundColor Yellow
Write-Host ""

# Function to check .env file
function Test-EnvFile {
    Write-Host "1. Checking .env configuration..." -ForegroundColor Cyan
    
    $envPath = ".\.env"
    if (-not (Test-Path $envPath)) {
        Write-Host "❌ .env file not found" -ForegroundColor Red
        return $false
    }
    
    $envContent = Get-Content $envPath -Raw
    $requiredVars = @(
        "EXPO_PUBLIC_FIREBASE_API_KEY",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", 
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
        "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "EXPO_PUBLIC_FIREBASE_APP_ID"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var -or $envContent -match "$var=your_") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "❌ Missing or placeholder Firebase environment variables:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "📝 Please update your .env file with actual Firebase values from:" -ForegroundColor Yellow
        Write-Host "   Firebase Console > Project Settings > General > Your apps" -ForegroundColor Yellow
        Write-Host ""
        return $false
    }
    
    Write-Host "✅ .env file configured correctly" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Function to check Firebase config
function Test-FirebaseConfig {
    Write-Host "2. Checking Firebase configuration..." -ForegroundColor Cyan
    
    $configPath = ".\config\firebase.js"
    if (-not (Test-Path $configPath)) {
        Write-Host "❌ Firebase config file not found at config\firebase.js" -ForegroundColor Red
        return $false
    }
    
    $configContent = Get-Content $configPath -Raw
    $requiredExports = @("auth", "db", "storage", "functions")
    
    $missingExports = @()
    foreach ($export in $requiredExports) {
        if ($configContent -notmatch "export const $export") {
            $missingExports += $export
        }
    }
    
    if ($missingExports.Count -gt 0) {
        Write-Host "❌ Missing Firebase service exports:" -ForegroundColor Red
        foreach ($export in $missingExports) {
            Write-Host "   - $export" -ForegroundColor Red
        }
        return $false
    }
    
    Write-Host "✅ Firebase configuration file is correct" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Function to check Storage rules
function Test-StorageRules {
    Write-Host "3. Checking Firebase Storage rules..." -ForegroundColor Cyan
    
    $rulesPath = ".\storage.rules"
    if (-not (Test-Path $rulesPath)) {
        Write-Host "❌ storage.rules file not found" -ForegroundColor Red
        return $false
    }
    
    $rulesContent = Get-Content $rulesPath -Raw
    
    if ($rulesContent -notmatch "users/\{userId\}/memories/") {
        Write-Host "❌ Storage rules missing user folder structure" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Firebase Storage rules configured correctly" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Function to check Upload component
function Test-UploadComponent {
    Write-Host "4. Checking Upload component..." -ForegroundColor Cyan
    
    $uploadPath = ".\components\Upload\UploadMemory.jsx"
    if (-not (Test-Path $uploadPath)) {
        Write-Host "❌ UploadMemory component not found" -ForegroundColor Red
        return $false
    }
    
    $uploadContent = Get-Content $uploadPath -Raw
    
    $requiredImports = @(
        "firebase/storage",
        "firebase/firestore",
        "../config/firebase"
    )
    
    $missingImports = @()
    foreach ($import in $requiredImports) {
        if ($uploadContent -notmatch [regex]::Escape($import)) {
            $missingImports += $import
        }
    }
    
    if ($missingImports.Count -gt 0) {
        Write-Host "❌ Missing imports in UploadMemory component:" -ForegroundColor Red
        foreach ($import in $missingImports) {
            Write-Host "   - $import" -ForegroundColor Red
        }
        return $false
    }
    
    # Check folder structure generation
    if ($uploadContent -notmatch "users/\$\{userId\}/memories/\$\{type\}/") {
        Write-Host "❌ Upload component missing correct folder structure" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Upload component configured correctly" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Function to check dependencies
function Test-Dependencies {
    Write-Host "5. Checking Firebase dependencies..." -ForegroundColor Cyan
    
    $packagePath = ".\package.json"
    if (-not (Test-Path $packagePath)) {
        Write-Host "❌ package.json not found" -ForegroundColor Red
        return $false
    }
    
    $packageContent = Get-Content $packagePath -Raw | ConvertFrom-Json
    
    if (-not $packageContent.dependencies.firebase) {
        Write-Host "❌ Firebase not installed" -ForegroundColor Red
        Write-Host "   Run: npm install firebase" -ForegroundColor Yellow
        return $false
    }
    
    $firebaseVersion = $packageContent.dependencies.firebase
    Write-Host "✅ Firebase $firebaseVersion installed" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Main validation function
function Start-Validation {
    $checks = @(
        (Test-Dependencies),
        (Test-EnvFile),
        (Test-FirebaseConfig),
        (Test-StorageRules),
        (Test-UploadComponent)
    )
    
    $allPassed = ($checks | Where-Object { $_ -eq $false }).Count -eq 0
    
    Write-Host ("=" * 50) -ForegroundColor Gray
    
    if ($allPassed) {
        Write-Host "🎉 All Firebase setup checks passed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 Your folder structure will be:" -ForegroundColor Yellow
        Write-Host "   users/{userId}/memories/{type}/{timestamp}.{extension}" -ForegroundColor White
        Write-Host ""
        Write-Host "📱 Supported file types:" -ForegroundColor Yellow
        Write-Host "   - images/ (jpg, png, gif, etc.)" -ForegroundColor White
        Write-Host "   - videos/ (mp4, mov, etc.)" -ForegroundColor White
        Write-Host "   - audio/ (mp3, wav, etc.)" -ForegroundColor White
        Write-Host "   - documents/ (pdf, doc, etc.)" -ForegroundColor White
        Write-Host ""
        Write-Host "🚀 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Update .env with your Firebase project values" -ForegroundColor White
        Write-Host "   2. Deploy storage.rules to Firebase Console" -ForegroundColor White
        Write-Host "   3. Test upload functionality" -ForegroundColor White
    }
    else {
        Write-Host "❌ Some setup checks failed. Please fix the issues above." -ForegroundColor Red
    }
    
    Write-Host ("=" * 50) -ForegroundColor Gray
}

# Change to the project directory and run validation
if (Test-Path "config\firebase.js") {
    Start-Validation
}
else {
    Write-Host "❌ Please run this script from your project root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
}
