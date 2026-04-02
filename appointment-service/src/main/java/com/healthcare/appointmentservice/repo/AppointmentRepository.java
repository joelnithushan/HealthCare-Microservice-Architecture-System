package com.healthcare.appointmentservice.repo;

import com.healthcare.appointmentservice.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
}
