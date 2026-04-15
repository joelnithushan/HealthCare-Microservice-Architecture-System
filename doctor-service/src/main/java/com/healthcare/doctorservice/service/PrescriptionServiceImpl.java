package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.PrescriptionRequest;
import com.healthcare.doctorservice.dto.PrescriptionResponse;
import com.healthcare.doctorservice.model.Prescription;
import com.healthcare.doctorservice.repo.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Override
    public PrescriptionResponse createPrescription(Long doctorId, PrescriptionRequest request, MultipartFile file) {
        Prescription prescription = new Prescription();
        prescription.setDoctorId(doctorId);
        prescription.setPatientId(request.getPatientId());
        prescription.setAppointmentId(request.getAppointmentId());
        prescription.setMedication(request.getMedication());
        prescription.setDosage(request.getDosage());
        prescription.setInstructions(request.getInstructions());
        prescription.setFrequency(request.getFrequency());
        prescription.setDuration(request.getDuration());
        prescription.setNotes(request.getNotes());

        if (file != null && !file.isEmpty()) {
            try {
                prescription.setPrescriptionDocumentData(file.getBytes());
                prescription.setPrescriptionDocumentType(file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read prescription PDF data", e);
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);
        
        if (file != null && !file.isEmpty() && saved.getId() != null) {
            saved.setPrescriptionPdfUrl("/api/v1/doctors/prescriptions/" + saved.getId() + "/document");
            saved = prescriptionRepository.save(saved);
        }

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
        response.setFrequency(prescription.getFrequency());
        response.setDuration(prescription.getDuration());
        response.setNotes(prescription.getNotes());
        response.setPrescriptionPdfUrl(prescription.getPrescriptionPdfUrl());
        response.setIssuedDate(prescription.getIssuedDate());
        return response;
    }
}
