@echo off
title Saranam Ayyappa - Backend and Admin Launcher
echo ================================================================
echo       SARANAM AYYAPPA: BACKEND AND ADMIN PANEL LAUNCHER
echo ================================================================
echo.

set "PNPM_CMD=C:\Users\THATIPALLY VINOD\AppData\Roaming\npm\pnpm.cmd"

echo [1/2] Starting Backend NestJS API (Port 4000)...
start "Saranam Ayyappa [API : 4000]" cmd /k "cd /d \"%~dp0apps\api\" && \"%PNPM_CMD%\" run start:dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Admin Panel (Port 3002)...
start "Saranam Ayyappa [ADMIN : 3002]" cmd /k "cd /d \"%~dp0apps\admin-panel\" && \"%PNPM_CMD%\" run dev"

echo.
echo ================================================================
echo  Both services launched in separate windows!
echo  
echo  1. Backend API:  http://localhost:4000/api/v1
echo  2. Admin Panel:  http://localhost:3002
echo ================================================================
echo.
