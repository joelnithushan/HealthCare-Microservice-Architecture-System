package com.healthcare.telemedicineservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsultationRequest {
    @NotNull
    private UUID appointmentId;

    @NotNull
    private UUID doctorId;

    @NotNull
    private UUID patientId;
}
