@echo off
REM Memory Box Vercel Deployment Script for Windows

echo 🚀 MEMORY BOX VERCEL DEPLOYMENT SETUP
echo =====================================

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo .pnp
        echo .pnp.js
        echo.
        echo # Production builds
        echo .next/
        echo out/
        echo build/
        echo dist/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.production
        echo .env.development
        echo.
        echo # Logs
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Coverage directory
        echo coverage/
        echo.
        echo # OS generated files
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # IDE files
        echo .vscode/
        echo .idea/
        echo *.swp
        echo.
        echo # Vercel
        echo .vercel
        echo.
        echo # Expo
        echo .expo/
    ) > .gitignore
)

echo.
echo 📋 DEPLOYMENT STEPS:
echo.
echo 1. GITHUB SETUP:
echo    - Create a new repository on GitHub
echo    - Run: git add .
echo    - Run: git commit -m "Initial commit - Memory Box platform"
echo    - Run: git branch -M main
echo    - Run: git remote add origin https://github.com/YOUR_USERNAME/memory-box.git
echo    - Run: git push -u origin main
echo.
echo 2. VERCEL ADMIN DASHBOARD DEPLOYMENT:
echo    - Go to https://vercel.com/new
echo    - Import your GitHub repository
echo    - Set Root Directory: admin-dashboard
echo    - Framework Preset: Next.js
echo    - Add environment variables from admin-dashboard/.env.vercel.example
echo    - Deploy
echo.
echo 3. VERCEL LANDING PAGE DEPLOYMENT:
echo    - Create another project on Vercel
echo    - Import the same GitHub repository
echo    - Set Root Directory: landing-page
echo    - Framework Preset: Other
echo    - Add environment variables from landing-page/.env.vercel.example
echo    - Deploy
echo.
echo 4. ENVIRONMENT VARIABLES TO SET IN VERCEL:
echo.
echo    🔐 ADMIN DASHBOARD VARIABLES:
echo    ├── NEXT_PUBLIC_FIREBASE_API_KEY
echo    ├── NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo    ├── FIREBASE_ADMIN_CREDENTIALS (base64 encoded)
echo    ├── STRIPE_PUBLIC_KEY
echo    ├── STRIPE_SECRET_KEY
echo    ├── PRIZEOUT_API_KEY
echo    ├── TWILIO_ACCOUNT_SID
echo    ├── TWILIO_AUTH_TOKEN
echo    ├── SENDGRID_API_KEY
echo    └── ADMIN_SECRET_KEY
echo.
echo    🌐 LANDING PAGE VARIABLES:
echo    ├── NEXT_PUBLIC_FIREBASE_API_KEY
echo    ├── NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo    ├── NEXT_PUBLIC_STRIPE_PUBLIC_KEY
echo    ├── NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
echo    └── NEXT_PUBLIC_SITE_URL
echo.
echo 5. DOMAIN CONFIGURATION:
echo    - Admin: admin.memorybox.app → Admin Dashboard Vercel URL
echo    - Main: memorybox.app → Landing Page Vercel URL
echo.
echo ✅ Ready for deployment!
echo Run 'git add . && git commit -m "Deploy to Vercel" && git push' to push to GitHub

pause
