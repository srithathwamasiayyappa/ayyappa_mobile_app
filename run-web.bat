@echo off
color 0B
title Saranam Ayyappa - Web App Launcher
echo ================================================================
echo       SARANAM AYYAPPA WEB APPLICATION (PORT 8081)
echo ================================================================
echo.
echo Starting Web version in your default browser...
echo.

set "PNPM_CMD=C:\Users\THATIPALLY VINOD\AppData\Roaming\npm\pnpm.cmd"
cd /d "%~dp0apps\mobile"
"%PNPM_CMD%" run web

pause

