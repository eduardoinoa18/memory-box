# Memory Box Complete Launch Script
param(
    [switch]$SkipDependencies,
    [switch]$OpenBrowser,
    [string]$Port = "19006"
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-PortAvailable {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

Write-ColorOutput "🚀 Memory Box Complete Platform Launcher" "Cyan"
Write-ColorOutput "================================================" "Cyan"

# Set working directory
$AppPath = "c:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1"
if (-not (Test-Path $AppPath)) {
    Write-ColorOutput "❌ App directory not found: $AppPath" "Red"
    exit 1
}

Set-Location $AppPath
Write-ColorOutput "📁 Working directory: $AppPath" "Green"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-ColorOutput "✅ Node.js: $nodeVersion" "Green"
} catch {
    Write-ColorOutput "❌ Node.js not found. Please install Node.js first." "Red"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-ColorOutput "✅ npm: $npmVersion" "Green"
} catch {
    Write-ColorOutput "❌ npm not found." "Red"
    exit 1
}

# Install dependencies if needed
if (-not $SkipDependencies) {
    if (-not (Test-Path "node_modules") -or -not (Test-Path "node_modules\.expo")) {
        Write-ColorOutput "📦 Installing dependencies..." "Yellow"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Failed to install dependencies" "Red"
            exit 1
        }
        Write-ColorOutput "✅ Dependencies installed" "Green"
    } else {
        Write-ColorOutput "✅ Dependencies already installed" "Green"
    }
}

# Check if port is available
if (-not (Test-PortAvailable $Port)) {
    Write-ColorOutput "⚠️ Port $Port is already in use. Trying to kill existing process..." "Yellow"
    try {
        $processesToKill = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                          Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($processId in $processesToKill) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-ColorOutput "🔄 Killed process $processId" "Yellow"
        }
        Start-Sleep -Seconds 2
    } catch {
        Write-ColorOutput "⚠️ Could not kill existing processes" "Yellow"
    }
}

# Set environment variables
$env:NODE_ENV = "development"
$env:EXPO_DEVTOOLS_LISTEN_ADDRESS = "0.0.0.0"
$env:EXPO_CLI_PASSWORD = ""

Write-ColorOutput "🌟 Starting Memory Box Main App..." "Green"
Write-ColorOutput "📱 Main App will be available at: http://localhost:$Port" "Yellow"
Write-ColorOutput "🏢 Admin Dashboard available at: http://localhost:3001" "Yellow"
Write-ColorOutput "" "White"

# Create launch HTML if it doesn't exist
$launchHtml = "launch-memory-box.html"
if (Test-Path $launchHtml) {
    Write-ColorOutput "🌐 Launch page: $AppPath\$launchHtml" "Cyan"
}

Write-ColorOutput "🎯 Feature List:" "Magenta"
Write-ColorOutput "  📸 Photo and Video Upload with AI categorization" "White"
Write-ColorOutput "  🤖 Rob AI Letter Generator" "White"
Write-ColorOutput "  👨‍👩‍👧‍👦 Family Sharing and Permission Management" "White"
Write-ColorOutput "  📁 Smart Folder Organization" "White"
Write-ColorOutput "  🔍 Advanced Search and Memory Timeline" "White"
Write-ColorOutput "  💳 Subscription Management (Stripe)" "White"
Write-ColorOutput "  📊 Memory Analytics and Insights" "White"
Write-ColorOutput "  ☁️ Cloud Backup and Export" "White"
Write-ColorOutput "" "White"

# Open browser if requested
if ($OpenBrowser) {
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:$Port"
}

Write-ColorOutput "🚀 Launching Expo development server..." "Green"
Write-ColorOutput "Press Ctrl+C to stop the server" "Yellow"
Write-ColorOutput "================================================" "Cyan"

# Start the main application
try {
    npm run web
} catch {
    Write-ColorOutput "❌ Failed to start the main app" "Red"
    Write-ColorOutput "💡 You can try manually with: npm run web" "Yellow"
    exit 1
}
