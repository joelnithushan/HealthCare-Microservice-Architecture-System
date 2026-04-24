package com.healthcare.doctorservice.controller;

import com.healthcare.doctorservice.model.Prescription;
import com.healthcare.doctorservice.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Value("${notification.service.base-url:http://localhost:8084}")
    private String notificationServiceBaseUrl;

    @Value("${user.service.base-url:http://localhost:8081}")
    private String userServiceBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<Prescription> createPrescription(@RequestBody Prescription prescription) {
        Prescription saved = prescriptionService.createPrescription(prescription);

        try {
            // Fetch patient email/phone
            java.util.Map<String, Object> patient = restTemplate.getForObject(
                    userServiceBaseUrl + "/users/" + saved.getPatientId(), java.util.Map.class);

            if (patient != null) {
                String email = (String) patient.get("email");
                String phone = (String) patient.get("mobileNumber");

                // Send Email
                if (email != null && !email.isEmpty()) {
                    java.util.Map<String, Object> emailReq = new java.util.HashMap<>();
                    emailReq.put("userId", saved.getPatientId());
                    emailReq.put("recipientEmail", email);
                    emailReq.put("type", "EMAIL");
                    emailReq.put("subject", "New Digital Prescription");
                    emailReq.put("message", "Dr. " + saved.getDoctorName() + " has issued a new prescription for your recent appointment. Please log in to view it.");
                    emailReq.put("status", "UNREAD");
                    restTemplate.postForEntity(notificationServiceBaseUrl + "/notifications/send", emailReq, Void.class);
                }

                // Send SMS
                if (phone != null && !phone.isEmpty()) {
                    java.util.Map<String, Object> smsReq = new java.util.HashMap<>();
                    smsReq.put("userId", saved.getPatientId());
                    smsReq.put("recipientPhone", phone);
                    smsReq.put("type", "SMS");
                    smsReq.put("subject", "New Prescription");
                    smsReq.put("message", "New prescription issued by Dr." + saved.getDoctorName() + ". Check your account.");
                    smsReq.put("status", "UNREAD");
                    restTemplate.postForEntity(notificationServiceBaseUrl + "/notifications/send", smsReq, Void.class);
                }
            }
        } catch (Exception e) {
            // Ignore notification errors
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctorId(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Prescription> getPrescriptionByAppointmentId(@PathVariable Long appointmentId) {
        Prescription p = prescriptionService.getPrescriptionByAppointmentId(appointmentId);
        if (p == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(p);
    }
}
