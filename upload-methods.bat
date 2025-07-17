@echo off
echo 🔄 ALTERNATIVE UPLOAD METHODS
echo ============================
echo.
echo METHOD 1: GitHub Desktop (Recommended)
echo 1. Download GitHub Desktop: https://desktop.github.com/
echo 2. Sign in with your GitHub account
echo 3. Clone or create repository: eduardoinoa18/memory-box
echo 4. Copy all files to the repository folder
echo 5. Commit and push
echo.
echo METHOD 2: GitHub Web Interface
echo 1. Go to: https://github.com/eduardoinoa18/memory-box
echo 2. Click "uploading an existing file"
echo 3. Drag and drop the admin-dashboard and landing-page folders
echo 4. Commit the changes
echo.
echo METHOD 3: Command Line (if authentication works)
echo git remote add origin https://github.com/eduardoinoa18/memory-box.git
echo git push -u origin main
echo.
echo 📋 VERCEL IMPORT SETTINGS:
echo -------------------------
echo Repository: eduardoinoa18/memory-box
echo.
echo ADMIN DASHBOARD:
echo - Root Directory: admin-dashboard
echo - Framework: Next.js
echo.
echo LANDING PAGE:
echo - Root Directory: landing-page  
echo - Framework: Other
echo.
echo ✅ Once uploaded, repository will appear in Vercel import!
pause
