package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.DoctorRequest;
import com.healthcare.doctorservice.dto.DoctorResponse;
import com.healthcare.doctorservice.model.Doctor;
import com.healthcare.doctorservice.repo.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public DoctorResponse createDoctor(DoctorRequest request) {
        Doctor doctor = new Doctor();
        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setAvailability(request.getAvailability());

        Doctor saved = doctorRepository.save(doctor);
        return mapToResponse(saved);
    }

    @Override
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
        return mapToResponse(doctor);
    }

    @Override
    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setAvailability(request.getAvailability());

        Doctor updated = doctorRepository.save(doctor);
        return mapToResponse(updated);
    }

    @Override
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
        doctorRepository.delete(doctor);
    }

    @Override
    public List<DoctorResponse> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorResponse verifyDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
        doctor.setVerified(true);
        doctor.setVerifiedAt(java.time.LocalDateTime.now());
        Doctor updated = doctorRepository.save(doctor);
        return mapToResponse(updated);
    }

    @Override
    public DoctorResponse rejectDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
        doctor.setVerified(false);
        doctor.setVerifiedAt(null);
        Doctor updated = doctorRepository.save(doctor);
        return mapToResponse(updated);
    }

    @Override
    public List<DoctorResponse> getUnverifiedDoctors() {
        return doctorRepository.findByVerified(false)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorResponse> getVerifiedDoctors() {
        return doctorRepository.findByVerified(true)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getDoctorStats() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("verifiedDoctors", doctorRepository.countByVerified(true));
        stats.put("pendingVerification", doctorRepository.countByVerified(false));
        return stats;
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setName(doctor.getName());
        response.setEmail(doctor.getEmail());
        response.setSpecialization(doctor.getSpecialization());
        response.setPhone(doctor.getPhone());
        response.setAvailability(doctor.getAvailability());
        response.setVerified(doctor.isVerified());
        return response;
    }
}
