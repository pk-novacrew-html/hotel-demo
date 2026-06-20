# Chạy demo local — PowerShell
$port = 8080
$root = $PSScriptRoot
Write-Host "Serenity Hotel Demo: http://localhost:$port/vi/index.html"
Write-Host "Nhan Ctrl+C de dung."
Set-Location $root
python -m http.server $port
