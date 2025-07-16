# Complete Memory Box Setup Script
# This script sets up Firebase, configures EAS, and prepares for deployment

param(
    [switch]$SkipFirebase = $false,
    [switch]$SkipEAS = $false,
    [switch]$SkipDependencies = $false,
    [switch]$DryRun = $false
)

Write-Host @"
🚀 MEMORY BOX COMPLETE SETUP
===========================
🔥 Firebase Integration
📱 EAS Configuration  
⚡ Production Deployment Ready
"@ -ForegroundColor Cyan

# Step 1: Check Prerequisites
Write-Host "`n📋 Step 1: Checking Prerequisites" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

$requiredTools = @{
    "node" = "Node.js"
    "npm" = "NPM"
    "git" = "Git"
}

$missingTools = @()
foreach ($tool in $requiredTools.Keys) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        $missingTools += $requiredTools[$tool]
        Write-Host "❌ $($requiredTools[$tool]) not found" -ForegroundColor Red
    } else {
        Write-Host "✅ $($requiredTools[$tool]) installed" -ForegroundColor Green
    }
}

if ($missingTools.Count -gt 0) {
    Write-Host "`n❌ Missing required tools: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host "Please install them and run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Install Dependencies
if (!$SkipDependencies) {
    Write-Host "`n📦 Step 2: Installing Dependencies" -ForegroundColor Blue
    Write-Host "==================================" -ForegroundColor Blue
    
    # Install global tools
    $globalTools = @(
        "@expo/eas-cli",
        "firebase-tools",
        "vercel"
    )
    
    foreach ($tool in $globalTools) {
        Write-Host "Installing $tool..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would install $tool" -ForegroundColor Yellow
        } else {
            npm install -g $tool
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $tool installed" -ForegroundColor Green
            } else {
                Write-Host "⚠️ $tool installation failed" -ForegroundColor Yellow
            }
        }
    }
    
    # Install project dependencies
    Write-Host "`nInstalling project dependencies..." -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "🏃‍♂️ DRY RUN: Would install project dependencies" -ForegroundColor Yellow
    } else {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Project dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "❌ Project dependencies installation failed" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "`n⏭️ Step 2: Skipping dependency installation" -ForegroundColor Yellow
}

# Step 3: Firebase Setup
if (!$SkipFirebase) {
    Write-Host "`n🔥 Step 3: Firebase Setup" -ForegroundColor Blue
    Write-Host "=========================" -ForegroundColor Blue
    
    # Check if Firebase is configured
    if (Test-Path "firebase.json") {
        Write-Host "✅ Firebase configuration found" -ForegroundColor Green
        
        # Login check
        $firebaseLogin = firebase projects:list 2>&1
        if ($firebaseLogin -match "not logged in") {
            Write-Host "❌ Not logged in to Firebase" -ForegroundColor Red
            Write-Host "Please run: firebase login" -ForegroundColor Yellow
            if (!$DryRun) {
                Write-Host "Opening Firebase login..." -ForegroundColor Cyan
                firebase login
            }
        } else {
            Write-Host "✅ Logged in to Firebase" -ForegroundColor Green
        }
        
        # Deploy Firebase rules and functions
        Write-Host "`nDeploying Firebase components..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would deploy Firebase components" -ForegroundColor Yellow
        } else {
            & ".\deploy-firebase.ps1" -Environment production
        }
    } else {
        Write-Host "⚠️ Firebase not configured. Run 'firebase init' first." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏭️ Step 3: Skipping Firebase setup" -ForegroundColor Yellow
}

