# MediConnect Stop and Start Script
$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)

Write-Host "--- Stopping existing services ---" -ForegroundColor Yellow
foreach ($port in $ports) {
    try {
        $procId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1
        if ($procId) {
            Write-Host "Killing process $procId on port $port"
            Stop-Process -Id $procId -Force
        }
    } catch {
        Write-Host "No process found on port $port"
    }
}

# Add a small delay for port cleanup
Start-Sleep -Seconds 2

Write-Host "`n--- Starting all services ---" -ForegroundColor Cyan
$services = @(
    @{ name = "User Service"; dir = "user-service" },
    @{ name = "Doctor Service"; dir = "doctor-service" },
    @{ name = "Appointment Service"; dir = "appointment-service" },
    @{ name = "Notification Service"; dir = "notification-service" },
    @{ name = "Payment Service"; dir = "payment-service" },
    @{ name = "Telemedicine Service"; dir = "telemedicine-service" },
    @{ name = "Symptom Checker"; dir = "symptom-checker-service" },
    @{ name = "API Gateway"; dir = "api-gateway" }
)

foreach ($s in $services) {
    Write-Host "Launching $($s.name)..."
    # Start in background without a visible window to avoid cluttering but keep them alive
    Start-Process powershell -ArgumentList "-Command", "cd $($s.dir); mvn spring-boot:run" -WindowStyle Hidden
}

Write-Host "`nAll services have been triggered to restart in the background." -ForegroundColor Green
Write-Host "Please wait 30-60 seconds for all ports to become active." -ForegroundColor Yellow
