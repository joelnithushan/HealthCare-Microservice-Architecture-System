package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.model.Prescription;
import com.healthcare.doctorservice.repo.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Override
    public Prescription createPrescription(Prescription prescription) {
        if (prescriptionRepository.findByAppointmentId(prescription.getAppointmentId()).isPresent()) {
            throw new RuntimeException("Prescription already exists for this appointment.");
        }
        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByIssuedDateDesc(patientId);
    }

    @Override
    public List<Prescription> getPrescriptionsByDoctorId(Long doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByIssuedDateDesc(doctorId);
    }

    @Override
    public Prescription getPrescriptionByAppointmentId(Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId).orElse(null);
    }
}
