#!/bin/bash
# Memory Box - Production Deployment Verification Script

echo "🚀 Memory Box Production Deployment Verification"
echo "=============================================="
echo ""

# Check admin dashboard build
echo "📊 Testing Admin Dashboard Build..."
cd admin-dashboard
if npm run build; then
    echo "✅ Admin Dashboard build: SUCCESSFUL"
else
    echo "❌ Admin Dashboard build: FAILED"
    exit 1
fi
echo ""

# Check landing page build
echo "🌐 Testing Landing Page Build..."
cd ../landing-page
if npm run build; then
    echo "✅ Landing Page build: SUCCESSFUL"
else
    echo "❌ Landing Page build: FAILED"
    exit 1
fi
echo ""

# Verify key files exist
echo "📁 Verifying Key Files..."

FILES=(
    "admin-dashboard/pages/admin/cms.jsx"
    "admin-dashboard/.next"
    "landing-page/index.html"
    "landing-page/memory-box-logo.svg"
    "landing-page/public/index.html"
)

for file in "${FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo ""
echo "🎉 All verification checks passed!"
echo ""
echo "Ready for deployment to:"
echo "  📊 Admin Dashboard: https://your-admin-domain.vercel.app"
echo "  🌐 Landing Page: https://your-landing-domain.vercel.app"
echo ""
echo "Next steps:"
echo "1. Deploy admin dashboard: cd admin-dashboard && vercel --prod"
echo "2. Deploy landing page: cd landing-page && vercel --prod"
echo "3. Configure download links in admin panel"
echo "4. Test end-to-end functionality"
