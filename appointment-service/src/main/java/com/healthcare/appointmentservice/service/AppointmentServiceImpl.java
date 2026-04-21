package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.AppointmentRequest;
import com.healthcare.appointmentservice.dto.AppointmentResponse;
import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import com.healthcare.appointmentservice.repo.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationIntegrationService notificationIntegrationService;

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        // 1. Validate Date and Time (Prevent past bookings)
        LocalDate apptDate = request.getAppointmentDate();
        LocalTime apptTime = request.getAppointmentTime();
        
        if (apptDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book appointments in the past.");
        }
        if (apptDate.isEqual(LocalDate.now()) && apptTime.isBefore(LocalTime.now())) {
            throw new RuntimeException("Cannot book appointments for a past time today.");
        }

        // 2. Double-Booking Check (Collision Detection)
        boolean isBusy = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            request.getDoctorId(), apptDate, apptTime, AppointmentStatus.CANCELLED
        );
        if (isBusy) {
            throw new RuntimeException("The doctor is already booked for this specific time slot.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setAppointmentType(resolveAppointmentType(request.getAppointmentType()));
        appointment.setStatus(AppointmentStatus.valueOf(request.getStatus()));
        appointment.setNotes(request.getNotes());

        Appointment saved = appointmentRepository.save(appointment);
        notificationIntegrationService.notifyAppointmentCreated(saved);
        return mapToResponse(saved);
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
        return mapToResponse(appointment);
    }

    @Override
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        // Only PENDING or ACCEPTED appointments can be rescheduled
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed appointment.");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot modify a cancelled appointment.");
        }
        if (appointment.getStatus() == AppointmentStatus.REJECTED) {
            throw new RuntimeException("Cannot modify a rejected appointment.");
        }

        // Validate new date/time
        if (request.getAppointmentDate() != null) {
            LocalDate newDate = request.getAppointmentDate();
            if (newDate.isBefore(LocalDate.now())) {
                throw new RuntimeException("Cannot reschedule to a past date.");
            }
            appointment.setAppointmentDate(request.getAppointmentDate());
        }
        if (request.getAppointmentTime() != null) {
            appointment.setAppointmentTime(request.getAppointmentTime());
        }
        if (request.getAppointmentType() != null && !request.getAppointmentType().isBlank()) {
            appointment.setAppointmentType(resolveAppointmentType(request.getAppointmentType()));
        }
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        Appointment updated = appointmentRepository.save(appointment);
        return mapToResponse(updated);
    }

    @Override
    public AppointmentResponse updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        AppointmentStatus newStatus = AppointmentStatus.valueOf(status);
        AppointmentStatus currentStatus = appointment.getStatus();

        // 3. State Machine Logic (Basic Transition Rules)
        if (currentStatus == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of a cancelled appointment.");
        }
        if (currentStatus == AppointmentStatus.COMPLETED && newStatus != AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot change status of a completed appointment.");
        }

        appointment.setStatus(newStatus);
        Appointment updated = appointmentRepository.save(appointment);
        notificationIntegrationService.notifyStatusChanged(updated, currentStatus);
        return mapToResponse(updated);
    }

    @Override
    public AppointmentResponse acceptAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be accepted.");
        }

        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.ACCEPTED);
        Appointment updated = appointmentRepository.save(appointment);
        notificationIntegrationService.notifyStatusChanged(updated, previousStatus);
        return mapToResponse(updated);
    }

    @Override
    public AppointmentResponse rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be rejected.");
        }

        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.REJECTED);
        Appointment updated = appointmentRepository.save(appointment);
        notificationIntegrationService.notifyStatusChanged(updated, previousStatus);
        return mapToResponse(updated);
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updated = appointmentRepository.save(appointment);
        notificationIntegrationService.notifyAppointmentCancelled(updated);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setPatientId(appointment.getPatientId());
        response.setDoctorId(appointment.getDoctorId());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setAppointmentTime(appointment.getAppointmentTime());
        response.setAppointmentType(appointment.getAppointmentType());
        response.setStatus(appointment.getStatus().name());
        response.setNotes(appointment.getNotes());
        return response;
    }

    private String resolveAppointmentType(String appointmentType) {
        if (appointmentType == null || appointmentType.isBlank()) {
            return "IN_PERSON";
        }
        return appointmentType;
    }
}
