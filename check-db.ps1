#!/usr/bin/env pwsh

<#
.SYNOPSIS
  فحص شامل لاتصال قاعدة البيانات
.DESCRIPTION
  يفحص حالة MySQL والاتصال والجداول
#>

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 فحص اتصال قاعدة البيانات" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ✅ الخطوة 1: فحص MySQL
Write-Host "1️⃣  فحص خادم MySQL:" -ForegroundColor Yellow

$mysqlRunning = Get-Service MySQL81 -ErrorAction SilentlyContinue

if ($mysqlRunning) {
    if ($mysqlRunning.Status -eq "Running") {
        Write-Host "   ✅ خادم MySQL قيد التشغيل" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  خادم MySQL متوقف" -ForegroundColor Yellow
        Write-Host "   🔄 جاري تشغيل MySQL..." -ForegroundColor Cyan
        Start-Service MySQL81 -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        Write-Host "   ✅ تم تشغيل MySQL" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ لم يتم العثور على خدمة MySQL" -ForegroundColor Red
    Write-Host "   💡 تأكد من تثبيت MySQL" -ForegroundColor Cyan
}

Write-Host ""

# ✅ الخطوة 2: فحص قاعدة البيانات
Write-Host "2️⃣  فحص قاعدة البيانات:" -ForegroundColor Yellow

$dbExists = mysql -u root -e "SHOW DATABASES LIKE 'energy_management';" 2>$null

if ($dbExists) {
    Write-Host "   ✅ قاعدة البيانات موجودة" -ForegroundColor Green
    
    # فحص الجداول
    Write-Host ""
    Write-Host "3️⃣  فحص الجداول:" -ForegroundColor Yellow
    $tableCount = mysql -u root energy_management -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='energy_management';" 2>$null
    
    if ($tableCount) {
        Write-Host "   ✅ الجداول موجودة" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  لم يتم العثور على جداول" -ForegroundColor Yellow
        Write-Host "   💡 قم بتشغيل: pnpm db:push" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ❌ قاعدة البيانات غير موجودة" -ForegroundColor Red
    Write-Host "   🔄 جاري إنشاء قاعدة البيانات..." -ForegroundColor Cyan
    
    mysql -u root -e "CREATE DATABASE energy_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
    
    if ($?) {
        Write-Host "   ✅ تم إنشاء قاعدة البيانات" -ForegroundColor Green
    } else {
        Write-Host "   ❌ فشل إنشاء قاعدة البيانات" -ForegroundColor Red
    }
}

Write-Host ""

# ✅ الخطوة 3: فحص ملف .env
Write-Host "4️⃣  فحص متغيرات البيئة:" -ForegroundColor Yellow

if (Test-Path ".env" -PathType Leaf) {
    Write-Host "   ✅ ملف .env موجود" -ForegroundColor Green
    
    $envContent = Get-Content .env
    if ($envContent -like "*DATABASE_URL*") {
        Write-Host "   ✅ DATABASE_URL محدد" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  DATABASE_URL غير محدد" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  ملف .env غير موجود" -ForegroundColor Yellow
    Write-Host "   💡 أنشئ .env بـ DATABASE_URL" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ انتهى الفحص" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

