# سكريبت تشغيل واختبار المحركات
# Engines Testing Startup Script

Write-Host "🚀 تشغيل النظام لاختبار المحركات..." -ForegroundColor Green
Write-Host ""

# الانتقال للمجلد
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# تعيين المتغيرات البيئية
$env:PORT = '8000'
$env:NODE_ENV = 'development'

# التحقق من وجود node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[!] جاري تثبيت التبعيات..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[✗] فشل تثبيت التبعيات!" -ForegroundColor Red
        Read-Host "اضغط Enter للخروج"
        exit 1
    }
    Write-Host "[✓] تم تثبيت التبعيات بنجاح" -ForegroundColor Green
}

# التأكد من وجود DEMO_MODE
$envContent = Get-Content .env -ErrorAction SilentlyContinue
if ($envContent -notmatch "DEMO_MODE=true") {
    Write-Host "[!] إضافة DEMO_MODE إلى ملف .env..." -ForegroundColor Yellow
    if (-not (Test-Path ".env")) {
        New-Item -Path ".env" -ItemType File | Out-Null
    }
    Add-Content -Path ".env" -Value "`nDEMO_MODE=true"
    Write-Host "[✓] تم إضافة DEMO_MODE" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🌐 جاري تشغيل السيرفر على المنفذ 8000..." -ForegroundColor Cyan
Write-Host "  📍 افتح المتصفح على: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  🔧 اضغط Ctrl+C لإيقاف السيرفر" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# تشغيل السيرفر
npm run dev

