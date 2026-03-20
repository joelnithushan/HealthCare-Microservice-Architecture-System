package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.DoctorRequest;
import com.healthcare.doctorservice.dto.DoctorResponse;

import java.util.List;
import java.util.Map;

public interface DoctorService {

    DoctorResponse createDoctor(DoctorRequest request);

    List<DoctorResponse> getAllDoctors();

    DoctorResponse getDoctorById(Long id);

    DoctorResponse updateDoctor(Long id, DoctorRequest request);

    void deleteDoctor(Long id);

    List<DoctorResponse> getDoctorsBySpecialization(String specialization);

    DoctorResponse verifyDoctor(Long id);

    DoctorResponse rejectDoctor(Long id);

    List<DoctorResponse> getUnverifiedDoctors();

    List<DoctorResponse> getVerifiedDoctors();

    Map<String, Object> getDoctorStats();
}
