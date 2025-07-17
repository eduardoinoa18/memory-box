# Belapp Mobile Deployment Script
# Run this script to build and deploy to app stores

Write-Host "🚀 Belapp Mobile Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if EAS CLI is installed
Write-Host "📋 Checking EAS CLI installation..." -ForegroundColor Yellow
try {
    $easVersion = eas --version
    Write-Host "✅ EAS CLI found: $easVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/eas-cli
    Write-Host "✅ EAS CLI installed" -ForegroundColor Green
}

# Check if logged in to Expo
Write-Host "🔐 Checking Expo login status..." -ForegroundColor Yellow
$loginStatus = eas whoami
if ($loginStatus -eq "Not logged in") {
    Write-Host "❌ Not logged in to Expo. Please login:" -ForegroundColor Red
    eas login
}
else {
    Write-Host "✅ Logged in as: $loginStatus" -ForegroundColor Green
}

# Show deployment options
Write-Host "`n📱 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Development build (testing)" -ForegroundColor White
Write-Host "2. Preview build (internal testing)" -ForegroundColor White
Write-Host "3. Production build (app stores)" -ForegroundColor White
Write-Host "4. iOS only (production)" -ForegroundColor White
Write-Host "5. Android only (production)" -ForegroundColor White
Write-Host "6. Submit to app stores" -ForegroundColor White
Write-Host "7. Complete deployment (build + submit)" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host "🔨 Building development version..." -ForegroundColor Yellow
        eas build --profile development
    }
    "2" {
        Write-Host "🔨 Building preview version..." -ForegroundColor Yellow
        eas build --profile preview
    }
    "3" {
        Write-Host "🔨 Building production version for both platforms..." -ForegroundColor Yellow
        eas build --profile production
    }
    "4" {
        Write-Host "🍎 Building iOS production version..." -ForegroundColor Yellow
        eas build --platform ios --profile production
    }
    "5" {
        Write-Host "🤖 Building Android production version..." -ForegroundColor Yellow
        eas build --platform android --profile production
    }
    "6" {
        Write-Host "📤 Submitting to app stores..." -ForegroundColor Yellow
        eas submit --platform all
    }
    "7" {
        Write-Host "🚀 Complete deployment: Building and submitting..." -ForegroundColor Yellow
        eas build --platform all --profile production
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful! Submitting to app stores..." -ForegroundColor Green
            eas submit --platform all
        }
        else {
            Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
        }
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🎯 Deployment Commands Reference:" -ForegroundColor Cyan
Write-Host "eas build:list          - Check build status" -ForegroundColor White
Write-Host "eas submit:list         - Check submission status" -ForegroundColor White
Write-Host "eas secret:list         - View environment variables" -ForegroundColor White
Write-Host "eas build:cancel        - Cancel running build" -ForegroundColor White

Write-Host "`n✅ Deployment script completed!" -ForegroundColor Green
Write-Host "📊 Monitor your builds at: https://expo.dev" -ForegroundColor Cyan
