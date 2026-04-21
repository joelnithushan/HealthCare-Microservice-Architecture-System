package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.NotificationRequest;
import com.healthcare.appointmentservice.dto.UserContactResponse;
import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationIntegrationService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.service.base-url:http://localhost:8081}")
    private String userServiceBaseUrl;

    @Value("${notification.service.base-url:http://localhost:8084}")
    private String notificationServiceBaseUrl;

    public void notifyAppointmentCreated(Appointment appointment) {
        String message = String.format(
                "Appointment #%d booked for %s at %s.",
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime());
        dispatchForBothParties(appointment, "Appointment Booking Confirmed", message);
    }

    public void notifyStatusChanged(Appointment appointment, AppointmentStatus previousStatus) {
        String message = String.format(
                "Appointment #%d status changed from %s to %s.",
                appointment.getId(),
                previousStatus.name(),
                appointment.getStatus().name());
        dispatchForBothParties(appointment, "Appointment Status Updated", message);
    }

    public void notifyAppointmentCancelled(Appointment appointment) {
        String message = String.format(
                "Appointment #%d on %s at %s has been cancelled.",
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime());
        dispatchForBothParties(appointment, "Appointment Cancelled", message);
    }

    private void dispatchForBothParties(Appointment appointment, String subject, String message) {
        sendForUser(appointment.getPatientId(), subject, message);
        sendForUser(appointment.getDoctorId(), subject, message);
    }

    private void sendForUser(Long userId, String subject, String message) {
        UserContactResponse user = fetchUser(userId);

        // Always create an in-app appointment notification for dashboard visibility.
        sendNotification(buildRequest(userId, subject, message, "APPOINTMENT", null, null));

        if (user == null) {
            return;
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            sendNotification(buildRequest(userId, subject, message, "EMAIL", user.getEmail(), null));
        }

        if (user.getMobileNumber() != null && !user.getMobileNumber().isBlank()) {
            sendNotification(buildRequest(userId, subject, message, "SMS", null, user.getMobileNumber()));
        }
    }

    private UserContactResponse fetchUser(Long userId) {
        try {
            String url = userServiceBaseUrl + "/users/" + userId;
            ResponseEntity<UserContactResponse> response = restTemplate.getForEntity(url, UserContactResponse.class);
            return response.getBody();
        } catch (Exception ignored) {
            return null;
        }
    }

    private NotificationRequest buildRequest(
            Long userId,
            String subject,
            String message,
            String type,
            String recipientEmail,
            String recipientPhone) {
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
            String url = notificationServiceBaseUrl + "/notifications/send";
            restTemplate.postForEntity(url, request, Void.class);
        } catch (Exception ignored) {
            // Notifications should not block core appointment operations.
        }
    }
}
