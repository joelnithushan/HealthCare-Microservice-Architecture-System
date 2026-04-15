# MediConnect Full System Start Script
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
    Write-Host "No .env file found." -ForegroundColor Yellow
}

Write-Host "--- Stopping existing services ---" -ForegroundColor Yellow
foreach ($port in $ports) {
    try {
        $procId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1
        if ($procId) {
            Write-Host "Killing process $procId on port $port"
            Stop-Process -Id $procId -Force
        }
    } catch {
        # Port is clean
    }
}

# Add a small delay for port cleanup
Start-Sleep -Seconds 2

Write-Host "`n--- Starting Backend Services ---" -ForegroundColor Cyan
$backendServices = @(
    @{ name = "User Service"; dir = "user-service" },
    @{ name = "Doctor Service"; dir = "doctor-service" },
    @{ name = "Appointment Service"; dir = "appointment-service" },
    @{ name = "Notification Service"; dir = "notification-service" },
    @{ name = "Payment Service"; dir = "payment-service" },
    @{ name = "Telemedicine Service"; dir = "telemedicine-service" },
    @{ name = "Symptom Checker"; dir = "symptom-checker-service" },
    @{ name = "API Gateway"; dir = "api-gateway" }
)

foreach ($s in $backendServices) {
    Write-Host "Launching $($s.name)..."
    # Start in background without a visible window
    Start-Process powershell -ArgumentList "-Command", "cd $($s.dir); mvn spring-boot:run" -WindowStyle Hidden
}

Write-Host "`n--- Starting Frontend ---" -ForegroundColor Green
Write-Host "Launching Healthcare Frontend..."
Start-Process powershell -ArgumentList "-Command", "cd healthcare-frontend; npm start" -WindowStyle Hidden

Write-Host "`nAll services have been triggered to start in the background." -ForegroundColor Green
Write-Host "IMPORTANT: Please ensure your PostgreSQL database is running on port 5432." -ForegroundColor Yellow
Write-Host "Please wait 30-60 seconds for all services to become active." -ForegroundColor Cyan
Write-Host "API Gateway will be available at: http://localhost:8080" -ForegroundColor Gray
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Gray
