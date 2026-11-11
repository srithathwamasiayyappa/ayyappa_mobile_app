@echo off
color 0E
title Saranam Ayyappa - APK Builder
echo ================================================================
echo       SARANAM AYYAPPA MOBILE BUILD LAUNCHER (EAS BUILD)
echo ================================================================
echo.
echo Select the build you want to create:
echo.
echo  [1] Build Android APK (Direct installable .apk file)
echo  [2] Build iOS (Simulator build - no Apple Developer Account needed)
echo  [3] Build iOS (Device build - requires Apple Developer Account)
echo  [4] Build Both (Android APK + iOS)
echo.
set /p choice="Enter choice (1, 2, 3, or 4): "

cd /d "%~dp0apps\mobile"

if "%choice%"=="1" (
    echo.
    echo Starting Android APK build...
    npx eas-cli build --platform android --profile preview
)

if "%choice%"=="2" (
    echo.
    echo Starting iOS Simulator build...
    npx eas-cli build --platform ios --profile preview
)

if "%choice%"=="3" (
    echo.
    echo Starting iOS Device build...
    npx eas-cli build --platform ios --profile preview-device
)

if "%choice%"=="4" (
    echo.
    echo Starting All platforms build...
    npx eas-cli build --platform all --profile preview
)

echo.
pause

