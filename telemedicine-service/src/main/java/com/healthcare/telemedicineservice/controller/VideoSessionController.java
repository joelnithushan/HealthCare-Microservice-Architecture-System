package com.healthcare.telemedicineservice.controller;

import com.healthcare.telemedicineservice.dto.VideoSessionRequest;
import com.healthcare.telemedicineservice.dto.VideoSessionResponse;
import com.healthcare.telemedicineservice.service.VideoSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/telemedicine/sessions")
@CrossOrigin(origins = "*")
public class VideoSessionController {

    @Autowired
    private VideoSessionService videoSessionService;

    @PostMapping
    public ResponseEntity<VideoSessionResponse> createSession(@RequestBody VideoSessionRequest request) {
        VideoSessionResponse created = videoSessionService.createSession(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoSessionResponse> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(videoSessionService.getSessionById(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<VideoSessionResponse> getSessionByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(videoSessionService.getSessionByAppointment(appointmentId));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<VideoSessionResponse> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(videoSessionService.startSession(id));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<VideoSessionResponse> endSession(@PathVariable Long id) {
        return ResponseEntity.ok(videoSessionService.endSession(id));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<VideoSessionResponse>> getSessionsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(videoSessionService.getSessionsByDoctor(doctorId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VideoSessionResponse>> getSessionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(videoSessionService.getSessionsByPatient(patientId));
    }
}
