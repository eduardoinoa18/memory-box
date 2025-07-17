# Memory Box - Complete Deployment Script
# This script will deploy all components of the Memory Box platform

Write-Host "🚀 Starting Memory Box Deployment..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Git is available
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (!(Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Stage all files
Write-Host "📁 Staging all files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    $commitMessage = "Production deployment: Memory Box v1.0.0 - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMessage
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No changes to commit" -ForegroundColor Blue
}

# Check if remote origin exists
$remoteUrl = git remote get-url origin 2>$null
if (!$remoteUrl) {
    Write-Host "🔗 Setting up GitHub remote..." -ForegroundColor Yellow
    Write-Host "Please enter your GitHub repository URL (e.g., https://github.com/username/memory-box.git):" -ForegroundColor Cyan
    $repoUrl = Read-Host
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ GitHub remote added" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No repository URL provided. Skipping GitHub setup." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ GitHub remote already configured: $remoteUrl" -ForegroundColor Green
}

# Push to GitHub
if ($remoteUrl -or (git remote get-url origin 2>$null)) {
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    try {
        git push -u origin main 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Code pushed to GitHub successfully" -ForegroundColor Green
        } else {
            # Try master branch if main fails
            git push -u origin master 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Code pushed to GitHub successfully (master branch)" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Failed to push to GitHub. You may need to authenticate or check your repository settings." -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️ GitHub push failed. Please check your credentials and repository access." -ForegroundColor Yellow
    }
}

# Deploy to Vercel
Write-Host "" -ForegroundColor White
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Cyan

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is available" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Vercel CLI. Please install manually: npm install -g vercel" -ForegroundColor Red
        exit 1
    }
}

# Deploy main app to Vercel
Write-Host "🚀 Deploying main app..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
vercel --prod --yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Main app deployed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Main app deployment may have issues. Check Vercel dashboard." -ForegroundColor Yellow
}

# Deploy admin dashboard
Write-Host "🔧 Deploying admin dashboard..." -ForegroundColor Yellow
if (Test-Path "admin-dashboard") {
    Set-Location "admin-dashboard"
    vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Admin dashboard deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Admin dashboard deployment may have issues. Check Vercel dashboard." -ForegroundColor Yellow
    }
    Set-Location ..
}

# Deploy landing page
Write-Host "🎨 Deploying landing page..." -ForegroundColor Yellow
if (Test-Path "landing-page") {
    Set-Location "landing-page"
    vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Landing page deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Landing page deployment may have issues. Check Vercel dashboard." -ForegroundColor Yellow
    }
    Set-Location ..
}

# Final summary
Write-Host "" -ForegroundColor White
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Your Memory Box platform has been deployed:" -ForegroundColor Cyan
Write-Host "📱 Main App: Check your Vercel dashboard for the URL" -ForegroundColor White
Write-Host "⚙️ Admin Dashboard: Check your Vercel dashboard for the URL" -ForegroundColor White
Write-Host "🌐 Landing Page: Check your Vercel dashboard for the URL" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Configure your Firebase project settings" -ForegroundColor White
Write-Host "3. Set up your Stripe payment configuration" -ForegroundColor White
Write-Host "4. Test all functionality on the deployed URLs" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔗 Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "🔥 Firebase Console: https://console.firebase.google.com" -ForegroundColor Blue
Write-Host "💳 Stripe Dashboard: https://dashboard.stripe.com" -ForegroundColor Blue

Write-Host "" -ForegroundColor White
Write-Host "Happy deploying! 🚀" -ForegroundColor Green
