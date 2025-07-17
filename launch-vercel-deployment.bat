@echo off
echo 🚀 Memory Box - Vercel Deployment Launcher
echo.
echo Opening Vercel dashboard and repository for deployment...
echo.

REM Open Vercel dashboard
start https://vercel.com/new

REM Open GitHub repository
start https://github.com/eduardoinoa18/memory-box

echo ✅ Browser windows opened!
echo.
echo 📋 Quick Deployment Checklist:
echo.
echo 1. In Vercel: Click "Import Git Repository"
echo 2. Search for: eduardoinoa18/memory-box
echo 3. Import the repository
echo.
echo 🖥️ Admin Dashboard Setup:
echo    - Project Name: memory-box-admin
echo    - Root Directory: admin-dashboard
echo    - Framework: Next.js
echo.
echo 🌐 Landing Page Setup:
echo    - Project Name: memory-box-landing  
echo    - Root Directory: landing-page
echo    - Framework: Other (Static)
echo.
echo 💡 Environment variables are in .env.vercel.example files
echo.
pause
