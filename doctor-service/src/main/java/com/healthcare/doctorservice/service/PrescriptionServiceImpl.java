package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.PrescriptionRequest;
import com.healthcare.doctorservice.dto.PrescriptionResponse;
import com.healthcare.doctorservice.model.Prescription;
import com.healthcare.doctorservice.repo.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Override
    public PrescriptionResponse createPrescription(Long doctorId, PrescriptionRequest request) {
        Prescription prescription = new Prescription();
        prescription.setDoctorId(doctorId);
        prescription.setPatientId(request.getPatientId());
        prescription.setAppointmentId(request.getAppointmentId());
        prescription.setMedication(request.getMedication());
        prescription.setDosage(request.getDosage());
        prescription.setInstructions(request.getInstructions());

        Prescription saved = prescriptionRepository.save(prescription);
        return mapToResponse(saved);
    }

    @Override
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with ID: " + id));
        return mapToResponse(prescription);
    }

    @Override
    public List<PrescriptionResponse> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionResponse> getPrescriptionsByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PrescriptionResponse mapToResponse(Prescription prescription) {
        PrescriptionResponse response = new PrescriptionResponse();
        response.setId(prescription.getId());
        response.setDoctorId(prescription.getDoctorId());
        response.setPatientId(prescription.getPatientId());
        response.setAppointmentId(prescription.getAppointmentId());
        response.setMedication(prescription.getMedication());
        response.setDosage(prescription.getDosage());
        response.setInstructions(prescription.getInstructions());
        response.setIssuedDate(prescription.getIssuedDate());
        return response;
    }
}
