# Memory Box - EAS Build Configuration Setup
# Configures EAS (Expo Application Services) for production builds

Write-Host "📱 Setting up EAS Build Configuration" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

$ErrorActionPreference = "Stop"

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

# Check if EAS CLI is installed
function Test-EASInstallation {
    Write-Info "Checking EAS CLI installation..."
    
    if (!(Get-Command eas -ErrorAction SilentlyContinue)) {
        Write-Warning "EAS CLI not found. Installing..."
        npm install -g @expo/eas-cli
        Write-Success "EAS CLI installed"
    } else {
        Write-Success "EAS CLI found"
    }
}

# Login to EAS
function Connect-EAS {
    Write-Info "Connecting to EAS..."
    
    try {
        $result = eas whoami 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Already logged in to EAS as: $($result)"
        } else {
            Write-Info "Please log in to EAS..."
            eas login
            Write-Success "Logged in to EAS"
        }
    }
    catch {
        Write-Info "Please log in to EAS..."
        eas login
        Write-Success "Logged in to EAS"
    }
}

# Configure EAS project
function Initialize-EASProject {
    Write-Info "Initializing EAS project..."
    
    Push-Location "mobile-app"
    
    try {
        # Initialize EAS configuration if not exists
        if (!(Test-Path "eas.json")) {
            eas build:configure
            Write-Success "EAS configuration created"
        } else {
            Write-Success "EAS configuration already exists"
        }
        
        # Show current configuration
        Write-Info "Current EAS configuration:"
        Get-Content "eas.json" | Write-Host
    }
    finally {
        Pop-Location
    }
}

# Setup environment secrets
function Set-EASSecrets {
    Write-Info "Setting up EAS environment secrets..."
    
    Push-Location "mobile-app"
    
    try {
        # Required environment variables for production
        $secrets = @{
            "EXPO_PUBLIC_FIREBASE_API_KEY" = $env:EXPO_PUBLIC_FIREBASE_API_KEY
            "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN" = $env:EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
            "EXPO_PUBLIC_FIREBASE_PROJECT_ID" = $env:EXPO_PUBLIC_FIREBASE_PROJECT_ID
            "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET" = $env:EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
            "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = $env:EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
            "EXPO_PUBLIC_FIREBASE_APP_ID" = $env:EXPO_PUBLIC_FIREBASE_APP_ID
            "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY" = $env:EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
            "EXPO_PUBLIC_PRIZEOUT_API_KEY" = $env:EXPO_PUBLIC_PRIZEOUT_API_KEY
        }
        
        $missing = @()
        foreach ($key in $secrets.Keys) {
            $value = $secrets[$key]
            if ([string]::IsNullOrEmpty($value)) {
                $missing += $key
                Write-Warning "Missing environment variable: $key"
            } else {
                # Set the secret in EAS
                Write-Info "Setting EAS secret: $key"
                $maskedValue = "*" * ($value.Length - 4) + $value.Substring($value.Length - 4)
                Write-Host "  Value: $maskedValue"
                
                # Use echo to pipe the value to eas secret:create
                echo $value | eas secret:create --scope project --name $key --type string --force
            }
        }
        
        if ($missing.Count -gt 0) {
            Write-Warning "Please set the following environment variables and run this script again:"
            $missing | ForEach-Object { Write-Host "  $_" }
        } else {
            Write-Success "All EAS secrets configured"
        }
        
        # List all secrets
        Write-Info "Current EAS secrets:"
        eas secret:list
    }
    finally {
        Pop-Location
    }
}

# Setup iOS certificates and profiles
function Set-iOSCredentials {
    Write-Info "Setting up iOS credentials..."
    
    Push-Location "mobile-app"
    
    try {
        Write-Warning "iOS credentials setup requires Apple Developer account"
        Write-Info "This will help you configure:"
        Write-Host "  • Apple Developer Team ID"
        Write-Host "  • Distribution Certificate"
        Write-Host "  • Provisioning Profile"
        
        $response = Read-Host "Do you want to configure iOS credentials now? (y/N)"
        if ($response -match "^[Yy]$") {
            eas credentials:configure --platform ios
            Write-Success "iOS credentials configured"
        } else {
            Write-Info "Skipping iOS credentials setup"
            Write-Warning "You'll need to configure iOS credentials before building for App Store"
        }
    }
    finally {
        Pop-Location
    }
}

# Setup Android keystore
function Set-AndroidCredentials {
    Write-Info "Setting up Android credentials..."
    
    Push-Location "mobile-app"
    
    try {
        Write-Info "This will help you configure:"
        Write-Host "  • Android Keystore"
        Write-Host "  • Key Alias"
        Write-Host "  • Google Service Account (for Play Store)"
        
        $response = Read-Host "Do you want to configure Android credentials now? (y/N)"
        if ($response -match "^[Yy]$") {
            eas credentials:configure --platform android
            Write-Success "Android credentials configured"
        } else {
            Write-Info "Skipping Android credentials setup"
            Write-Warning "You'll need to configure Android credentials before building for Google Play"
        }
    }
    finally {
        Pop-Location
    }
}

# Test build configuration
function Test-BuildConfiguration {
    Write-Info "Testing build configuration..."
    
    Push-Location "mobile-app"
    
    try {
        Write-Info "Validating EAS configuration..."
        eas config --platform all
        
        Write-Success "Build configuration is valid"
        
        Write-Info "You can now run production builds with:"
        Write-Host "  eas build --platform ios --profile production" -ForegroundColor Yellow
        Write-Host "  eas build --platform android --profile production" -ForegroundColor Yellow
    }
    finally {
        Pop-Location
    }
}

# Main setup flow
function Start-EASSetup {
    Write-Host "Starting EAS setup process..." -ForegroundColor Blue
    Write-Host ""
    
    try {
        # Check and install EAS CLI
        Test-EASInstallation
        
        # Login to EAS
        Connect-EAS
        
        # Initialize EAS project
        Initialize-EASProject
        
        # Setup environment secrets
        Set-EASSecrets
        
        # Setup platform credentials
        Set-iOSCredentials
        Set-AndroidCredentials
        
        # Test configuration
        Test-BuildConfiguration
        
        Write-Host ""
        Write-Success "🎉 EAS setup completed successfully!"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Review eas.json configuration" -ForegroundColor White
        Write-Host "2. Test with development builds: eas build --profile development" -ForegroundColor White
        Write-Host "3. Run production builds: eas build --profile production" -ForegroundColor White
        Write-Host "4. Submit to stores: eas submit" -ForegroundColor White
        Write-Host ""
        Write-Host "📚 Documentation: https://docs.expo.dev/build/introduction/" -ForegroundColor Cyan
    }
    catch {
        Write-Error "EAS setup failed: $_"
    }
}

# Run main function
Start-EASSetup
