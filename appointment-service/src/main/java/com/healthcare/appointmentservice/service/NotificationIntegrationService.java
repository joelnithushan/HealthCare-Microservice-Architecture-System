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

@Service
public class NotificationIntegrationService {

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
        String subject = "New Appointment Request";
        String message = String.format(
                "New appointment request #%d from %s on %s at %s. Please review and accept or reject it.",
                appointment.getId(), patientName,
                appointment.getAppointmentDate(), appointment.getAppointmentTime());
        sendToDoctor(doctor, appointment.getDoctorId(), subject, message);
    }

    public void notifyStatusChanged(Appointment appointment, AppointmentStatus previousStatus) {
        UserContactResponse patient = fetchUser(appointment.getPatientId());
        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        String doctorName = doctor != null && doctor.getName() != null ? doctor.getName() : ("Dr. #" + appointment.getDoctorId());
        AppointmentStatus current = appointment.getStatus();

        String subject;
        String message;
        switch (current) {
            case ACCEPTED -> {
                subject = "Appointment Accepted";
                message = String.format(
                        "Dr. %s has accepted your appointment #%d on %s at %s. Please proceed to payment to confirm.",
                        doctorName, appointment.getId(),
                        appointment.getAppointmentDate(), appointment.getAppointmentTime());
            }
            case REJECTED -> {
                subject = "Appointment Rejected";
                message = String.format(
                        "Dr. %s has rejected your appointment request #%d on %s at %s.",
                        doctorName, appointment.getId(),
                        appointment.getAppointmentDate(), appointment.getAppointmentTime());
            }
            case CONFIRMED -> {
                subject = "Appointment Confirmed";
                message = String.format(
                        "Payment received. Your appointment #%d with Dr. %s on %s at %s is confirmed.",
                        appointment.getId(), doctorName,
                        appointment.getAppointmentDate(), appointment.getAppointmentTime());
            }
            case COMPLETED -> {
                subject = "Appointment Completed";
                message = String.format(
                        "Appointment #%d with Dr. %s has been marked as completed.",
                        appointment.getId(), doctorName);
            }
            default -> {
                subject = "Appointment Status Updated";
                message = String.format(
                        "Appointment #%d status changed from %s to %s.",
                        appointment.getId(), previousStatus.name(), current.name());
            }
        }
        sendToPatient(patient, appointment.getPatientId(), subject, message);
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
        } catch (Exception ignored) {
        }
    }
}
