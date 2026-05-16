package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import com.healthcare.appointmentservice.repo.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationIntegrationService notificationIntegrationService;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void sendReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Get appointments for today that are CONFIRMED and reminder hasn't been sent
        List<Appointment> upcomingAppointments = appointmentRepository.findByAppointmentDateAndStatusAndReminderSentFalse(today, AppointmentStatus.CONFIRMED);

        for (Appointment appointment : upcomingAppointments) {
            long minutesUntil = ChronoUnit.MINUTES.between(now, appointment.getAppointmentTime());

            // Accept -1 to handle scheduler jitter: if the scheduler fires
            // one second after the appointment time, truncation gives -1.
            if (minutesUntil >= -1 && minutesUntil <= 5) {
                try {
                    notificationIntegrationService.notifyReminder(appointment);
                    appointment.setReminderSent(true);
                    appointmentRepository.save(appointment);
                } catch (Exception e) {
                    System.err.println("Failed to send reminder for appointment " + appointment.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
