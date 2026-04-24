package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.AppointmentRequest;
import com.healthcare.appointmentservice.dto.AppointmentResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {

    AppointmentResponse createAppointment(AppointmentRequest request);

    List<AppointmentResponse> getAllAppointments();

    AppointmentResponse getAppointmentById(Long id);

    AppointmentResponse updateAppointment(Long id, AppointmentRequest request);
    
    AppointmentResponse rescheduleAppointment(Long id, LocalDate newDate, LocalTime newTime);
    
    boolean checkAvailability(Long doctorId, LocalDate date, LocalTime time);

    AppointmentResponse updateAppointmentStatus(Long id, String status);

    AppointmentResponse acceptAppointment(Long id);

    AppointmentResponse rejectAppointment(Long id);

    List<AppointmentResponse> getAppointmentsByPatientId(Long patientId);

    List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId);

    void cancelAppointment(Long id);

    List<LocalTime> getBookedSlots(Long doctorId, LocalDate date);
}
