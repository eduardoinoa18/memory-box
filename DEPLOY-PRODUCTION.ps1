# Memory Box - Production Deployment Script (PowerShell)
# Builds and deploys both mobile app and web platforms

param(
    [switch]$SkipAppStores,
    [switch]$DryRun,
    [string]$Platform = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Memory Box Production Deployment" -ForegroundColor Blue
Write-Host "===================================" -ForegroundColor Blue

# Helper functions
function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
    exit 1
}

# Check if required commands exist
function Test-Dependencies {
    Write-Info "Checking dependencies..."
    
    $commands = @("eas", "firebase", "vercel", "npm")
    $missing = @()
    
    foreach ($cmd in $commands) {
        if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
            $missing += $cmd
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required commands: $($missing -join ', ')"
    }
    
    Write-Success "All dependencies found"
}

# Environment validation
function Test-Environment {
    Write-Info "Validating environment variables..."
    
    $requiredVars = @(
        "EXPO_PUBLIC_FIREBASE_API_KEY",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID", 
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    
    $missing = @()
    foreach ($var in $requiredVars) {
        if (!(Test-Path "env:$var")) {
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required environment variables: $($missing -join ', ')"
    }
    
    Write-Success "Environment variables validated"
}

# Build mobile app
function Build-MobileApp {
    Write-Info "Building mobile app for production..."
    
    Push-Location "mobile-app"
    
    try {
        # Install dependencies
        npm ci
        
        if ($Platform -eq "all" -or $Platform -eq "ios") {
            Write-Info "Building iOS app..."
            if ($DryRun) {
                Write-Info "DRY RUN: Would run 'eas build --platform ios --profile production'"
            } else {
                eas build --platform ios --profile production --non-interactive
            }
        }
        
        if ($Platform -eq "all" -or $Platform -eq "android") {
            Write-Info "Building Android app..."
            if ($DryRun) {
                Write-Info "DRY RUN: Would run 'eas build --platform android --profile production'"
            } else {
                eas build --platform android --profile production --non-interactive
            }
        }
        
        Write-Success "Mobile app builds completed"
    }
    finally {
        Pop-Location
    }
}

# Deploy admin dashboard
function Deploy-AdminDashboard {
    Write-Info "Deploying admin dashboard..."
    
    Push-Location "admin-dashboard"
    
    try {
        # Install dependencies and build
        npm ci
        npm run build
        
        # Deploy to Vercel
        if ($DryRun) {
            Write-Info "DRY RUN: Would run 'vercel --prod --confirm'"
        } else {
            vercel --prod --confirm
        }
        
        Write-Success "Admin dashboard deployed"
    }
    finally {
        Pop-Location
    }
}

# Deploy landing page
function Deploy-LandingPage {
    Write-Info "Deploying landing page..."
    
    Push-Location "landing-page"
    
    try {
        # Build landing page
        npm run build
        
        # Deploy to Vercel
        if ($DryRun) {
            Write-Info "DRY RUN: Would run 'vercel --prod --confirm'"
        } else {
            vercel --prod --confirm
        }
        
        Write-Success "Landing page deployed"
    }
    finally {
        Pop-Location
    }
}

# Deploy Firebase functions
function Deploy-FirebaseServices {
    Write-Info "Deploying Firebase services..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would deploy Firestore rules, Storage rules, and Cloud Functions"
        return
    }
    
    # Deploy Firestore rules
    firebase deploy --only firestore:rules
    
    # Deploy Storage rules  
    firebase deploy --only storage
    
    # Deploy Cloud Functions if they exist
    if (Test-Path "functions") {
        firebase deploy --only functions
    }
    
    Write-Success "Firebase services deployed"
}

# Submit to app stores
function Submit-ToAppStores {
    if ($SkipAppStores) {
        Write-Info "Skipping app store submissions"
        return
    }
    
    Write-Info "Submitting apps to stores..."
    
    Push-Location "mobile-app"
    
    try {
        if ($DryRun) {
            Write-Info "DRY RUN: Would submit to App Store and Google Play"
            return
        }
        
        # Submit to App Store
        Write-Warning "iOS submission requires manual approval in App Store Connect"
        eas submit --platform ios --latest
        
        # Submit to Google Play
        Write-Warning "Android submission will be uploaded to Google Play Console"
        eas submit --platform android --latest
        
        Write-Success "App store submissions initiated"
    }
    finally {
        Pop-Location
    }
}

# Main deployment flow
function Start-Deployment {
    Write-Host "Starting deployment process..." -ForegroundColor Blue
    Write-Host ""
    
    # Pre-flight checks
    Test-Dependencies
    Test-Environment
    
    # Get user confirmation unless dry run
    if (!$DryRun) {
        $response = Read-Host "This will deploy Memory Box to production. Continue? (y/N)"
        if ($response -notmatch "^[Yy]$") {
            Write-Warning "Deployment cancelled"
            exit 0
        }
    }
    
    # Build and deploy
    Write-Host ""
    Write-Info "Starting build and deployment..."
    
    try {
        # Deploy backend services first
        Deploy-FirebaseServices
        
        # Deploy web platforms
        Deploy-AdminDashboard
        Deploy-LandingPage
        
        # Build mobile apps
        Build-MobileApp
        
        # Submit to app stores
        Submit-ToAppStores
        
        Write-Host ""
        Write-Success "🎉 Deployment completed successfully!"
        Write-Host ""
        Write-Host "📱 Mobile apps: Check EAS dashboard for build status" -ForegroundColor Cyan
        Write-Host "🌐 Admin dashboard: https://admin.memorybox.app" -ForegroundColor Cyan
        Write-Host "🏠 Landing page: https://memorybox.app" -ForegroundColor Cyan
        Write-Host "🔥 Firebase: https://console.firebase.google.com" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Test all deployments" -ForegroundColor White
        Write-Host "2. Monitor error logs" -ForegroundColor White
        Write-Host "3. Update app store metadata" -ForegroundColor White
        Write-Host "4. Announce launch! 🚀" -ForegroundColor White
    }
    catch {
        Write-Error "Deployment failed: $_"
    }
}

# Run main function
Start-Deployment
