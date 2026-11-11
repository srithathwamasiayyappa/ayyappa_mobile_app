@echo off
color 0A
title Saranam Ayyappa - Android Mobile Launcher
echo ================================================================
echo       SARANAM AYYAPPA ANDROID MOBILE APP LAUNCHER
echo ================================================================
echo.

:: Add Android SDK platform-tools to PATH so adb works
set "PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools;%PATH%"

set "PNPM_CMD=C:\Users\THATIPALLY VINOD\AppData\Roaming\npm\pnpm.cmd"
cd /d "%~dp0apps\mobile"

echo Starting Expo Metro Bundler...
echo - To open in Expo Go: Scan the QR code shown below with Expo Go on your phone.
echo - To open over USB: Unlock your phone screen, allow USB debugging, then press 'a'.
echo.

npx expo start -c

pause
