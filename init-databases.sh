#!/bin/bash
set -e

# Database-per-Service: Create separate databases for each microservice
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE user_db;
    CREATE DATABASE doctor_db;
    CREATE DATABASE appointment_db;
    CREATE DATABASE notification_db;
    CREATE DATABASE payment_db;
    CREATE DATABASE telemedicine_db;
    CREATE DATABASE symptom_checker_db;
EOSQL

echo "All service databases created successfully!"
