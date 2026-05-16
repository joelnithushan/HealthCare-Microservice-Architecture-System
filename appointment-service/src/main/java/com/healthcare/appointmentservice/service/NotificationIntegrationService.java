package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.DoctorContactResponse;
import com.healthcare.appointmentservice.dto.NotificationRequest;
import com.healthcare.appointmentservice.dto.UserContactResponse;
import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
public class NotificationIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationIntegrationService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.service.base-url:http://localhost:8081}")
    private String userServiceBaseUrl;

    @Value("${doctor.service.base-url:http://localhost:8082}")
    private String doctorServiceBaseUrl;

    @Value("${notification.service.base-url:http://localhost:8084}")
    private String notificationServiceBaseUrl;

    public void notifyAppointmentCreated(Appointment appointment) {
        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        UserContactResponse patient = fetchUser(appointment.getPatientId());
        String patientName = patient != null && patient.getName() != null ? patient.getName() : ("Patient #" + appointment.getPatientId());
        String subject = "New Appointment Request - " + patientName;
        String message = String.format(
                "Hello Dr. %s,\n\nYou have a new appointment request (#%d) from %s.\n\n" +
                "Date: %s\n" +
                "Time: %s\n" +
                "Type: %s\n" +
                "Location: %s\n\n" +
                "Please log in to your dashboard to review and manage this request.",
                (doctor != null ? doctor.getName() : "Doctor"),
                appointment.getId(), patientName,
                appointment.getAppointmentDate(), appointment.getAppointmentTime(),
                appointment.getAppointmentType(),
                (doctor != null && doctor.getHospital() != null ? doctor.getHospital() : "Clinexa Virtual Clinic"));
        sendToDoctor(doctor, appointment.getDoctorId(), subject, message);
    }

    public void notifyStatusChanged(Appointment appointment, AppointmentStatus previousStatus) {
        UserContactResponse patient = fetchUser(appointment.getPatientId());
        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        String doctorName = doctor != null && doctor.getName() != null ? doctor.getName() : ("Dr. #" + appointment.getDoctorId());
        AppointmentStatus current = appointment.getStatus();

        String subject;
        String message;
        String dateStr = appointment.getAppointmentDate().toString();
        String timeStr = appointment.getAppointmentTime().toString();
        String hospital = (doctor != null && doctor.getHospital() != null) ? doctor.getHospital() : "Clinexa Virtual Clinic";

        switch (current) {
            case ACCEPTED -> {
                subject = "Appointment Accepted - Clinexa";
                message = String.format(
                        "Great news! Dr. %s has accepted your appointment request #%d.\n\n" +
                        "Scheduled For: %s at %s\n" +
                        "Location: %s\n\n" +
                        "Please complete your payment soon to finalize the booking and secure your slot.",
                        doctorName, appointment.getId(), dateStr, timeStr, hospital);
            }
            case REJECTED -> {
                subject = "Appointment Update: Request Declined";
                message = String.format(
                        "We regret to inform you that Dr. %s is unable to fulfill your appointment request #%d on %s at %s. " +
                        "You may try booking another slot or another doctor.",
                        doctorName, appointment.getId(), dateStr, timeStr);
            }
            case CONFIRMED -> {
                subject = "Appointment Confirmed - " + doctorName;
                message = String.format(
                        "Payment Successful! Your appointment #%d with Dr. %s is now confirmed.\n\n" +
                        "Date: %s\n" +
                        "Time: %s\n" +
                        "Location: %s\n" +
                        "Type: %s\n\n" +
                        "Thank you for choosing Clinexa.",
                        appointment.getId(), doctorName, dateStr, timeStr, hospital, appointment.getAppointmentType());
            }
            case COMPLETED -> {
                subject = "Consultation Summary - Appointment #" + appointment.getId();
                message = String.format(
                        "Your consultation with Dr. %s has been completed. " +
                        "You can now view your digital prescription and medical notes in your dashboard.",
                        doctorName);
            }
            default -> {
                subject = "Appointment Status Updated";
                message = String.format(
                        "The status of your appointment #%d with Dr. %s has been updated from %s to %s.",
                        appointment.getId(), doctorName, previousStatus.name(), current.name());
            }
        }
        sendToPatient(patient, appointment.getPatientId(), subject, message);
        
        // Real-time WebSocket Push
        sendWebSocketNotification(appointment.getPatientId(), "APPOINTMENT_STATUS", appointment.getId(), current.name(), message);
        sendWebSocketNotification(appointment.getDoctorId(), "APPOINTMENT_STATUS", appointment.getId(), current.name(), "Status changed to " + current.name());
    }

    public void notifyAppointmentCancelled(Appointment appointment) {
        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        String subject = "Appointment Cancelled";
        String message = String.format(
                "Appointment #%d on %s at %s has been cancelled by the patient.",
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime());
        sendToDoctor(doctor, appointment.getDoctorId(), subject, message);
    }

    public void notifyAppointmentRescheduled(Appointment appointment) {
        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        UserContactResponse patient = fetchUser(appointment.getPatientId());
        
        // Notify Doctor
        String doctorSubject = "Appointment Rescheduled";
        String doctorMessage = String.format(
                "Appointment #%d rescheduled by patient to %s at %s.",
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime());
        sendToDoctor(doctor, appointment.getDoctorId(), doctorSubject, doctorMessage);
        
        // Notify Patient
        String patientSubject = "Appointment Reschedule Confirmed";
        String patientMessage = String.format(
                "Your appointment #%d has been successfully rescheduled to %s at %s.",
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime());
        sendToPatient(patient, appointment.getPatientId(), patientSubject, patientMessage);
        
        // Real-time WebSocket Push
        sendWebSocketNotification(appointment.getPatientId(), "APPOINTMENT_STATUS", appointment.getId(), "RESCHEDULED", patientMessage);
        sendWebSocketNotification(appointment.getDoctorId(), "APPOINTMENT_STATUS", appointment.getId(), "RESCHEDULED", doctorMessage);
    }

    public void notifyReminder(Appointment appointment) {
        UserContactResponse patient = fetchUser(appointment.getPatientId());
        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        String doctorName = doctor != null && doctor.getName() != null ? doctor.getName() : ("Dr. #" + appointment.getDoctorId());
        String patientName = patient != null && patient.getName() != null ? patient.getName() : ("Patient #" + appointment.getPatientId());

        String timeStr = appointment.getAppointmentTime().toString();

        // Notify Patient
        String patientSubject = "Appointment Reminder";
        String patientMessage = String.format("Your video consultation with Dr. %s starts in 5 minutes (at %s).", doctorName, timeStr);
        sendToPatient(patient, appointment.getPatientId(), patientSubject, patientMessage);

        // Notify Doctor
        String doctorSubject = "Consultation Reminder";
        String doctorMessage = String.format("Your video consultation with %s starts in 5 minutes (at %s).", patientName, timeStr);
        sendToDoctor(doctor, appointment.getDoctorId(), doctorSubject, doctorMessage);
    }

    private void sendToPatient(UserContactResponse user, Long userId, String subject, String message) {
        sendNotification(buildRequest(userId, subject, message, "APPOINTMENT", null, null));
        if (user == null) return;
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            sendNotification(buildRequest(userId, subject, message, "EMAIL", user.getEmail(), null));
        }
        if (user.getMobileNumber() != null && !user.getMobileNumber().isBlank()) {
            sendNotification(buildRequest(userId, subject, message, "SMS", null, user.getMobileNumber()));
        }
    }

    private void sendToDoctor(DoctorContactResponse doctor, Long doctorUserId, String subject, String message) {
        UserContactResponse doctorUser = null;
        if (doctor != null && doctor.getEmail() != null) {
            doctorUser = fetchUserByEmail(doctor.getEmail());
        }
        Long notifyUserId = doctorUser != null ? doctorUser.getId() : doctorUserId;

        sendNotification(buildRequest(notifyUserId, subject, message, "APPOINTMENT", null, null));
        String email = doctor != null ? doctor.getEmail() : (doctorUser != null ? doctorUser.getEmail() : null);
        String phone = doctor != null ? doctor.getPhone() : (doctorUser != null ? doctorUser.getMobileNumber() : null);
        if (email != null && !email.isBlank()) {
            sendNotification(buildRequest(notifyUserId, subject, message, "EMAIL", email, null));
        }
        if (phone != null && !phone.isBlank()) {
            sendNotification(buildRequest(notifyUserId, subject, message, "SMS", null, phone));
        }
    }

    private UserContactResponse fetchUser(Long userId) {
        try {
            ResponseEntity<UserContactResponse> response = restTemplate.getForEntity(
                    userServiceBaseUrl + "/users/" + userId, UserContactResponse.class);
            return response.getBody();
        } catch (Exception ignored) {
            return null;
        }
    }

    private UserContactResponse fetchUserByEmail(String email) {
        try {
            ResponseEntity<UserContactResponse> response = restTemplate.getForEntity(
                    userServiceBaseUrl + "/users/email/" + email, UserContactResponse.class);
            return response.getBody();
        } catch (Exception ignored) {
            return null;
        }
    }

    private DoctorContactResponse fetchDoctor(Long doctorId) {
        try {
            ResponseEntity<DoctorContactResponse> response = restTemplate.getForEntity(
                    doctorServiceBaseUrl + "/doctors/" + doctorId, DoctorContactResponse.class);
            return response.getBody();
        } catch (Exception ignored) {
            return null;
        }
    }

    private NotificationRequest buildRequest(
            Long userId, String subject, String message, String type, String recipientEmail, String recipientPhone) {
        NotificationRequest request = new NotificationRequest();
        request.setUserId(userId);
        request.setSubject(subject);
        request.setMessage(message);
        request.setType(type);
        request.setStatus("UNREAD");
        request.setRecipientEmail(recipientEmail);
        request.setRecipientPhone(recipientPhone);
        return request;
    }

    private void sendNotification(NotificationRequest request) {
        try {
            restTemplate.postForEntity(notificationServiceBaseUrl + "/notifications/send", request, Void.class);
        } catch (Exception e) {
            logger.warn("Failed to send notification to user {}: {}", request.getUserId(), e.getMessage());
        }
    }
    
    private void sendWebSocketNotification(Long userId, String type, Long appointmentId, String newStatus, String message) {
        if (userId == null) return;
        try {
            String url = notificationServiceBaseUrl + "/ws-api/send/" + userId;
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", type);
            payload.put("appointmentId", appointmentId);
            payload.put("newStatus", newStatus);
            payload.put("message", message);
            payload.put("timestamp", java.time.LocalDateTime.now().toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<java.util.Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            restTemplate.postForObject(url, request, Void.class);
        } catch (Exception e) {
            System.err.println("Failed to send WebSocket notification: " + e.getMessage());
        }
    }
}
