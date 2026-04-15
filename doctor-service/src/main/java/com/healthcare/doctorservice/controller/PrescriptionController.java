package com.healthcare.doctorservice.controller;

import com.healthcare.doctorservice.dto.PrescriptionRequest;
import com.healthcare.doctorservice.dto.PrescriptionResponse;
import com.healthcare.doctorservice.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.healthcare.doctorservice.repo.PrescriptionRepository;
import com.healthcare.doctorservice.model.Prescription;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @RequestParam Long doctorId,
            @ModelAttribute PrescriptionRequest request,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        PrescriptionResponse created = prescriptionService.createPrescription(doctorId, request, file);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(doctorId));
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> getPrescriptionDocument(@PathVariable Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id " + id));
        if (prescription.getPrescriptionDocumentData() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"prescription-document\"")
                .contentType(MediaType.parseMediaType(prescription.getPrescriptionDocumentType() != null ? prescription.getPrescriptionDocumentType() : "application/pdf"))
                .body(prescription.getPrescriptionDocumentData());
    }
}
