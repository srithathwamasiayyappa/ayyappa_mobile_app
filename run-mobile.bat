@echo off
color 0A
title Saranam Ayyappa - Android Mobile Launcher
echo ================================================================
echo       SARANAM AYYAPPA ANDROID MOBILE APP LAUNCHER
echo ================================================================
echo.

:: Add Android SDK platform-tools to PATH so adb works
set "PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools;%PATH%"

:: Forward port 8081 over USB so connected phone connects reliably
adb reverse tcp:8081 tcp:8081 >nul 2>&1

cd /d "%~dp0apps\mobile"

echo Starting Expo Metro Bundler...
echo - To open in Expo Go: Scan the QR code shown below with Expo Go on your phone.
echo - To open over USB: Unlock your phone screen, allow USB debugging, then press 'a'.
echo.

if exist "node_modules\.bin\expo.cmd" (
  call "node_modules\.bin\expo.cmd" start --go -c
) else (
  call npx.cmd expo start --go -c
)

pause
