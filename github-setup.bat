@echo off
echo 🔗 GITHUB SETUP COMMANDS
echo ======================
echo.
echo STEP 1: Create GitHub Repository
echo - Go to: https://github.com/new
echo - Name: memory-box
echo - Visibility: Public or Private
echo - Don't initialize with README
echo - Click "Create repository"
echo.
echo STEP 2: Connect Repository (REPLACE YOUR_USERNAME!)
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/memory-box.git
echo git push -u origin main
echo.
echo STEP 3: Verify Upload
echo - Check your GitHub repository
echo - You should see all 349 files
echo.
echo STEP 4: Return to Vercel
echo - Refresh the Import page
echo - Your repository should now appear
echo.
echo ✅ Once pushed, your repository will be visible in Vercel!
pause
