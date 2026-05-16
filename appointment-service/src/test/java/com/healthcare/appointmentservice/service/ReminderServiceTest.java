package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import com.healthcare.appointmentservice.repo.AppointmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private NotificationIntegrationService notificationIntegrationService;

    @InjectMocks
    private ReminderService reminderService;

    private Appointment makeConfirmedAppointment(LocalTime time) {
        Appointment a = new Appointment();
        a.setId(1L);
        a.setAppointmentDate(LocalDate.now());
        a.setAppointmentTime(time);
        a.setStatus(AppointmentStatus.CONFIRMED);
        a.setReminderSent(false);
        return a;
    }

    // ── Issue #14: Reminder should fire for appointments within the next 5 min ──

    @Test
    void sendReminders_shouldSendWhenAppointmentIsIn3Minutes() throws Exception {
        LocalTime inThreeMinutes = LocalTime.now().plusMinutes(3);
        Appointment a = makeConfirmedAppointment(inThreeMinutes);

        when(appointmentRepository.findByAppointmentDateAndStatusAndReminderSentFalse(
                LocalDate.now(), AppointmentStatus.CONFIRMED))
                .thenReturn(List.of(a));
        when(appointmentRepository.save(any())).thenReturn(a);

        reminderService.sendReminders();

        verify(notificationIntegrationService).notifyReminder(a);
        assertTrue(a.getReminderSent(), "reminderSent flag should be set to true");
    }

    @Test
    void sendReminders_shouldNotSendWhenAppointmentIsFarInFuture() throws Exception {
        LocalTime inOneHour = LocalTime.now().plusMinutes(60);
        Appointment a = makeConfirmedAppointment(inOneHour);

        when(appointmentRepository.findByAppointmentDateAndStatusAndReminderSentFalse(
                LocalDate.now(), AppointmentStatus.CONFIRMED))
                .thenReturn(List.of(a));

        reminderService.sendReminders();

        verify(notificationIntegrationService, never()).notifyReminder(any());
        assertFalse(a.getReminderSent());
    }

    // ── Issue #14: Scheduler fires slightly late — appointment is 1 min past ──
    // The scheduler runs every 60s. If it fires at 10:00:30 for an appointment
    // at 10:00:00, LocalTime truncation gives minutesUntil = -1.
    // Accepting -1 (just fired) prevents missed reminders due to scheduler jitter.

    @Test
    void sendReminders_shouldSendEvenWhenSchedulerFiredSlightlyPastAppointmentTime() {
        // Simulate an appointment that was exactly 1 minute ago (scheduler jitter)
        LocalTime oneMinuteAgo = LocalTime.now().minusMinutes(1);
        Appointment a = makeConfirmedAppointment(oneMinuteAgo);

        when(appointmentRepository.findByAppointmentDateAndStatusAndReminderSentFalse(
                LocalDate.now(), AppointmentStatus.CONFIRMED))
                .thenReturn(List.of(a));
        when(appointmentRepository.save(any())).thenReturn(a);

        reminderService.sendReminders();

        verify(notificationIntegrationService).notifyReminder(a);
        assertTrue(a.getReminderSent());
    }

    @Test
    void sendReminders_shouldSkipWhenNoAppointmentsToday() {
        when(appointmentRepository.findByAppointmentDateAndStatusAndReminderSentFalse(
                any(), any()))
                .thenReturn(Collections.emptyList());

        reminderService.sendReminders();

        verify(notificationIntegrationService, never()).notifyReminder(any());
    }
}
