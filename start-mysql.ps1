# Script to start MySQL
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting MySQL" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# Check XAMPP
$xamppControl = "C:\xampp\xampp-control.exe"
if (Test-Path $xamppControl) {
    Write-Host "`n[1] Found XAMPP" -ForegroundColor Green
    Write-Host "   Path: $xamppControl" -ForegroundColor Gray
    Write-Host "   Tip: Open XAMPP Control Panel and start MySQL" -ForegroundColor Cyan
    
    $openXampp = Read-Host "`n   Open XAMPP Control Panel now? (y/n)"
    if ($openXampp -eq "y" -or $openXampp -eq "Y") {
        Start-Process $xamppControl
        Write-Host "   Opened XAMPP Control Panel" -ForegroundColor Green
    }
} else {
    Write-Host "`n[1] XAMPP not found in default path" -ForegroundColor Yellow
}

# Check MySQL services
Write-Host "`n[2] Checking MySQL services..." -ForegroundColor Yellow
$mysqlService = Get-Service | Where-Object {$_.Name -like "*mysql*"}
if ($mysqlService) {
    foreach ($service in $mysqlService) {
        Write-Host "   Service: $($service.DisplayName) ($($service.Name))" -ForegroundColor Gray
        if ($service.Status -eq "Running") {
            Write-Host "   Status: Running" -ForegroundColor Green
        } else {
            Write-Host "   Status: Stopped" -ForegroundColor Yellow
            $startService = Read-Host "   Start this service? (y/n)"
            if ($startService -eq "y" -or $startService -eq "Y") {
                try {
                    Start-Service -Name $service.Name
                    Write-Host "   Service started successfully" -ForegroundColor Green
                } catch {
                    Write-Host "   Failed to start service: $_" -ForegroundColor Red
                    Write-Host "   Tip: You may need administrator privileges" -ForegroundColor Yellow
                }
            }
        }
    }
} else {
    Write-Host "   No MySQL services found" -ForegroundColor Yellow
}

# Check port
Write-Host "`n[3] Checking port 3306..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "   Port 3306 is open - MySQL is running!" -ForegroundColor Green
} else {
    Write-Host "   Port 3306 is closed - MySQL is not running" -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "After starting MySQL, run:" -ForegroundColor Yellow
Write-Host "   pnpm exec tsx setup-database.ts" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
