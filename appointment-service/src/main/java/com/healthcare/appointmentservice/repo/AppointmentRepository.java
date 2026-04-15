package com.healthcare.appointmentservice.repo;

import com.healthcare.appointmentservice.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
        Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, com.healthcare.appointmentservice.model.AppointmentStatus status
    );
}
