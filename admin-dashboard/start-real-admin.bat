@echo off
echo.
echo ================================================
echo   Memory Box Complete Admin Dashboard
echo ================================================
echo.
echo Starting the REAL admin dashboard with all features:
echo - Advanced User Management
echo - Content Moderation System  
echo - Marketing Automation Hub
echo - AI Insights Dashboard
echo - Revenue Analytics
echo - CMS Integration
echo - Rob AI Assistant
echo.

cd /d "c:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1\admin-dashboard"

echo Checking Node modules...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting admin dashboard on port 3001...
echo.
echo =====================================
echo   ADMIN LOGIN CREDENTIALS:
echo =====================================
echo   Email: admin@memorybox.app
echo   Password: admin123
echo =====================================
echo.
echo Access your admin dashboard at:
echo http://localhost:3001/admin
echo.

start http://localhost:3001/admin

npm run dev

pause
