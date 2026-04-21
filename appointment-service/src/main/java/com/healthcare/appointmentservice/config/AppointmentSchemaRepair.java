package com.healthcare.appointmentservice.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@Component
public class AppointmentSchemaRepair {

    private final JdbcTemplate jdbcTemplate;

    public AppointmentSchemaRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureAppointmentTypeColumnExists() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_type'",
                    Integer.class);

            if (count != null && count == 0) {
                jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN appointment_type VARCHAR(50) DEFAULT 'IN_PERSON'");
            }

            jdbcTemplate.execute("UPDATE appointments SET appointment_type = 'IN_PERSON' WHERE appointment_type IS NULL");
            jdbcTemplate.execute("ALTER TABLE appointments ALTER COLUMN appointment_type SET NOT NULL");
        } catch (Exception ignored) {
            // Keep service startup resilient; schema can also be repaired manually if needed.
        }
    }
}
