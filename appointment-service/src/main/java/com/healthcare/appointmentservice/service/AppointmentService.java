package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.AppointmentRequest;
import com.healthcare.appointmentservice.dto.AppointmentResponse;

import java.util.List;

public interface AppointmentService {

    AppointmentResponse createAppointment(AppointmentRequest request);

    List<AppointmentResponse> getAllAppointments();

    AppointmentResponse getAppointmentById(Long id);

    AppointmentResponse updateAppointment(Long id, AppointmentRequest request);

    AppointmentResponse updateAppointmentStatus(Long id, String status);

    List<AppointmentResponse> getAppointmentsByPatientId(Long patientId);

    List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId);

    void cancelAppointment(Long id);
}
