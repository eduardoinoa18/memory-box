# EAS Secrets Configuration Script
# Run this script to set up environment variables for EAS builds

Write-Host "🔐 EAS Secrets Configuration for Belapp" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Firebase and Stripe configuration first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Reading configuration from .env.local..." -ForegroundColor Yellow

# Read .env.local file
$envVars = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^([^#][^=]*)=(.*)$") {
        $envVars[$matches[1].Trim()] = $matches[2].Trim().Trim('"')
    }
}

Write-Host "🔧 Setting up EAS secrets..." -ForegroundColor Yellow

# Firebase Configuration
if ($envVars.ContainsKey("EXPO_PUBLIC_FIREBASE_API_KEY")) {
    Write-Host "Setting FIREBASE_API_KEY..." -ForegroundColor Green
    eas secret:create --scope project --name FIREBASE_API_KEY --value $envVars["EXPO_PUBLIC_FIREBASE_API_KEY"] --force
}

if ($envVars.ContainsKey("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN")) {
    Write-Host "Setting FIREBASE_AUTH_DOMAIN..." -ForegroundColor Green
    eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value $envVars["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"] --force
}

if ($envVars.ContainsKey("EXPO_PUBLIC_FIREBASE_PROJECT_ID")) {
    Write-Host "Setting FIREBASE_PROJECT_ID..." -ForegroundColor Green
    eas secret:create --scope project --name FIREBASE_PROJECT_ID --value $envVars["EXPO_PUBLIC_FIREBASE_PROJECT_ID"] --force
}

if ($envVars.ContainsKey("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET")) {
    Write-Host "Setting FIREBASE_STORAGE_BUCKET..." -ForegroundColor Green
    eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value $envVars["EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"] --force
}

if ($envVars.ContainsKey("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")) {
    Write-Host "Setting FIREBASE_MESSAGING_SENDER_ID..." -ForegroundColor Green
    eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value $envVars["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] --force
}

if ($envVars.ContainsKey("EXPO_PUBLIC_FIREBASE_APP_ID")) {
    Write-Host "Setting FIREBASE_APP_ID..." -ForegroundColor Green
    eas secret:create --scope project --name FIREBASE_APP_ID --value $envVars["EXPO_PUBLIC_FIREBASE_APP_ID"] --force
}

# Stripe Configuration
if ($envVars.ContainsKey("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY")) {
    Write-Host "Setting STRIPE_PUBLISHABLE_KEY..." -ForegroundColor Green
    eas secret:create --scope project --name STRIPE_PUBLISHABLE_KEY --value $envVars["EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"] --force
}

Write-Host "`n✅ EAS secrets configuration completed!" -ForegroundColor Green

Write-Host "`n📋 Viewing configured secrets:" -ForegroundColor Cyan
eas secret:list

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update app.json with your EAS project ID" -ForegroundColor White
Write-Host "2. Update eas.json with your Apple/Google Play details" -ForegroundColor White
Write-Host "3. Run deploy-mobile.ps1 to start building" -ForegroundColor White

Write-Host "`n⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "- Make sure you're using PRODUCTION Stripe keys for app store builds" -ForegroundColor White
Write-Host "- Double-check Firebase project settings are correct" -ForegroundColor White
Write-Host "- Ensure you have Apple Developer and Google Play Console accounts" -ForegroundColor White
