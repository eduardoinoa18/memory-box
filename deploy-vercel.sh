#!/bin/bash
# Memory Box Vercel Deployment Script

echo "🚀 MEMORY BOX VERCEL DEPLOYMENT SETUP"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.production
.env.development

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Vercel
.vercel

# Expo
.expo/
EOF
fi

echo "📋 DEPLOYMENT STEPS:"
echo ""
echo "1. GITHUB SETUP:"
echo "   - Create a new repository on GitHub"
echo "   - Run: git add ."
echo "   - Run: git commit -m 'Initial commit - Memory Box platform'"
echo "   - Run: git branch -M main"
echo "   - Run: git remote add origin https://github.com/YOUR_USERNAME/memory-box.git"
echo "   - Run: git push -u origin main"
echo ""
echo "2. VERCEL ADMIN DASHBOARD DEPLOYMENT:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repository"
echo "   - Set Root Directory: admin-dashboard"
echo "   - Framework Preset: Next.js"
echo "   - Add environment variables from admin-dashboard/.env.vercel.example"
echo "   - Deploy"
echo ""
echo "3. VERCEL LANDING PAGE DEPLOYMENT:"
echo "   - Create another project on Vercel"
echo "   - Import the same GitHub repository"
echo "   - Set Root Directory: landing-page"
echo "   - Framework Preset: Other"
echo "   - Add environment variables from landing-page/.env.vercel.example"
echo "   - Deploy"
echo ""
echo "4. ENVIRONMENT VARIABLES TO SET IN VERCEL:"
echo ""
echo "   🔐 ADMIN DASHBOARD VARIABLES:"
echo "   ├── NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   ├── NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   ├── FIREBASE_ADMIN_CREDENTIALS (base64 encoded)"
echo "   ├── STRIPE_PUBLIC_KEY"
echo "   ├── STRIPE_SECRET_KEY"
echo "   ├── PRIZEOUT_API_KEY"
echo "   ├── TWILIO_ACCOUNT_SID"
echo "   ├── TWILIO_AUTH_TOKEN"
echo "   ├── SENDGRID_API_KEY"
echo "   └── ADMIN_SECRET_KEY"
echo ""
echo "   🌐 LANDING PAGE VARIABLES:"
echo "   ├── NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   ├── NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   ├── NEXT_PUBLIC_STRIPE_PUBLIC_KEY"
echo "   ├── NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"
echo "   └── NEXT_PUBLIC_SITE_URL"
echo ""
echo "5. DOMAIN CONFIGURATION:"
echo "   - Admin: admin.memorybox.app → Admin Dashboard Vercel URL"
echo "   - Main: memorybox.app → Landing Page Vercel URL"
echo ""
echo "✅ Ready for deployment!"
echo "Run 'git add . && git commit -m \"Deploy to Vercel\" && git push' to push to GitHub"
