@echo off
echo ===============================================
echo     Memory Box Admin Dashboard Startup
echo ===============================================
echo.
echo Starting admin dashboard on port 3001...
echo.

cd /d "c:\Users\eduar\OneDrive\Desktop\Belapp\Belapp-1\admin-dashboard"

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting development server...
echo Dashboard will be available at: http://localhost:3001
echo.
echo Login Credentials:
echo Email: admin@memorybox.app
echo Password: admin123
echo.

npm run dev

pause
