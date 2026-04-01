package com.healthcare.telemedicineservice.repo;

import com.healthcare.telemedicineservice.model.VideoConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoConsultationRepository extends JpaRepository<VideoConsultation, UUID> {
    Optional<VideoConsultation> findByAppointmentId(UUID appointmentId);
    Optional<VideoConsultation> findByJitsiRoomName(String jitsiRoomName);
}
