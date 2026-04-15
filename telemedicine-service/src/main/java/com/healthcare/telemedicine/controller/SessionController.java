package com.healthcare.telemedicine.controller;

import com.healthcare.telemedicine.model.Session;
import com.healthcare.telemedicine.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/v1/telemedicine/sessions")
public class SessionController {

    @Autowired
    private SessionRepository sessionRepository;

    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody Session sessionRequest) {
        // Simple logic: if doesn't exist, create it.
        return sessionRepository.findByAppointmentId(sessionRequest.getAppointmentId())
                .map(existing -> new ResponseEntity<>(existing, HttpStatus.OK))
                .orElseGet(() -> {
                    if (sessionRequest.getRoomName() == null) {
                        sessionRequest.setRoomName("MediConnect-" + UUID.randomUUID().toString().substring(0, 8));
                    }
                    sessionRequest.setStatus("PENDING");
                    Session saved = sessionRepository.save(sessionRequest);
                    return new ResponseEntity<>(saved, HttpStatus.CREATED);
                });
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Session> getSessionByAppointment(@PathVariable Long appointmentId) {
        return sessionRepository.findByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<Session> startSession(@PathVariable Long id) {
        return sessionRepository.findById(id)
                .map(session -> {
                    session.setStatus("ACTIVE");
                    session.setStartTime(LocalDateTime.now());
                    return ResponseEntity.ok(sessionRepository.save(session));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<Session> endSession(@PathVariable Long id) {
        return sessionRepository.findById(id)
                .map(session -> {
                    session.setStatus("COMPLETED");
                    session.setEndTime(LocalDateTime.now());
                    return ResponseEntity.ok(sessionRepository.save(session));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
