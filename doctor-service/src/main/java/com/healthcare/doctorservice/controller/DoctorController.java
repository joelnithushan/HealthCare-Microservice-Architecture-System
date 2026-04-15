package com.healthcare.doctorservice.controller;

import com.healthcare.doctorservice.dto.DoctorRequest;
import com.healthcare.doctorservice.dto.DoctorResponse;
import com.healthcare.doctorservice.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.healthcare.doctorservice.repo.DoctorRepository;
import com.healthcare.doctorservice.model.Doctor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping
    public ResponseEntity<DoctorResponse> createDoctor(@RequestBody DoctorRequest request) {
        DoctorResponse created = doctorService.createDoctor(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/verified")
    public ResponseEntity<List<DoctorResponse>> getVerifiedDoctors() {
        return ResponseEntity.ok(doctorService.getVerifiedDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<DoctorResponse> getDoctorByEmail(@PathVariable String email) {
        return ResponseEntity.ok(doctorService.getDoctorByEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponse> updateDoctor(@PathVariable Long id, @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorResponse>> getDoctorsBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialization(specialization));
    }

    @PostMapping("/{id}/upload-profile-pic")
    public ResponseEntity<DoctorResponse> uploadProfilePic(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(doctorService.uploadProfilePic(id, file));
    }

    @GetMapping("/{id}/profile-image")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));
        if (doctor.getProfileImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"profile-image\"")
                .contentType(MediaType.parseMediaType(doctor.getProfileImageContentType() != null ? doctor.getProfileImageContentType() : "application/octet-stream"))
                .body(doctor.getProfileImageData());
    }
}
