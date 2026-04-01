package com.healthcare.telemedicineservice.repo;

import com.healthcare.telemedicineservice.model.VideoSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {

    Optional<VideoSession> findByAppointmentId(Long appointmentId);

    List<VideoSession> findByDoctorId(Long doctorId);

    List<VideoSession> findByPatientId(Long patientId);
}
