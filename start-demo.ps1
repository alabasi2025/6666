# تشغيل النظام في وضع DEMO_MODE (بدون قاعدة بيانات)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  تشغيل النظام في وضع DEMO_MODE" -ForegroundColor Cyan
Write-Host "  (بدون قاعدة بيانات)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من تثبيت Node.js
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js مثبت: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js غير مثبت!" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى تثبيت Node.js من: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "ثم أعد تشغيل هذا الملف." -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

# التحقق من تثبيت pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "[✓] pnpm مثبت: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "[!] pnpm غير مثبت. جاري التثبيت..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[✗] فشل تثبيت pnpm!" -ForegroundColor Red
        Read-Host "اضغط Enter للخروج"
        exit 1
    }
    Write-Host "[✓] تم تثبيت pnpm بنجاح" -ForegroundColor Green
}

# التحقق من تثبيت الاعتماديات
if (-not (Test-Path "node_modules")) {
    Write-Host "[!] جاري تثبيت الاعتماديات... قد يستغرق هذا بضع دقائق" -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[✗] فشل تثبيت الاعتماديات!" -ForegroundColor Red
        Read-Host "اضغط Enter للخروج"
        exit 1
    }
    Write-Host "[✓] تم تثبيت الاعتماديات بنجاح" -ForegroundColor Green
}

# التأكد من وجود DEMO_MODE في ملف .env
$envContent = Get-Content .env -ErrorAction SilentlyContinue
if ($envContent -notmatch "DEMO_MODE=true") {
    Write-Host "[!] إضافة DEMO_MODE إلى ملف .env..." -ForegroundColor Yellow
    Add-Content -Path ".env" -Value "`nDEMO_MODE=true"
    Write-Host "[✓] تم إضافة DEMO_MODE" -ForegroundColor Green
}

Write-Host ""
Write-Host "[معلومات] جاري تشغيل الخادم..." -ForegroundColor Cyan
Write-Host "[معلومات] افتح المتصفح على: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Yellow
Write-Host ""

# تشغيل الخادم
pnpm dev

