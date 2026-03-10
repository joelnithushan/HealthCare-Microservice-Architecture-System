package com.healthcare.doctorservice.service;

import com.healthcare.doctorservice.dto.DoctorRequest;
import com.healthcare.doctorservice.dto.DoctorResponse;

import java.util.List;

public interface DoctorService {

    DoctorResponse createDoctor(DoctorRequest request);

    List<DoctorResponse> getAllDoctors();

    DoctorResponse getDoctorById(Long id);

    DoctorResponse updateDoctor(Long id, DoctorRequest request);

    void deleteDoctor(Long id);
}
