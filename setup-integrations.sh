#!/bin/bash

# Memory Box Integrations Hub - Quick Setup Script
# This script helps set up the integrations hub and webhook system

echo "🚀 Memory Box Integrations Hub - Quick Setup"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of your Memory Box project"
    exit 1
fi

echo "📋 Step 1: Installing dependencies..."

# Install main app dependencies
echo "Installing main app dependencies..."
npm install

# Install admin dashboard dependencies
echo "Installing admin dashboard dependencies..."
cd admin-dashboard
npm install
cd ..

echo "✅ Dependencies installed successfully!"

echo ""
echo "📋 Step 2: Environment Setup"
echo "Please ensure you have the following environment files configured:"
echo ""
echo "📄 .env.local (main app):"
echo "  - EXPO_PUBLIC_FIREBASE_* variables"
echo "  - EXPO_PUBLIC_STRIPE_* variables"
echo ""
echo "📄 admin-dashboard/.env.local (admin dashboard):"
echo "  - NEXTAUTH_SECRET"
echo "  - NEXTAUTH_URL"
echo "  - Firebase config variables"
echo ""

echo "📋 Step 3: Firebase Setup"
echo "Make sure your Firebase project is configured with:"
echo "  ✅ Authentication enabled"
echo "  ✅ Firestore database created"
echo "  ✅ Storage bucket enabled"
echo "  ✅ Functions deployed"
echo ""

echo "📋 Step 4: Stripe Setup"
echo "1. Go to your admin dashboard: http://localhost:3000/integrations"
echo "2. Configure your Stripe keys in the Integrations Hub"
echo "3. Set up webhooks using the Webhook Setup Guide"
echo ""

echo "🎯 Quick Start Commands:"
echo ""
echo "Start the main app:"
echo "  npm start"
echo ""
echo "Start the admin dashboard:"
echo "  cd admin-dashboard && npm run dev"
echo ""
echo "Deploy Firebase Functions:"
echo "  firebase deploy --only functions"
echo ""

echo "📚 Documentation:"
echo "  - INTEGRATIONS_HUB_COMPLETE.md - Complete setup guide"
echo "  - WEBHOOK_SETUP_GUIDE.md - Webhook configuration"
echo "  - STRIPE_QUICK_REFERENCE.md - Stripe integration reference"
echo ""

echo "✅ Setup complete! Your Integrations Hub is ready to use."
echo ""
echo "🔗 Next steps:"
echo "1. Start your admin dashboard: cd admin-dashboard && npm run dev"
echo "2. Visit http://localhost:3000/integrations"
echo "3. Configure your Stripe integration"
echo "4. Set up webhooks using the guide"
echo ""
echo "Happy coding! 🎉"
