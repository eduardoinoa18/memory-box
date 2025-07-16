#!/bin/bash
# Memory Box - Production Build and Deployment Script
# Builds and deploys both mobile app and web platforms

set -e  # Exit on any error

echo "🚀 Memory Box Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if required commands exist
check_dependencies() {
    info "Checking dependencies..."
    
    if ! command -v eas &> /dev/null; then
        error "EAS CLI not found. Install with: npm install -g @expo/eas-cli"
    fi
    
    if ! command -v firebase &> /dev/null; then
        error "Firebase CLI not found. Install with: npm install -g firebase-tools"
    fi
    
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI not found. Install with: npm install -g vercel"
    fi
    
    success "All dependencies found"
}

# Environment validation
check_environment() {
    info "Validating environment variables..."
    
    required_vars=(
        "EXPO_PUBLIC_FIREBASE_API_KEY"
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Missing required environment variables: ${missing_vars[*]}"
    fi
    
    success "Environment variables validated"
}

# Build mobile app
build_mobile() {
    info "Building mobile app for production..."
    
    cd mobile-app
    
    # Install dependencies
    npm ci
    
    # Build for iOS
    info "Building iOS app..."
    eas build --platform ios --profile production --non-interactive
    
    # Build for Android
    info "Building Android app..."
    eas build --platform android --profile production --non-interactive
    
    cd ..
    success "Mobile app builds completed"
}

# Deploy admin dashboard
deploy_admin() {
    info "Deploying admin dashboard..."
    
    cd admin-dashboard
    
    # Install dependencies and build
    npm ci
    npm run build
    
    # Deploy to Vercel
    vercel --prod --confirm
    
    cd ..
    success "Admin dashboard deployed"
}

# Deploy landing page
deploy_landing() {
    info "Deploying landing page..."
    
    cd landing-page
    
    # Build landing page
    npm run build
    
    # Deploy to Vercel
    vercel --prod --confirm
    
    cd ..
    success "Landing page deployed"
}

# Deploy Firebase functions
deploy_functions() {
    info "Deploying Firebase functions..."
    
    # Deploy Firestore rules
    firebase deploy --only firestore:rules
    
    # Deploy Storage rules
    firebase deploy --only storage
    
    # Deploy Cloud Functions
    if [ -d "functions" ]; then
        firebase deploy --only functions
    fi
    
    success "Firebase services deployed"
}

# Submit to app stores
submit_apps() {
    info "Submitting apps to stores..."
    
    cd mobile-app
    
    # Submit to App Store
    warning "iOS submission requires manual approval in App Store Connect"
    eas submit --platform ios --latest
    
    # Submit to Google Play
    warning "Android submission will be uploaded to Google Play Console"
    eas submit --platform android --latest
    
    cd ..
    success "App store submissions initiated"
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    echo
    
    # Pre-flight checks
    check_dependencies
    check_environment
    
    # Get user confirmation
    echo "This will deploy Memory Box to production. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        warning "Deployment cancelled"
        exit 0
    fi
    
    # Build and deploy
    echo
    info "Starting build and deployment..."
    
    # Deploy backend services first
    deploy_functions
    
    # Deploy web platforms
    deploy_admin
    deploy_landing
    
    # Build mobile apps
    build_mobile
    
    # Optional: Submit to app stores
    echo
    echo "Submit to app stores? (y/N)"
    read -r submit_response
    if [[ "$submit_response" =~ ^[Yy]$ ]]; then
        submit_apps
    fi
    
    echo
    success "🎉 Deployment completed successfully!"
    echo
    echo "📱 Mobile apps: Check EAS dashboard for build status"
    echo "🌐 Admin dashboard: https://admin.memorybox.app"
    echo "🏠 Landing page: https://memorybox.app"
    echo "🔥 Firebase: https://console.firebase.google.com"
    echo
    echo "Next steps:"
    echo "1. Test all deployments"
    echo "2. Monitor error logs"
    echo "3. Update app store metadata"
    echo "4. Announce launch! 🚀"
}

# Run main function
main "$@"
