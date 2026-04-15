package com.healthcare.doctorservice.controller;

import com.healthcare.doctorservice.dto.DoctorResponse;
import com.healthcare.doctorservice.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/doctors")
public class AdminDoctorController {

    @Autowired
    private DoctorService doctorService;

    @PutMapping("/{id}/verify")
    public ResponseEntity<DoctorResponse> verifyDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.verifyDoctor(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<DoctorResponse> rejectDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.rejectDoctor(id));
    }

    @GetMapping("/unverified")
    public ResponseEntity<List<DoctorResponse>> getUnverifiedDoctors() {
        return ResponseEntity.ok(doctorService.getUnverifiedDoctors());
    }

    @GetMapping("/verified")
    public ResponseEntity<List<DoctorResponse>> getVerifiedDoctors() {
        return ResponseEntity.ok(doctorService.getVerifiedDoctors());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDoctorStats() {
        return ResponseEntity.ok(doctorService.getDoctorStats());
    }
}
