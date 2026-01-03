# استيراد النسخة الاحتياطية لقاعدة البيانات 666666

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  استيراد النسخة الاحتياطية" -ForegroundColor Cyan
Write-Host "  قاعدة البيانات: 666666" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود الملف
if (-not (Test-Path $BackupFile)) {
    Write-Host "[✗] الملف غير موجود: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "[✓] تم العثور على الملف: $BackupFile" -ForegroundColor Green
Write-Host ""

# التحقق من MySQL
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    Write-Host "[✗] MySQL غير موجود في: $mysqlPath" -ForegroundColor Red
    Write-Host "يرجى التأكد من تثبيت XAMPP" -ForegroundColor Yellow
    exit 1
}

Write-Host "[✓] MySQL موجود" -ForegroundColor Green
Write-Host ""

# التحقق من قاعدة البيانات
Write-Host "[!] التحقق من قاعدة البيانات 666666..." -ForegroundColor Yellow
$dbCheck = & $mysqlPath -u root -e "SHOW DATABASES LIKE '666666';" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] فشل التحقق من قاعدة البيانات" -ForegroundColor Red
    Write-Host $dbCheck
    exit 1
}

Write-Host "[✓] قاعدة البيانات 666666 موجودة" -ForegroundColor Green
Write-Host ""

# عرض حجم الملف
$fileSize = (Get-Item $BackupFile).Length / 1MB
Write-Host "[معلومات] حجم الملف: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# تأكيد الاستيراد
Write-Host "هل تريد المتابعة مع الاستيراد؟" -ForegroundColor Yellow
$confirm = Read-Host "اكتب 'yes' للمتابعة"

if ($confirm -ne "yes") {
    Write-Host "[!] تم إلغاء العملية" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[!] جاري استيراد النسخة الاحتياطية..." -ForegroundColor Yellow
Write-Host "قد يستغرق هذا بعض الوقت حسب حجم الملف..." -ForegroundColor Yellow
Write-Host ""

# استيراد النسخة الاحتياطية
$startTime = Get-Date
Get-Content $BackupFile | & $mysqlPath -u root 666666

if ($LASTEXITCODE -eq 0) {
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "[✓] تم استيراد النسخة الاحتياطية بنجاح!" -ForegroundColor Green
    Write-Host "[معلومات] الوقت المستغرق: $([math]::Round($duration, 2)) ثانية" -ForegroundColor Cyan
    Write-Host ""
    
    # عرض عدد الجداول
    Write-Host "[!] جاري التحقق من الجداول المستوردة..." -ForegroundColor Yellow
    $tables = & $mysqlPath -u root 666666 -e "SHOW TABLES;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $tableCount = ($tables | Measure-Object -Line).Lines - 1
        Write-Host "[✓] عدد الجداول: $tableCount" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  تم الانتهاء بنجاح!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "الخطوات التالية:" -ForegroundColor Yellow
    Write-Host "1. تأكد من تحديث ملف .env:" -ForegroundColor White
    Write-Host "   DATABASE_URL=mysql://root@localhost:3306/666666" -ForegroundColor Gray
    Write-Host "2. شغّل: pnpm db:push (إذا لزم الأمر)" -ForegroundColor White
    Write-Host "3. أعد تشغيل الخادم: pnpm dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[✗] فشل استيراد النسخة الاحتياطية!" -ForegroundColor Red
    Write-Host "يرجى مراجعة الأخطاء أعلاه" -ForegroundColor Yellow
    exit 1
}

