package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.model.Prescription;
import java.util.List;

public interface PrescriptionService {
    Prescription createPrescription(Prescription prescription);
    List<Prescription> getPrescriptionsByPatientId(Long patientId);
    List<Prescription> getPrescriptionsByDoctorId(Long doctorId);
    Prescription getPrescriptionByAppointmentId(Long appointmentId);
}
