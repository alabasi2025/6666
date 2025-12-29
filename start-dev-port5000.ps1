# Development Server on Port 5000
cd $PSScriptRoot
$env:PORT='5000'
$env:NODE_ENV='development'
Write-Host "🚀 Starting development server on port 5000..." -ForegroundColor Green
pnpm dev




