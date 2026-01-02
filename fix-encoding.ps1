# Fix encoding issues in database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixing Database Encoding" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"

# Test connection with UTF-8
Write-Host "[!] Testing connection with UTF-8..." -ForegroundColor Yellow
$test = & $mysqlPath -u root 666666 --default-character-set=utf8mb4 -e "SET NAMES utf8mb4; SELECT name FROM users LIMIT 1;" 2>&1

if ($test -match '\?') {
    Write-Host "[!] Data appears to be corrupted. Checking encoding..." -ForegroundColor Yellow
    
    # Check if we can fix by converting
    Write-Host "[!] Attempting to fix encoding for users table..." -ForegroundColor Yellow
    
    $fixSQL = @"
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- Update users table to ensure UTF-8
UPDATE users SET name = CONVERT(CAST(name AS BINARY) USING utf8mb4) WHERE name IS NOT NULL;
"@
    
    $fixSQL | & $mysqlPath -u root 666666 --default-character-set=utf8mb4
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Encoding fix applied" -ForegroundColor Green
    } else {
        Write-Host "[X] Could not fix encoding automatically" -ForegroundColor Red
        Write-Host "The backup file may have been saved with wrong encoding" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Encoding looks correct" -ForegroundColor Green
}

Write-Host ""
Write-Host "Note: If names still show as '?', the backup file was saved with wrong encoding." -ForegroundColor Yellow
Write-Host "You may need to re-import the backup with correct UTF-8 encoding." -ForegroundColor Yellow

