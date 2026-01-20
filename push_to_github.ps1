$ErrorActionPreference = "Stop"
$CurrentDir = Get-Location
$GitCmd = "$CurrentDir\.bin\git\cmd\git.exe"

if (-not (Test-Path $GitCmd)) {
    Write-Host "Error: Portable Git not found." -ForegroundColor Red
    exit 1
}

Write-Host "☁️ Pushing to GitHub: https://github.com/dinhsang031/cbs-recruitment-web.git" -ForegroundColor Yellow
Write-Host "NOTE: Một cửa sổ trình duyệt hoặc popup đăng nhập sẽ hiện ra. Hãy đăng nhập GitHub của bạn." -ForegroundColor Cyan

& $GitCmd branch -M main
& $GitCmd push -u origin main

Write-Host "✅ XONG! Code đã lên GitHub." -ForegroundColor Green
Write-Host "Giờ hãy qua Vercel để Import dự án nhé." -ForegroundColor Yellow
