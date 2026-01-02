@echo off
echo ========================================
echo   تشغيل النظام في وضع DEMO_MODE
echo   (بدون قاعدة بيانات)
echo ========================================
echo.

REM التحقق من تثبيت Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [خطأ] Node.js غير مثبت!
    echo.
    echo يرجى تثبيت Node.js من: https://nodejs.org/
    echo ثم أعد تشغيل هذا الملف.
    pause
    exit /b 1
)

REM التحقق من تثبيت pnpm
where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [تنبيه] pnpm غير مثبت. جاري التثبيت...
    call npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo [خطأ] فشل تثبيت pnpm!
        pause
        exit /b 1
    )
)

REM التحقق من تثبيت الاعتماديات
if not exist "node_modules" (
    echo [معلومات] جاري تثبيت الاعتماديات... قد يستغرق هذا بضع دقائق
    call pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo [خطأ] فشل تثبيت الاعتماديات!
        pause
        exit /b 1
    )
)

REM التأكد من وجود DEMO_MODE في ملف .env
findstr /C:"DEMO_MODE=true" .env >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [معلومات] إضافة DEMO_MODE إلى ملف .env...
    echo. >> .env
    echo DEMO_MODE=true >> .env
)

echo.
echo [معلومات] جاري تشغيل الخادم...
echo [معلومات] افتح المتصفح على: http://localhost:5000
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

REM تشغيل الخادم
call pnpm dev

pause

