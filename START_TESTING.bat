@echo off
chcp 65001 >nul
echo ========================================
echo   نظام إدارة الطاقة - Energy Management System
echo   اختبار حسابات المشترك - Subscription Accounts Testing
echo ========================================
echo.

REM التحقق من وجود Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js غير مثبت. يرجى تثبيت Node.js أولاً.
    pause
    exit /b 1
)

REM التحقق من وجود npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm غير مثبت. يرجى تثبيت npm أولاً.
    pause
    exit /b 1
)

echo [INFO] جاري التحقق من التبعيات...
cd /d "%~dp0"
if not exist "node_modules" (
    echo [INFO] جاري تثبيت التبعيات...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] فشل تثبيت التبعيات.
        pause
        exit /b 1
    )
)

echo.
echo [INFO] جاري تشغيل الخادم...
echo [INFO] الرابط: http://localhost:8000
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

REM فتح المتصفح تلقائياً بعد 5 ثوانٍ
timeout /t 5 /nobreak >nul
start http://localhost:8000

REM تشغيل الخادم
call npm run dev

pause
