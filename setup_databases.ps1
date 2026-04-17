# MediConnect Database Setup Script
# Use this script to create all required databases in your local PostgreSQL instance.

$DB_USER = "postgres"
$DB_PASS = "12345"
$databases = @("user_db", "doctor_db", "appointment_db", "notification_db", "payment_db", "telemedicine_db", "symptom_checker_db")

Write-Host "--- Creating MediConnect Databases ---" -ForegroundColor Cyan

# Set password for psql
$env:PGPASSWORD = $DB_PASS

foreach ($db in $databases) {
    Write-Host "Checking database: $db..."
    # Check if database exists
    $query = "SELECT 1 FROM pg_database WHERE datname = '$db'"
    $exists = psql -U $DB_USER -tAc "$query" 2>$null
    
    if ($exists -eq "1") {
        Write-Host "Database '$db' already exists." -ForegroundColor Gray
    } else {
        Write-Host "Creating database '$db'..." -ForegroundColor Yellow
        psql -U $DB_USER -c "CREATE DATABASE $db"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully created '$db'." -ForegroundColor Green
        } else {
            Write-Host "Failed to create '$db'. Please ensure PostgreSQL is running and credentials are correct." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "`nAll databases are ready!" -ForegroundColor Green
