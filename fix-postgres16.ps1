# Script to fix and start PostgreSQL 16
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔧 إصلاح وتشغيل PostgreSQL 16" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$dataDir = "C:\Program Files\PostgreSQL\16\data"
$pidFile = Join-Path $dataDir "postmaster.pid"

# Step 1: Check for existing postmaster.pid file
Write-Host "`n1️⃣  فحص ملف postmaster.pid..." -ForegroundColor Yellow
if (Test-Path $pidFile) {
    Write-Host "   ⚠️  ملف postmaster.pid موجود" -ForegroundColor Yellow
    
    # Read PID from file
    $pidContent = Get-Content $pidFile -TotalCount 1 -ErrorAction SilentlyContinue
    if ($pidContent) {
        $oldPid = [int]$pidContent
        Write-Host "   📋 PID المسجل: $oldPid" -ForegroundColor Cyan
        
        # Check if process is running
        $process = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   ⚠️  العملية $oldPid ما زالت تعمل: $($process.ProcessName)" -ForegroundColor Yellow
            Write-Host "   🔄 إنهاء العملية..." -ForegroundColor Cyan
            Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        } else {
            Write-Host "   ✅ العملية $oldPid غير موجودة (Stale PID file)" -ForegroundColor Green
        }
    }
    
    # Remove PID file
    Write-Host "   🗑️  حذف ملف postmaster.pid..." -ForegroundColor Cyan
    try {
        Remove-Item $pidFile -Force
        if (-not (Test-Path $pidFile)) {
            Write-Host "   ✅ تم حذف الملف بنجاح" -ForegroundColor Green
        } else {
            Write-Host "   ❌ فشل حذف الملف - قد تحتاج صلاحيات إدارية" -ForegroundColor Red
            Write-Host "   💡 حاول تشغيل PowerShell كمدير (Administrator)" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "   ❌ خطأ في حذف الملف: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✅ ملف postmaster.pid غير موجود" -ForegroundColor Green
}

# Step 2: Check for any running postgres processes
Write-Host "`n2️⃣  فحص عمليات PostgreSQL 16..." -ForegroundColor Yellow
$postgres16Processes = Get-Process | Where-Object {
    $_.ProcessName -like "*postgres*" -and 
    $_.Path -like "*PostgreSQL\16*"
} | Select-Object Id, ProcessName, Path

if ($postgres16Processes) {
    Write-Host "   ⚠️  تم العثور على عمليات PostgreSQL 16:" -ForegroundColor Yellow
    $postgres16Processes | Format-Table -AutoSize
    Write-Host "   🔄 إنهاء العمليات..." -ForegroundColor Cyan
    $postgres16Processes | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ تم إنهاء العمليات" -ForegroundColor Green
} else {
    Write-Host "   ✅ لا توجد عمليات PostgreSQL 16 قيد التشغيل" -ForegroundColor Green
}

# Step 3: Check service status
Write-Host "`n3️⃣  فحص حالة الخدمة..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "   📋 الحالة الحالية: $($service.Status)" -ForegroundColor Cyan
    
    if ($service.Status -eq "Running") {
        Write-Host "   ✅ PostgreSQL 16 يعمل بالفعل" -ForegroundColor Green
        exit 0
    }
    
    # Step 4: Start the service
    Write-Host "`n4️⃣  تشغيل PostgreSQL 16..." -ForegroundColor Yellow
    try {
        Start-Service -Name "postgresql-x64-16" -ErrorAction Stop
        Start-Sleep -Seconds 5
        $service.Refresh()
        
        if ($service.Status -eq "Running") {
            Write-Host "   ✅ تم تشغيل PostgreSQL 16 بنجاح!" -ForegroundColor Green
            Write-Host "   📊 الحالة: $($service.Status)" -ForegroundColor Cyan
            Write-Host "`n✅ اكتمل الإصلاح بنجاح!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ فشل تشغيل PostgreSQL 16" -ForegroundColor Red
            Write-Host "   📋 الحالة: $($service.Status)" -ForegroundColor Yellow
            Write-Host "`n💡 تحقق من:" -ForegroundColor Yellow
            Write-Host "   - سجلات الأخطاء في Event Viewer" -ForegroundColor Cyan
            Write-Host "   - ملف postgresql.conf" -ForegroundColor Cyan
            Write-Host "   - ملف pg_hba.conf" -ForegroundColor Cyan
            exit 1
        }
    } catch {
        Write-Host "   ❌ خطأ في تشغيل الخدمة: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 جرب:" -ForegroundColor Yellow
        Write-Host "   1. تشغيل PowerShell كمدير (Administrator)" -ForegroundColor Cyan
        Write-Host "   2. فحص ملفات السجلات في: C:\Program Files\PostgreSQL\16\data\log" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "   ❌ خدمة postgresql-x64-16 غير موجودة" -ForegroundColor Red
    Write-Host "   💡 تأكد من تثبيت PostgreSQL 16 بشكل صحيح" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✅ اكتمل!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
