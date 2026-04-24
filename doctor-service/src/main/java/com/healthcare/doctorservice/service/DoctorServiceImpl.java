package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.DoctorRequest;
import com.healthcare.doctorservice.dto.DoctorResponse;
import com.healthcare.doctorservice.model.Doctor;
import com.healthcare.doctorservice.repo.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;



    @jakarta.annotation.PostConstruct
    public void seedDoctorProfiles() {
        String[][] doctorData = {
            {"Dr. Anura Perera", "anura@mediconnect.com", "Cardiologist", "0771234561", "Mon, Wed, Fri (9 AM - 12 PM)", "Asiri Central Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Nilmini Gunawardena", "nilmini@mediconnect.com", "Pediatrician", "0771234562", "Tue, Thu (2 PM - 5 PM)", "Nawaloka Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Rohan De Silva", "rohan@mediconnect.com", "Neurologist", "0771234563", "Mon, Sat (10 AM - 1 PM)", "Lanka Hospitals", "PHYSICAL"},
            {"Dr. Priyantha Rathnayake", "priyantha@mediconnect.com", "Dermatologist", "0771234564", "Wed, Fri (4 PM - 7 PM)", "Durdans Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Kumara Silva", "kumara@mediconnect.com", "Orthopedic Surgeon", "0771234565", "Tue, Fri (8 AM - 11 AM)", "Asiri Central Hospital", "PHYSICAL"},
            {"Dr. Sunil Fernando", "sunil@mediconnect.com", "ENT Surgeon", "0771234566", "Mon, Wed (3 PM - 6 PM)", "Nawaloka Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Mahen Samarasinghe", "mahen@mediconnect.com", "Psychiatrist", "0771234567", "Sun (9 AM - 2 PM)", "Lanka Hospitals", "VIDEO"},
            {"Dr. Lalith Abeysekara", "lalith@mediconnect.com", "General Practitioner", "0771234568", "Daily (6 PM - 9 PM)", "Durdans Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Chamilka Fernando", "chamilka@mediconnect.com", "Ophthalmologist", "0771234569", "Mon, Thu (9 AM - 12 PM)", "Asiri Central Hospital", "PHYSICAL"},
            {"Dr. Nirosha Perera", "nirosha@mediconnect.com", "Obstetrician & Gynecologist", "0771234570", "Tue, Sat (10 AM - 4 PM)", "Nawaloka Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Harsha Wickramasinghe", "harsha@mediconnect.com", "Oncologist", "0771234571", "Wed, Fri (8 AM - 1 PM)", "Maharagama Cancer Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Asanga Peiris", "asanga@mediconnect.com", "Urologist", "0771234572", "Mon, Thu (3 PM - 7 PM)", "Kings Hospital", "PHYSICAL"},
            {"Dr. Ruwanthi Senanayake", "ruwanthi@mediconnect.com", "Gastroenterologist", "0771234573", "Tue, Sun (10 AM - 2 PM)", "Lanka Hospitals", "PHYSICAL,VIDEO"},
            {"Dr. Chamara Bandara", "chamara@mediconnect.com", "Endocrinologist", "0771234574", "Mon, Wed, Fri (4 PM - 8 PM)", "Hemas Hospital", "VIDEO"},
            {"Dr. Dilini Jayawardena", "dilini@mediconnect.com", "Pulmonologist", "0771234575", "Tue, Thu (9 AM - 1 PM)", "Asiri Central Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Shantha Kumara", "shantha@mediconnect.com", "Rheumatologist", "0771234576", "Mon, Sat (2 PM - 6 PM)", "Durdans Hospital", "PHYSICAL"},
            {"Dr. Sanjeewa Silva", "sanjeewa@mediconnect.com", "Nephrologist", "0771234577", "Wed, Sat (8 AM - 12 PM)", "Nawaloka Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Kamal Fernando", "kamal@mediconnect.com", "General Surgeon", "0771234578", "Tue, Thu, Sat (5 PM - 9 PM)", "Lanka Hospitals", "PHYSICAL"},
            {"Dr. Malini Dias", "malini@mediconnect.com", "Dental Surgeon", "0771234579", "Mon to Fri (10 AM - 4 PM)", "Kings Hospital", "PHYSICAL"},
            {"Dr. Nalin Perera", "nalin@mediconnect.com", "Physiotherapist", "0771234580", "Daily (7 AM - 11 AM)", "Hemas Hospital", "PHYSICAL,VIDEO"},
            {"Dr. Saman Wijesinghe", "saman@mediconnect.com", "General Physician", "0771234581", "Daily (8 AM - 8 PM)", "MediConnect Central", "PHYSICAL,VIDEO"}
        };

        for (String[] data : doctorData) {
            java.util.Optional<Doctor> existingOpt = doctorRepository.findByEmail(data[1]);
            if (existingOpt.isEmpty()) {
                Doctor doc = new Doctor();
                doc.setName(data[0]);
                doc.setEmail(data[1]);
                doc.setSpecialization(data[2]);
                doc.setPhone(data[3]);
                doc.setAvailability(data[4]);
                doc.setHospital(data[5]);
                doc.setConsultationModes(data[6]);
                doc.setVerified(true);
                doc.setVerifiedAt(java.time.LocalDateTime.now());
                doctorRepository.save(doc);
            } else {
                Doctor existing = existingOpt.get();
                boolean dirty = false;
                if (existing.getHospital() == null || existing.getHospital().isBlank()) {
                    existing.setHospital(data[5]);
                    dirty = true;
                }
                if (existing.getConsultationModes() == null || existing.getConsultationModes().isBlank()) {
                    existing.setConsultationModes(data[6]);
                    dirty = true;
                }
                if (dirty) {
                    doctorRepository.save(existing);
                }
            }
        }

        // Backfill any doctor rows not covered by the seed list (e.g. self-registered)
        for (Doctor d : doctorRepository.findAll()) {
            boolean dirty = false;
            if (d.getHospital() == null || d.getHospital().isBlank()) {
                d.setHospital("MediConnect Central");
                dirty = true;
            }
            if (d.getConsultationModes() == null || d.getConsultationModes().isBlank()) {
                d.setConsultationModes("PHYSICAL,VIDEO");
                dirty = true;
            }
            if (dirty) {
                doctorRepository.save(d);
            }
        }
    }

    @Override
    public DoctorResponse createDoctor(DoctorRequest request) {
        Doctor doctor = new Doctor();
        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setAvailability(request.getAvailability());
        doctor.setHospital(request.getHospital() != null && !request.getHospital().isBlank()
                ? request.getHospital() : "MediConnect Central");
        doctor.setConsultationModes(request.getConsultationModes() != null && !request.getConsultationModes().isBlank()
                ? request.getConsultationModes() : "PHYSICAL,VIDEO");
        doctor.setConsultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : 2500.0);

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
    public DoctorResponse getDoctorByEmail(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Doctor not found with email: " + email));
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
        if (request.getHospital() != null) {
            doctor.setHospital(request.getHospital());
        }
        if (request.getConsultationModes() != null && !request.getConsultationModes().isBlank()) {
            doctor.setConsultationModes(request.getConsultationModes());
        }
        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }

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
        stats.put("pendingVerification", getUnverifiedDoctors().size());
        return stats;
    }

    @Override
    public DoctorResponse uploadProfilePic(Long id, MultipartFile file) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));

        try {
            doctor.setProfileImageData(file.getBytes());
            doctor.setProfileImageContentType(file.getContentType());
            
            // Set an internal URL to fetch the image
            String url = "/api/v1/doctors/" + id + "/profile-image";
            doctor.setProfilePicUrl(url);
            
            Doctor savedDoctor = doctorRepository.save(doctor);
            return mapToResponse(savedDoctor);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read doctor profile picture data", e);
        }
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setName(doctor.getName());
        response.setEmail(doctor.getEmail());
        response.setSpecialization(doctor.getSpecialization());
        response.setPhone(doctor.getPhone());
        response.setAvailability(doctor.getAvailability());
        response.setHospital(doctor.getHospital());
        response.setConsultationModes(doctor.getConsultationModes());
        response.setConsultationFee(doctor.getConsultationFee() != null ? doctor.getConsultationFee() : 2500.0);
        response.setVerified(doctor.isVerified());
        if (doctor.getProfileImageData() != null) {
            response.setProfilePicUrl(doctor.getProfilePicUrl());
        } else {
            response.setProfilePicUrl(null);
        }
        return response;
    }
}
