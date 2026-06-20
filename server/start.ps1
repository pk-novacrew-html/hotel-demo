$ErrorActionPreference='SilentlyContinue'
$port = 3001

$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($existing) {
  $pid = ($existing | Select-Object -First 1).OwningProcess
  Write-Host "Port $port is in use by PID $pid. Stopping it..."
  Stop-Process -Id $pid -Force
  Start-Sleep -Seconds 1
}

Push-Location "$PSScriptRoot"
cmd /c npx tsx src/index.ts
Pop-Location