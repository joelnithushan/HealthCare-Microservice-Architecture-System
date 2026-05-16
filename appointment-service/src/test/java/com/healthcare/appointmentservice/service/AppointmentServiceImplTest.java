package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.AppointmentRequest;
import com.healthcare.appointmentservice.dto.AppointmentResponse;
import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import com.healthcare.appointmentservice.repo.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private NotificationIntegrationService notificationIntegrationService;

    @InjectMocks
    private AppointmentServiceImpl service;

    private Appointment makeAppointment(Long id, AppointmentStatus status) {
        Appointment a = new Appointment();
        a.setId(id);
        a.setPatientId(10L);
        a.setDoctorId(20L);
        a.setAppointmentDate(LocalDate.now().plusDays(1));
        a.setAppointmentTime(LocalTime.of(10, 0));
        a.setAppointmentType("PHYSICAL");
        a.setStatus(status);
        return a;
    }

    // ── Issue #9: State-machine — PENDING must NOT jump directly to COMPLETED ──

    @Test
    void updateStatus_shouldBlockIllegalTransitionPendingToCompleted() {
        Appointment a = makeAppointment(1L, AppointmentStatus.PENDING);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(a));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.updateAppointmentStatus(1L, "COMPLETED"));
        assertTrue(ex.getMessage().toLowerCase().contains("invalid") ||
                   ex.getMessage().toLowerCase().contains("transition") ||
                   ex.getMessage().toLowerCase().contains("cannot"),
                "Expected a meaningful rejection message, got: " + ex.getMessage());
    }

    @Test
    void updateStatus_shouldAllowConfirmedToCompleted() {
        Appointment a = makeAppointment(1L, AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(a));
        when(appointmentRepository.save(any())).thenReturn(a);
        doNothing().when(notificationIntegrationService).notifyStatusChanged(any(), any());

        assertDoesNotThrow(() -> service.updateAppointmentStatus(1L, "COMPLETED"));
    }

    @Test
    void updateStatus_shouldAllowPendingToCancelled() {
        Appointment a = makeAppointment(1L, AppointmentStatus.PENDING);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(a));
        when(appointmentRepository.save(any())).thenReturn(a);
        doNothing().when(notificationIntegrationService).notifyStatusChanged(any(), any());

        assertDoesNotThrow(() -> service.updateAppointmentStatus(1L, "CANCELLED"));
    }

    @Test
    void updateStatus_shouldBlockUpdatingCancelledAppointment() {
        Appointment a = makeAppointment(1L, AppointmentStatus.CANCELLED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(a));

        assertThrows(RuntimeException.class,
                () -> service.updateAppointmentStatus(1L, "CONFIRMED"));
    }

    // ── Issue #10: Any doctor can accept any appointment — service layer guard ──

    @Test
    void acceptAppointment_shouldThrowWhenAppointmentIsAlreadyConfirmed() {
        Appointment a = makeAppointment(1L, AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(a));

        assertThrows(RuntimeException.class,
                () -> service.acceptAppointment(1L));
    }

    @Test
    void rejectAppointment_shouldThrowWhenAppointmentIsNotPending() {
        Appointment a = makeAppointment(1L, AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(a));

        assertThrows(RuntimeException.class,
                () -> service.rejectAppointment(1L));
    }

    // ── Issue #8: Past-date validation ──

    @Test
    void createAppointment_shouldThrowForPastDate() {
        AppointmentRequest req = new AppointmentRequest(
                10L, 20L,
                LocalDate.now().minusDays(1),
                LocalTime.of(10, 0),
                "PHYSICAL", "PENDING", null);

        assertThrows(RuntimeException.class,
                () -> service.createAppointment(req));
    }

    // ── Issue #8: Double-booking prevention ──

    @Test
    void createAppointment_shouldThrowWhenSlotAlreadyBooked() {
        AppointmentRequest req = new AppointmentRequest(
                10L, 20L,
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                "PHYSICAL", "PENDING", null);

        when(appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        anyLong(), any(), any(), anyList()))
                .thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> service.createAppointment(req));
        verify(appointmentRepository, never()).save(any());
    }

    // ── Issue #17: N+1 — verify getAppointmentsByPatientId delegates to repo ──

    @Test
    void getAppointmentsByPatientId_shouldDelegateToRepository() {
        Appointment a = makeAppointment(1L, AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findByPatientId(10L)).thenReturn(List.of(a));

        List<AppointmentResponse> result = service.getAppointmentsByPatientId(10L);

        assertEquals(1, result.size());
        verify(appointmentRepository).findByPatientId(10L);
    }
}
