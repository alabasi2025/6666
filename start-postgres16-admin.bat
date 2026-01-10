@echo off
REM Batch script to start PostgreSQL 16 (requires Administrator)
echo ========================================
echo Starting PostgreSQL 16
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires Administrator privileges!
    echo.
    echo Please right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

echo Administrator privileges confirmed.
echo.

REM Remove stale PID file
if exist "C:\Program Files\PostgreSQL\16\data\postmaster.pid" (
    echo Removing stale PID file...
    del /F /Q "C:\Program Files\PostgreSQL\16\data\postmaster.pid"
    echo PID file removed.
    echo.
)

REM Start PostgreSQL 16 service
echo Starting PostgreSQL 16 service...
net start postgresql-x64-16

if %errorLevel% equ 0 (
    echo.
    echo SUCCESS: PostgreSQL 16 started successfully!
    echo.
    timeout /t 3 /nobreak >nul
    
    REM Check database
    echo Checking database...
    cd /d "%~dp0"
    call pnpm tsx check-postgres16-database.ts
) else (
    echo.
    echo ERROR: Failed to start PostgreSQL 16
    echo.
    echo Check Event Viewer for details:
    echo   Event Viewer ^> Windows Logs ^> Application ^> Source: PostgreSQL
    echo.
)

echo.
pause
