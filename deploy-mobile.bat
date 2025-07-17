@echo off
echo.
echo ========================================
echo    Belapp Mobile Deployment Script
echo ========================================
echo.

echo Checking EAS CLI installation...
call eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g @expo/eas-cli
    echo EAS CLI installed successfully!
) else (
    echo EAS CLI found!
)

echo.
echo Checking Expo login status...
for /f "tokens=*" %%i in ('eas whoami') do set LOGIN_STATUS=%%i
if "%LOGIN_STATUS%"=="Not logged in" (
    echo Not logged in to Expo. Please login:
    call eas login
) else (
    echo Logged in as: %LOGIN_STATUS%
)

echo.
echo Mobile Deployment Options:
echo 1. Development build (testing)
echo 2. Preview build (internal testing)  
echo 3. Production build (app stores)
echo 4. iOS only (production)
echo 5. Android only (production)
echo 6. Submit to app stores
echo 7. Complete deployment (build + submit)
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo Building development version...
    call eas build --profile development
) else if "%choice%"=="2" (
    echo Building preview version...
    call eas build --profile preview
) else if "%choice%"=="3" (
    echo Building production version for both platforms...
    call eas build --profile production
) else if "%choice%"=="4" (
    echo Building iOS production version...
    call eas build --platform ios --profile production
) else if "%choice%"=="5" (
    echo Building Android production version...
    call eas build --platform android --profile production
) else if "%choice%"=="6" (
    echo Submitting to app stores...
    call eas submit --platform all
) else if "%choice%"=="7" (
    echo Complete deployment: Building and submitting...
    call eas build --platform all --profile production
    if %errorlevel% equ 0 (
        echo Build successful! Submitting to app stores...
        call eas submit --platform all
    ) else (
        echo Build failed! Check the errors above.
    )
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Commands Reference:
echo eas build:list          - Check build status
echo eas submit:list         - Check submission status  
echo eas secret:list         - View environment variables
echo eas build:cancel        - Cancel running build
echo ========================================
echo.
echo Deployment script completed!
echo Monitor your builds at: https://expo.dev
echo.
pause
