package com.healthcare.appointmentservice.controller;

import com.healthcare.appointmentservice.dto.AppointmentRequest;
import com.healthcare.appointmentservice.dto.AppointmentResponse;
import com.healthcare.appointmentservice.service.AppointmentService;
import com.healthcare.appointmentservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private HttpServletRequest httpServletRequest;

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentRequest request) {
        AppointmentResponse created = appointmentService.createAppointment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        String role = getCurrentRole();
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view all appointments.");
        }
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/booked-slots")
    public ResponseEntity<List<LocalTime>> getBookedSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getBookedSlots(doctorId, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        validateAppointmentOwnership(appointment);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatientId(@PathVariable Long userId) {
        String role = getCurrentRole();
        if ("PATIENT".equals(role) && !userId.equals(getCurrentUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only view their own appointments.");
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(userId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctorId(@PathVariable Long doctorId) {
        String role = getCurrentRole();
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(doctorId));
        }
        
        if ("DOCTOR".equals(role)) {
            // For doctors, we verify ownership based on their email. 
            // We ignore the doctorId passed if it doesn't match their own profile.
            // This handles the case where the frontend might pass a userId instead of a doctorProfileId.
            Long myProfileId = getDoctorProfileIdForCurrentUser();
            if (myProfileId != null) {
                return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(myProfileId));
            }
        }
        
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access these appointments.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(@PathVariable Long id,
            @RequestBody AppointmentRequest request) {
        AppointmentResponse current = appointmentService.getAppointmentById(id);
        validatePatientOwnershipForMutation(current);
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {
        AppointmentResponse current = appointmentService.getAppointmentById(id);
        validatePatientOwnershipForMutation(current);
        
        LocalDate newDate = LocalDate.parse(request.get("newDate"));
        LocalTime newTime = LocalTime.parse(request.get("newTimeSlot"));
        
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, newDate, newTime));
    }
    
    @GetMapping("/check-availability")
    public ResponseEntity<java.util.Map<String, Boolean>> checkAvailability(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime timeSlot) {
        
        boolean isAvailable = appointmentService.checkAvailability(doctorId, date, timeSlot);
        return ResponseEntity.ok(java.util.Map.of("available", isAvailable));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {
        String newStatus = request.get("status");
        AppointmentResponse current = appointmentService.getAppointmentById(id);
        
        String role = getCurrentRole();
        // Allow patient to set to PENDING (pending doctor approval) after payment
        if ("PATIENT".equals(role) && "PENDING".equals(newStatus)) {
            if (!current.getPatientId().equals(getCurrentUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own appointments.");
            }
        } else {
            // Otherwise, only doctor or admin can change status
            validateDoctorOwnershipForMutation(current);
        }
        
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, newStatus));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<AppointmentResponse> acceptAppointment(@PathVariable Long id) {
        AppointmentResponse current = appointmentService.getAppointmentById(id);
        validateDoctorOwnershipForMutation(current);
        return ResponseEntity.ok(appointmentService.acceptAppointment(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AppointmentResponse> rejectAppointment(@PathVariable Long id) {
        AppointmentResponse current = appointmentService.getAppointmentById(id);
        validateDoctorOwnershipForMutation(current);
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        AppointmentResponse current = appointmentService.getAppointmentById(id);
        validatePatientOwnershipForMutation(current);
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    private void validateAppointmentOwnership(AppointmentResponse appointment) {
        String role = getCurrentRole();
        Long currentUserId = getCurrentUserId();
        if ("ADMIN".equals(role)) {
            return;
        }
        if ("PATIENT".equals(role) && !appointment.getPatientId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access this appointment.");
        }
        if ("DOCTOR".equals(role) && !isDoctorOwner(appointment.getDoctorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access this appointment.");
        }
    }

    private void validatePatientOwnershipForMutation(AppointmentResponse appointment) {
        String role = getCurrentRole();
        if ("ADMIN".equals(role)) {
            return;
        }
        if (!"PATIENT".equals(role) || !appointment.getPatientId().equals(getCurrentUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owning patient or admin can modify this appointment.");
        }
    }

    private void validateDoctorOwnershipForMutation(AppointmentResponse appointment) {
        String role = getCurrentRole();
        if ("ADMIN".equals(role)) {
            return;
        }
        if (!"DOCTOR".equals(role) || !isDoctorOwner(appointment.getDoctorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned doctor or admin can update this appointment status.");
        }
    }

    private String getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authentication context.");
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Role claim is missing."));
    }

    private Long getCurrentUserId() {
        String authHeader = httpServletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is missing.");
        }

        try {
            return jwtUtil.extractUserId(authHeader.substring(7));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token.");
        }
    }

    private String getCurrentUserEmail() {
        String authHeader = httpServletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is missing.");
        }
        try {
            return jwtUtil.extractUsername(authHeader.substring(7));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token.");
        }
    }

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${doctor.service.base-url:http://localhost:8082}")
    private String doctorServiceBaseUrl;

    private boolean isDoctorOwner(Long doctorProfileId) {
        if (doctorProfileId == null) return false;
        try {
            String currentUserEmail = getCurrentUserEmail();
            java.util.Map<String, Object> doctorProfile = restTemplate.getForObject(
                    doctorServiceBaseUrl + "/doctors/" + doctorProfileId, java.util.Map.class);
            if (doctorProfile != null && currentUserEmail.equals(doctorProfile.get("email"))) {
                return true;
            }
        } catch (Exception e) {
            // Ignore error and fall back to false
        }
        return false;
    }

    private Long getDoctorProfileIdForCurrentUser() {
        try {
            String currentUserEmail = getCurrentUserEmail();
            java.util.Map<String, Object> doctorProfile = restTemplate.getForObject(
                    doctorServiceBaseUrl + "/doctors/email/" + currentUserEmail, java.util.Map.class);
            if (doctorProfile != null && doctorProfile.get("id") != null) {
                return ((Number) doctorProfile.get("id")).longValue();
            }
        } catch (Exception e) {
            // Log error
        }
        return null;
    }
}
