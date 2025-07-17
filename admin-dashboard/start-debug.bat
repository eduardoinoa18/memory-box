@echo off
echo ======================================
echo  Memory Box Admin Dashboard Startup
echo ======================================
echo.

cd /d "c:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1\admin-dashboard"

echo 📁 Current directory: %CD%
echo.

echo 🔍 Checking if Next.js is installed...
call npm list next 2>nul
if errorlevel 1 (
    echo ❌ Next.js not found. Installing dependencies...
    call npm install
) else (
    echo ✅ Next.js is installed
)

echo.
echo 🚀 Starting the admin dashboard server...
echo 🌐 Server will be available at: http://localhost:3001
echo 📋 Routes:
echo    - http://localhost:3001/test (Test page)
echo    - http://localhost:3001/admin (Admin Dashboard)
echo    - http://localhost:3001/admin/users (User Management)
echo.

call npm run dev

pause
