@echo off
color 0A
title Saranam Ayyappa - Android Mobile Launcher
echo ================================================================
echo       SARANAM AYYAPPA ANDROID MOBILE APP LAUNCHER
echo ================================================================
echo.
echo Starting Expo Metro Bundler for Android Phone / Emulator...
echo (Scan the QR code in Expo Go or run on connected device)
echo.

set "PNPM_CMD=C:\Users\THATIPALLY VINOD\AppData\Roaming\npm\pnpm.cmd"
cd /d "%~dp0apps\mobile"
"%PNPM_CMD%" run android

pause

