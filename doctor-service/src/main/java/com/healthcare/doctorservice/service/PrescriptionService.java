package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.PrescriptionRequest;
import com.healthcare.doctorservice.dto.PrescriptionResponse;

import java.util.List;

public interface PrescriptionService {

    PrescriptionResponse createPrescription(Long doctorId, PrescriptionRequest request, org.springframework.web.multipart.MultipartFile file);

    PrescriptionResponse getPrescriptionById(Long id);

    List<PrescriptionResponse> getPrescriptionsByPatient(Long patientId);

    List<PrescriptionResponse> getPrescriptionsByDoctor(Long doctorId);
}
