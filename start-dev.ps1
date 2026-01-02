# Development Server Startup Script
cd $PSScriptRoot
$env:NODE_ENV='development'
Write-Host "🚀 Starting development server..." -ForegroundColor Green
pnpm dev




