# Simple script to start PostgreSQL 16
$serviceName = "postgresql-x64-16"

Write-Host "Checking PostgreSQL 16 service..." -ForegroundColor Yellow
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "Service $serviceName not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Current status: $($service.Status)" -ForegroundColor Cyan

if ($service.Status -eq "Running") {
    Write-Host "PostgreSQL 16 is already running!" -ForegroundColor Green
    exit 0
}

# Delete stale PID file if exists
$pidFile = "C:\Program Files\PostgreSQL\16\data\postmaster.pid"
if (Test-Path $pidFile) {
    Write-Host "Removing stale PID file..." -ForegroundColor Yellow
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# Try to start the service
Write-Host "Starting PostgreSQL 16..." -ForegroundColor Yellow
try {
    Start-Service -Name $serviceName -ErrorAction Stop
    Write-Host "Service start command sent. Waiting..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
    
    $service.Refresh()
    if ($service.Status -eq "Running") {
        Write-Host "SUCCESS: PostgreSQL 16 is now running!" -ForegroundColor Green
        Write-Host "Status: $($service.Status)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Service did not start. Status: $($service.Status)" -ForegroundColor Red
        
        # Check recent event log errors
        Write-Host "`nChecking recent errors..." -ForegroundColor Yellow
        $errors = Get-EventLog -LogName Application -Source "PostgreSQL" -Newest 5 -ErrorAction SilentlyContinue | Where-Object {$_.EntryType -eq "Error"}
        if ($errors) {
            $errors | ForEach-Object {
                Write-Host "Error: $($_.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host "`nYou may need to:" -ForegroundColor Yellow
        Write-Host "1. Run PowerShell as Administrator" -ForegroundColor Cyan
        Write-Host "2. Check PostgreSQL logs in: C:\Program Files\PostgreSQL\16\data\log" -ForegroundColor Cyan
        Write-Host "3. Verify PostgreSQL 16 installation" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to start service" -ForegroundColor Red
    Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Exception Type: $($_.Exception.GetType().FullName)" -ForegroundColor Red
    
    Write-Host "`nTry running this script as Administrator!" -ForegroundColor Yellow
    exit 1
}
