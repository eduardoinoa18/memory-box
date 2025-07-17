# Firebase Deployment Script
# Deploys Firestore rules, Storage rules, and Cloud Functions

param(
    [string]$Environment = "production",
    [switch]$RulesOnly = $false,
    [switch]$FunctionsOnly = $false,
    [switch]$DryRun = $false
)

Write-Host "🔥 Firebase Deployment for Memory Box" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check if Firebase CLI is installed
if (!(Get-Command "firebase" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Check if logged in to Firebase
$firebaseProjects = firebase projects:list 2>&1
if ($firebaseProjects -match "not logged in") {
    Write-Host "❌ Not logged in to Firebase. Please run 'firebase login'" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Firebase CLI ready" -ForegroundColor Green

# Check firebase.json exists
if (!(Test-Path "firebase.json")) {
    Write-Host "❌ firebase.json not found" -ForegroundColor Red
    exit 1
}

# Load Firebase configuration
$firebaseConfig = Get-Content "firebase.json" | ConvertFrom-Json
$projectId = $firebaseConfig.projectId

if (!$projectId) {
    Write-Host "❌ Project ID not found in firebase.json" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Project ID: $projectId" -ForegroundColor Blue

# Deploy Firestore rules
if (!$FunctionsOnly) {
    Write-Host "`n🔒 Deploying Firestore security rules..." -ForegroundColor Blue
    
    if (Test-Path "firestore.rules") {
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would deploy Firestore rules" -ForegroundColor Yellow
        } else {
            firebase deploy --only firestore:rules --project $projectId
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Firestore rules deployed" -ForegroundColor Green
            } else {
                Write-Host "❌ Firestore rules deployment failed" -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "⚠️ firestore.rules not found" -ForegroundColor Yellow
    }
    
    # Deploy Firestore indexes
    if (Test-Path "firestore.indexes.json") {
        Write-Host "📊 Deploying Firestore indexes..." -ForegroundColor Blue
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would deploy Firestore indexes" -ForegroundColor Yellow
        } else {
            firebase deploy --only firestore:indexes --project $projectId
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Firestore indexes deployed" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Firestore indexes deployment failed (this might be expected)" -ForegroundColor Yellow
            }
        }
    }
}

# Deploy Storage rules
if (!$FunctionsOnly) {
    Write-Host "`n📁 Deploying Storage security rules..." -ForegroundColor Blue
    
    if (Test-Path "storage.rules") {
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would deploy Storage rules" -ForegroundColor Yellow
        } else {
            firebase deploy --only storage --project $projectId
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Storage rules deployed" -ForegroundColor Green
            } else {
                Write-Host "❌ Storage rules deployment failed" -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "⚠️ storage.rules not found" -ForegroundColor Yellow
    }
}

# Deploy Cloud Functions
if (!$RulesOnly) {
    Write-Host "`n⚡ Deploying Cloud Functions..." -ForegroundColor Blue
    
    if (Test-Path "functions") {
        Set-Location "functions"
        
        # Install function dependencies
        if (Test-Path "package.json") {
            Write-Host "📦 Installing function dependencies..." -ForegroundColor Cyan
            if ($DryRun) {
                Write-Host "🏃‍♂️ DRY RUN: Would install function dependencies" -ForegroundColor Yellow
            } else {
                npm install
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "❌ Failed to install function dependencies" -ForegroundColor Red
                    Set-Location ".."
                    exit 1
                }
            }
        }
        
        Set-Location ".."
        
        # Deploy functions
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would deploy Cloud Functions" -ForegroundColor Yellow
        } else {
            firebase deploy --only functions --project $projectId
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Cloud Functions deployed" -ForegroundColor Green
            } else {
                Write-Host "❌ Cloud Functions deployment failed" -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "⚠️ functions directory not found" -ForegroundColor Yellow
    }
}

# Verify deployment
if (!$DryRun) {
    Write-Host "`n🔍 Verifying deployment..." -ForegroundColor Blue
    
    # Test Firestore rules
    Write-Host "Testing Firestore connection..." -ForegroundColor Cyan
    $firestoreTest = firebase firestore:databases:list --project $projectId 2>&1
    if ($firestoreTest -match "default") {
        Write-Host "✅ Firestore accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Firestore verification failed" -ForegroundColor Yellow
    }
    
    # List functions
    Write-Host "Checking Cloud Functions..." -ForegroundColor Cyan
    $functionsTest = firebase functions:list --project $projectId 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cloud Functions accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Cloud Functions verification failed" -ForegroundColor Yellow
    }
}

# Deployment summary
Write-Host "`n📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Project: $projectId" -ForegroundColor White
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Dry Run: $DryRun" -ForegroundColor White

if (!$DryRun) {
    Write-Host "`n🎉 Firebase deployment completed!" -ForegroundColor Green
    Write-Host "`n📱 Next steps:" -ForegroundColor Blue
    Write-Host "1. Test the app with the deployed backend" -ForegroundColor White
    Write-Host "2. Verify all Firebase services are working" -ForegroundColor White
    Write-Host "3. Monitor Firebase Console for any issues" -ForegroundColor White
    Write-Host "4. Set up monitoring and alerts" -ForegroundColor White
} else {
    Write-Host "`n🏃‍♂️ Dry run completed - no actual deployment performed" -ForegroundColor Yellow
}

Write-Host "`n✨ Done!" -ForegroundColor Green
