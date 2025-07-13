@echo off
cls
echo.
echo ================================================
echo   Memory Box Admin Dashboard - Quick Start
echo ================================================
echo.
echo Starting the complete admin system...
echo.

cd /d "c:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1\admin-dashboard"

echo Checking if server is already running on port 3001...
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo.
    echo ✅ Admin dashboard is already running!
    echo.
    echo Opening browser...
    start http://localhost:3001/admin
    echo.
    echo =====================================
    echo   ADMIN LOGIN CREDENTIALS:
    echo =====================================
    echo   Email: admin@memorybox.app
    echo   Password: admin123
    echo =====================================
    echo.
    echo Press any key to exit...
    pause >nul
    exit
)

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Checking Firebase installation...
npm list firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Firebase...
    npm install firebase
)

echo.
echo Build errors fixed! Starting admin dashboard on port 3001...
echo.
echo =====================================
echo   ADMIN LOGIN CREDENTIALS:
echo =====================================
echo   Email: admin@memorybox.app
echo   Password: admin123
echo =====================================
echo.
echo The admin dashboard includes:
echo ✅ User Management (28K+ users)
echo ✅ Content Moderation System
echo ✅ Marketing Automation Hub
echo ✅ AI Rob Assistant
echo ✅ Revenue Analytics Dashboard
echo ✅ CMS Integration
echo ✅ Business Intelligence Suite
echo.
echo Opening browser in 5 seconds...

timeout /t 5 /nobreak >nul
start http://localhost:3001/admin

npm run dev
