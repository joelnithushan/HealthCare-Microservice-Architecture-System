package com.healthcare.appointmentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.CommandLineRunner;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AppointmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner migrateStatuses(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check");
                jdbcTemplate.update("UPDATE appointments SET status = 'ACCEPTED' WHERE status = 'CONFIRMED'");
                jdbcTemplate.update("UPDATE appointments SET status = 'ACCEPTED' WHERE status = 'SCHEDULED'");
                jdbcTemplate.update("UPDATE appointments SET status = 'PENDING' WHERE status = 'BOOKED'");
                System.out.println("Status migration completed successfully.");
            } catch (Exception e) {
                System.out.println("Migration skipped or failed: " + e.getMessage());
            }
        };
    }
}
