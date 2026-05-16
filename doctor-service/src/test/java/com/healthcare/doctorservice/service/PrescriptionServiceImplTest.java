package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.model.Prescription;
import com.healthcare.doctorservice.repo.PrescriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceImplTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @InjectMocks
    private PrescriptionServiceImpl service;

    private Prescription makePrescription(Long appointmentId) {
        Prescription p = new Prescription();
        p.setAppointmentId(appointmentId);
        p.setPatientId(10L);
        p.setDoctorId(20L);
        p.setDiagnosis("Test diagnosis");
        return p;
    }

    // ── Issue #13: Duplicate prescription per appointment must be rejected ──

    @Test
    void createPrescription_shouldThrowWhenPrescriptionAlreadyExistsForAppointment() {
        Prescription incoming = makePrescription(1L);
        when(prescriptionRepository.findByAppointmentId(1L))
                .thenReturn(Optional.of(new Prescription()));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.createPrescription(incoming));
        assertTrue(ex.getMessage().toLowerCase().contains("already exists"),
                "Expected 'already exists' in message, got: " + ex.getMessage());
        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    void createPrescription_shouldSaveWhenNoPrescriptionExistsForAppointment() {
        Prescription incoming = makePrescription(2L);
        when(prescriptionRepository.findByAppointmentId(2L)).thenReturn(Optional.empty());
        when(prescriptionRepository.save(incoming)).thenReturn(incoming);

        Prescription result = service.createPrescription(incoming);

        assertNotNull(result);
        verify(prescriptionRepository).save(incoming);
    }

    // ── Fetching by patient ID delegates to repository ──

    @Test
    void getPrescriptionsByPatientId_shouldReturnRepositoryResult() {
        Prescription p = makePrescription(3L);
        when(prescriptionRepository.findByPatientIdOrderByIssuedDateDesc(10L))
                .thenReturn(List.of(p));

        List<Prescription> result = service.getPrescriptionsByPatientId(10L);

        assertEquals(1, result.size());
        verify(prescriptionRepository).findByPatientIdOrderByIssuedDateDesc(10L);
    }

    // ── getPrescriptionByAppointmentId returns null when absent (not throwing) ──

    @Test
    void getPrescriptionByAppointmentId_shouldReturnNullWhenNotFound() {
        when(prescriptionRepository.findByAppointmentId(99L)).thenReturn(Optional.empty());

        Prescription result = service.getPrescriptionByAppointmentId(99L);

        assertNull(result);
    }
}
