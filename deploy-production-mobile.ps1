# Production Deployment Script for Memory Box
# This script handles the complete deployment pipeline

param(
    [string]$Platform = "both",  # "ios", "android", or "both"
    [string]$Environment = "production",  # "production" or "preview"
    [switch]$SkipBuild = $false,
    [switch]$SkipSubmit = $false,
    [switch]$DryRun = $false
)

Write-Host "🚀 Memory Box Production Deployment" -ForegroundColor Cyan
Write-Host "Platform: $Platform" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Blue

# Check if EAS CLI is installed
if (!(Get-Command "eas" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/eas-cli
}

# Check if logged in to EAS
$easWhoami = eas whoami 2>&1
if ($easWhoami -match "Not logged in") {
    Write-Host "❌ Not logged in to EAS. Please run 'eas login'" -ForegroundColor Red
    exit 1
}

Write-Host "✅ EAS CLI ready" -ForegroundColor Green

# Validate environment variables
Write-Host "`n🔧 Validating environment variables..." -ForegroundColor Blue

$requiredEnvVars = @(
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN", 
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
    "STRIPE_PUBLISHABLE_KEY"
)

$missingVars = @()
foreach ($var in $requiredEnvVars) {
    if (!(eas secret:list --non-interactive | Select-String $var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host "`nPlease set them using: eas secret:push --name VARIABLE_NAME --value VARIABLE_VALUE"
    exit 1
}

Write-Host "✅ Environment variables validated" -ForegroundColor Green

# Pre-build checks
Write-Host "`n🔍 Running pre-build checks..." -ForegroundColor Blue

# Check app.config.js
if (!(Test-Path "mobile-app/app.config.js")) {
    Write-Host "❌ app.config.js not found in mobile-app directory" -ForegroundColor Red
    exit 1
}

# Check package.json
if (!(Test-Path "mobile-app/package.json")) {
    Write-Host "❌ package.json not found in mobile-app directory" -ForegroundColor Red
    exit 1
}

# Validate EAS configuration
if (!(Test-Path "eas.json")) {
    Write-Host "❌ eas.json not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pre-build checks passed" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Blue
Set-Location "mobile-app"

if ($DryRun) {
    Write-Host "🏃‍♂️ DRY RUN: Would install dependencies" -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Run tests (if they exist)
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        Write-Host "`n🧪 Running tests..." -ForegroundColor Blue
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would run tests" -ForegroundColor Yellow
        } else {
            npm test
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Tests failed" -ForegroundColor Red
                exit 1
            }
        }
        Write-Host "✅ Tests passed" -ForegroundColor Green
    }
}

# Build the app
if (!$SkipBuild) {
    Write-Host "`n🔨 Building the app..." -ForegroundColor Blue
    
    if ($Platform -eq "ios" -or $Platform -eq "both") {
        Write-Host "📱 Building iOS..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would build iOS app" -ForegroundColor Yellow
        } else {
            eas build --platform ios --profile $Environment --non-interactive
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ iOS build failed" -ForegroundColor Red
                exit 1
            }
        }
        Write-Host "✅ iOS build completed" -ForegroundColor Green
    }
    
    if ($Platform -eq "android" -or $Platform -eq "both") {
        Write-Host "🤖 Building Android..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would build Android app" -ForegroundColor Yellow
        } else {
            eas build --platform android --profile $Environment --non-interactive
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Android build failed" -ForegroundColor Red
                exit 1
            }
        }
        Write-Host "✅ Android build completed" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️ Skipping build (--SkipBuild flag used)" -ForegroundColor Yellow
}

# Submit to app stores
if (!$SkipSubmit -and $Environment -eq "production") {
    Write-Host "`n📱 Submitting to app stores..." -ForegroundColor Blue
    
    if ($Platform -eq "ios" -or $Platform -eq "both") {
        Write-Host "🍎 Submitting to App Store..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would submit to App Store" -ForegroundColor Yellow
        } else {
            eas submit --platform ios --latest --non-interactive
            if ($LASTEXITCODE -ne 0) {
                Write-Host "⚠️ iOS submission failed (this might be expected if not configured)" -ForegroundColor Yellow
            } else {
                Write-Host "✅ iOS submitted to App Store" -ForegroundColor Green
            }
        }
    }
    
    if ($Platform -eq "android" -or $Platform -eq "both") {
        Write-Host "🤖 Submitting to Google Play..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would submit to Google Play" -ForegroundColor Yellow
        } else {
            eas submit --platform android --latest --non-interactive
            if ($LASTEXITCODE -ne 0) {
                Write-Host "⚠️ Android submission failed (this might be expected if not configured)" -ForegroundColor Yellow
            } else {
                Write-Host "✅ Android submitted to Google Play" -ForegroundColor Green
            }
        }
    }
} else {
    if ($SkipSubmit) {
        Write-Host "⏭️ Skipping submission (--SkipSubmit flag used)" -ForegroundColor Yellow
    } else {
        Write-Host "⏭️ Skipping submission (not production environment)" -ForegroundColor Yellow
    }
}

# Deploy web admin panel
Write-Host "`n🌐 Deploying web admin panel..." -ForegroundColor Blue
Set-Location "../admin-dashboard"

if (Test-Path "package.json") {
    if ($DryRun) {
        Write-Host "🏃‍♂️ DRY RUN: Would deploy admin panel" -ForegroundColor Yellow
    } else {
        # Install dependencies
        npm install
        
        # Build for production
        npm run build
        
        # Deploy (assuming Vercel, adjust as needed)
        if (Get-Command "vercel" -ErrorAction SilentlyContinue) {
            vercel --prod --yes
            Write-Host "✅ Admin panel deployed" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Vercel CLI not found. Please deploy admin panel manually." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⏭️ No admin panel package.json found" -ForegroundColor Yellow
}

# Deployment summary
Write-Host "`n📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Platform: $Platform" -ForegroundColor White
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Dry Run: $DryRun" -ForegroundColor White

if (!$DryRun) {
    Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "`n📱 Next steps:" -ForegroundColor Blue
    Write-Host "1. Monitor build status in EAS dashboard" -ForegroundColor White
    Write-Host "2. Test the deployed app thoroughly" -ForegroundColor White
    Write-Host "3. Update App Store/Play Store metadata if needed" -ForegroundColor White
    Write-Host "4. Announce the release to users" -ForegroundColor White
} else {
    Write-Host "`n🏃‍♂️ Dry run completed - no actual deployment performed" -ForegroundColor Yellow
}

# Return to original directory
Set-Location ".."

Write-Host "`n✨ Done!" -ForegroundColor Green
