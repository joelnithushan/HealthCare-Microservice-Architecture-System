package com.healthcare.telemedicineservice.dto;

import com.healthcare.telemedicineservice.model.ConsultationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponse {
    private UUID id;
    private UUID appointmentId;
    private UUID doctorId;
    private UUID patientId;
    private String jitsiRoomName;
    private String jitsiMeetUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ConsultationStatus status;
}
