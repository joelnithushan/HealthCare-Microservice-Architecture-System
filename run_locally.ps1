# MediConnect Local Execution Orchestrator
# This script starts all microservices and the frontend in separate terminal windows.

$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 3000)

Write-Host "--- Loading Environment Variables ---" -ForegroundColor Cyan
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host ".env loaded successfully." -ForegroundColor Green
} else {
    Write-Host "WARNING: No .env file found. This might cause authentication/mail failures." -ForegroundColor Yellow
}

Write-Host "`n--- Cleaning Up Existing Processes ---" -ForegroundColor Yellow
foreach ($port in $ports) {
    try {
        $procId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1
        if ($procId) {
            Write-Host "Stopping process $procId on port $port"
            Stop-Process -Id $procId -Force
        }
    } catch { }
}

Start-Sleep -Seconds 1

Write-Host "`n--- Starting Backend Services ---" -ForegroundColor Cyan
$backendServices = @(
    @{ name = "API Gateway"; dir = "api-gateway"; port = 8080 },
    @{ name = "User Service"; dir = "user-service"; port = 8081 },
    @{ name = "Doctor Service"; dir = "doctor-service"; port = 8082 },
    @{ name = "Appointment Service"; dir = "appointment-service"; port = 8083 },
    @{ name = "Notification Service"; dir = "notification-service"; port = 8084 },
    @{ name = "Payment Service"; dir = "payment-service"; port = 8085 },
    @{ name = "Telemedicine Service"; dir = "telemedicine-service"; port = 8086 },
    @{ name = "Symptom Checker"; dir = "symptom-checker-service"; port = 8087 }
)

foreach ($s in $backendServices) {
    Write-Host "Launching $($s.name) in a separate window..."
    # Launch in a new PowerShell window so logs are visible
    # Using 'Wait' or 'NoExit' to keep the window open for logs
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $($s.dir); `$Host.UI.RawUI.WindowTitle = '$($s.name)'; mvn spring-boot:run"
}

Write-Host "`n--- Starting Frontend Service ---" -ForegroundColor Green
Write-Host "Launching Healthcare Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd healthcare-frontend; `$Host.UI.RawUI.WindowTitle = 'Healthcare Frontend'; npm start"

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "All services have been launched in separate windows." -ForegroundColor Green
Write-Host "API Gateway: http://localhost:8080" -ForegroundColor Gray
Write-Host "Frontend   : http://localhost:3000" -ForegroundColor Gray
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Please check the individual windows for any startup errors." -ForegroundColor Yellow
