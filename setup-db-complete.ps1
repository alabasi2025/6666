# Complete database setup script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Complete Database Setup" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# Step 1: Check MySQL
Write-Host "`n[Step 1] Checking MySQL..." -ForegroundColor Yellow
$mysqlRunning = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $mysqlRunning) {
    Write-Host "   MySQL is not running" -ForegroundColor Red
    Write-Host "   Opening XAMPP Control Panel..." -ForegroundColor Yellow
    Start-Process "C:\xampp\xampp-control.exe"
    Write-Host "   Please start MySQL from XAMPP Control Panel" -ForegroundColor Cyan
    Write-Host "   Waiting 30 seconds for MySQL to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    $mysqlRunning = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue
    if (-not $mysqlRunning) {
        Write-Host "   MySQL is still not running. Please start it manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "   MySQL is running!" -ForegroundColor Green

# Step 2: Setup database
Write-Host "`n[Step 2] Setting up database..." -ForegroundColor Yellow
pnpm exec tsx setup-database.ts

# Step 3: Run migrations
Write-Host "`n[Step 3] Running migrations..." -ForegroundColor Yellow
pnpm db:push

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