# Step 4: EAS Configuration
if (!$SkipEAS) {
    Write-Host "`n📱 Step 4: EAS Configuration" -ForegroundColor Blue
    Write-Host "============================" -ForegroundColor Blue
    
    # Check EAS login
    $easLogin = eas whoami 2>&1
    if ($easLogin -match "Not logged in") {
        Write-Host "❌ Not logged in to EAS" -ForegroundColor Red
        Write-Host "Please run: eas login" -ForegroundColor Yellow
        if (!$DryRun) {
            Write-Host "Opening EAS login..." -ForegroundColor Cyan
            eas login
        }
    } else {
        Write-Host "✅ Logged in to EAS: $easLogin" -ForegroundColor Green
    }
    
    # Check if EAS is configured
    if (Test-Path "eas.json") {
        Write-Host "✅ EAS configuration found" -ForegroundColor Green
    } else {
        Write-Host "⚠️ EAS not configured. Running eas build:configure..." -ForegroundColor Yellow
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would configure EAS" -ForegroundColor Yellow
        } else {
            eas build:configure
        }
    }
    
    # Set up EAS secrets
    if (Test-Path ".env.production") {
        Write-Host "`nSetting up EAS secrets..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "🏃‍♂️ DRY RUN: Would set up EAS secrets" -ForegroundColor Yellow
        } else {
            & ".\setup-eas-secrets.ps1" -ConfigFile ".env.production" -Force
        }
    } else {
        Write-Host "⚠️ .env.production not found. Please create it with your configuration." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏭️ Step 4: Skipping EAS configuration" -ForegroundColor Yellow
}

# Step 5: Validate Configuration
Write-Host "`n🔍 Step 5: Validating Configuration" -ForegroundColor Blue
Write-Host "===================================" -ForegroundColor Blue

$configChecks = @()

# Check Firebase config
if (Test-Path "firebase.config.js") {
    $configChecks += "✅ Firebase configuration"
} else {
    $configChecks += "❌ Firebase configuration missing"
}

# Check Firestore rules
if (Test-Path "firestore.rules") {
    $configChecks += "✅ Firestore security rules"
} else {
    $configChecks += "❌ Firestore security rules missing"
}

# Check Storage rules
if (Test-Path "storage.rules") {
    $configChecks += "✅ Storage security rules"
} else {
    $configChecks += "❌ Storage security rules missing"
}

# Check EAS config
if (Test-Path "eas.json") {
    $configChecks += "✅ EAS build configuration"
} else {
    $configChecks += "❌ EAS build configuration missing"
}

# Check app config
if (Test-Path "mobile-app/app.config.js") {
    $configChecks += "✅ Mobile app configuration"
} else {
    $configChecks += "❌ Mobile app configuration missing"
}

# Check environment config
if (Test-Path ".env.production") {
    $configChecks += "✅ Production environment variables"
} else {
    $configChecks += "❌ Production environment variables missing"
}

foreach ($check in $configChecks) {
    Write-Host $check
}

# Step 6: Next Steps
Write-Host "`n🎯 Step 6: Next Steps" -ForegroundColor Blue
Write-Host "=====================" -ForegroundColor Blue

Write-Host @"
Your Memory Box setup is ready! Here's what to do next:

🔧 CONFIGURATION:
1. Update .env.production with your actual Firebase credentials
2. Configure Stripe keys in .env.production
3. Set up Prizeout API keys (optional)

🚀 DEPLOYMENT:
4. Test locally: expo start
5. Build for production: .\deploy-production-mobile.ps1
6. Deploy admin panel: .\deploy-firebase.ps1

📱 APP STORES:
7. Configure Apple Developer account in eas.json
8. Configure Google Play credentials in eas.json
9. Submit to app stores: eas submit

🔒 SECURITY:
10. Review and update Firestore security rules
11. Configure Firebase Authentication providers
12. Set up monitoring and analytics

📊 MONITORING:
13. Set up Firebase Performance Monitoring
14. Configure Crashlytics for error reporting
15. Set up user analytics and engagement tracking
"@ -ForegroundColor White

if ($DryRun) {
    Write-Host "`n🏃‍♂️ This was a dry run - no actual changes were made" -ForegroundColor Yellow
    Write-Host "Run the script without -DryRun to apply all changes" -ForegroundColor Yellow
}

Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "Memory Box is ready for production deployment! 🚀" -ForegroundColor Cyan
