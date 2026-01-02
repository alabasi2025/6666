# Download backup from GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Downloading Backup from GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create db folder if it doesn't exist
if (-not (Test-Path "db")) {
    New-Item -ItemType Directory -Path "db" | Out-Null
    Write-Host "[OK] Created db folder" -ForegroundColor Green
}

$backupFile = "db\backup-utf8.zip"
$url = "https://github.com/alabasi2025/6666/raw/main/db/backup-utf8.zip"

Write-Host "[!] Downloading file from GitHub..." -ForegroundColor Yellow
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    # Try to download
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $url -OutFile $backupFile -UseBasicParsing -ErrorAction Stop
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "[OK] File downloaded successfully!" -ForegroundColor Green
        Write-Host "[Info] File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host "[Info] Location: $((Resolve-Path $backupFile).Path)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next step: Import the backup" -ForegroundColor Yellow
        Write-Host "Run: .\import-backup.ps1 -BackupFile `"$backupFile`"" -ForegroundColor White
    } else {
        Write-Host "[X] Download failed - File not found" -ForegroundColor Red
    }
} catch {
    Write-Host "[X] Download failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Manual Download Required" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please download the file manually from:" -ForegroundColor Yellow
    Write-Host "https://github.com/alabasi2025/6666/blob/main/db/backup-utf8.zip" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then save it to:" -ForegroundColor Yellow
    Write-Host "$((Resolve-Path .).Path)\db\backup-utf8.zip" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After download, run:" -ForegroundColor Yellow
    Write-Host ".\import-backup.ps1 -BackupFile db\backup-utf8.zip" -ForegroundColor White
}
