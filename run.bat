@echo off
color 0E
title Saranam Ayyappa - Development Launcher
echo ================================================================
echo       SARANAM AYYAPPA MULTILINGUAL PLATFORM LAUNCHER
echo ================================================================
echo.
echo Launching 3 application consoles on your desktop...
echo.

set "PNPM_CMD=C:\Users\THATIPALLY VINOD\AppData\Roaming\npm\pnpm.cmd"

echo [1/3] Starting Backend NestJS API (Port 4000)...
start "Saranam Ayyappa [API : 4000]" cmd /k "cd /d \"%~dp0apps\api\" && \"%PNPM_CMD%\" run start:dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Admin Panel (Port 3002)...
start "Saranam Ayyappa [ADMIN : 3002]" cmd /k "cd /d \"%~dp0apps\admin-panel\" && \"%PNPM_CMD%\" run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Mobile Expo Dev Server (Port 8081)...
start "Saranam Ayyappa [MOBILE : 8081]" cmd /k "cd /d \"%~dp0apps\mobile\" && \"%PNPM_CMD%\" run start"

echo.
echo ================================================================
echo  All 3 services are launching in separate windows!
echo  
echo  1. Admin Panel:   http://localhost:3002
echo  2. Backend API:   http://localhost:4000/api/v1
echo  3. Mobile App:    http://localhost:8081
echo ================================================================
echo.
pause

