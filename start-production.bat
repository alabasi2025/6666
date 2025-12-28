@echo off
title Production - Energy Management System
cd /d D:\6666

echo ========================================================
echo   Production Environment - Energy Management System
echo ========================================================
echo.

echo [1/3] Checking environment...
if not exist .env (
    echo ERROR: .env file not found!
    pause
    exit /b 1
)
echo OK: .env file exists
echo.

echo [2/3] Setting up database...
call pnpm run db:push
if errorlevel 1 (
    echo WARNING: Database setup failed
    echo Please check DATABASE_URL in .env file
    pause
)
echo.

echo [3/3] Starting server...
echo.
echo ========================================================
echo   Server running on: http://localhost:8000
echo   Environment: Production
echo   Path: D:\6666
echo ========================================================
echo.
echo Press Ctrl+C to stop the server
echo.

set NODE_ENV=production
node dist\index.js
