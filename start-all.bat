@echo off
title Saranam Ayyappa Stack Launcher
echo ========================================================
echo   Launching Saranam Ayyappa Full-Stack Devotional Platform
echo ========================================================
echo.
echo [1/3] Starting Backend NestJS API on http://localhost:4000/api/v1 ...
start "Saranam Ayyappa - Backend API (Port 4000)" cmd /k "cd /d \"%~dp0apps\api\" && pnpm run start:dev"

timeout /t 4 /nobreak >nul

echo [2/3] Starting Admin Panel on http://localhost:3002 ...
start "Saranam Ayyappa - Admin Panel (Port 3002)" cmd /k "cd /d \"%~dp0apps\admin-panel\" && pnpm run start"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Mobile App (Expo Metro) on http://localhost:8081 ...
start "Saranam Ayyappa - Mobile App (Expo)" cmd /k "cd /d \"%~dp0apps\mobile\" && pnpm run start"

echo.
echo All services launched!
echo - Admin Panel:  http://localhost:3002
echo - Backend API:  http://localhost:4000/api/v1
echo - Mobile Metro: http://localhost:8081
echo ========================================================
pause

