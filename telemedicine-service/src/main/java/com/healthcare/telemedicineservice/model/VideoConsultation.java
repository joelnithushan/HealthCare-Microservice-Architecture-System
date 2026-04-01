package com.healthcare.telemedicineservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "video_consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoConsultation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID appointmentId;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false, unique = true)
    private String jitsiRoomName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationStatus status;
}
