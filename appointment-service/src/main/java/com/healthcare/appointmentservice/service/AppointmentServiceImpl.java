package com.healthcare.appointmentservice.service;

import com.healthcare.appointmentservice.dto.AppointmentRequest;
import com.healthcare.appointmentservice.dto.AppointmentResponse;
import com.healthcare.appointmentservice.dto.DoctorContactResponse;
import com.healthcare.appointmentservice.dto.UserContactResponse;
import com.healthcare.appointmentservice.model.Appointment;
import com.healthcare.appointmentservice.model.AppointmentStatus;
import com.healthcare.appointmentservice.repo.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationIntegrationService notificationIntegrationService;

    @Value("${user.service.base-url:http://localhost:8081}")
    private String userServiceBaseUrl;

    @Value("${doctor.service.base-url:http://localhost:8082}")
    private String doctorServiceBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private final java.util.List<AppointmentStatus> BUSY_STATUSES = java.util.Arrays.asList(
            AppointmentStatus.PENDING_PAYMENT,
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED
    );

    // Issue #9: Enforce valid status transitions — prevents PENDING → COMPLETED etc.
    private static final Map<AppointmentStatus, Set<AppointmentStatus>> VALID_TRANSITIONS;
    static {
        VALID_TRANSITIONS = new EnumMap<>(AppointmentStatus.class);
        VALID_TRANSITIONS.put(AppointmentStatus.PENDING_PAYMENT,
                Set.of(AppointmentStatus.PENDING, AppointmentStatus.CANCELLED));
        VALID_TRANSITIONS.put(AppointmentStatus.PENDING,
                Set.of(AppointmentStatus.CONFIRMED, AppointmentStatus.ACCEPTED,
                       AppointmentStatus.REJECTED, AppointmentStatus.CANCELLED));
        VALID_TRANSITIONS.put(AppointmentStatus.ACCEPTED,
                Set.of(AppointmentStatus.CONFIRMED, AppointmentStatus.REJECTED,
                       AppointmentStatus.CANCELLED));
        VALID_TRANSITIONS.put(AppointmentStatus.CONFIRMED,
                Set.of(AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED));
        VALID_TRANSITIONS.put(AppointmentStatus.COMPLETED, Set.of());
        VALID_TRANSITIONS.put(AppointmentStatus.REJECTED,  Set.of());
        VALID_TRANSITIONS.put(AppointmentStatus.CANCELLED, Set.of());
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        LocalDate apptDate = request.getAppointmentDate();
        LocalTime apptTime = request.getAppointmentTime();

        validateDateTime(apptDate, apptTime);

        boolean isBusy = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                request.getDoctorId(), apptDate, apptTime, BUSY_STATUSES
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

    private void validateDateTime(LocalDate date, LocalTime time) {
        if (date == null || time == null) return;
        if (date.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book or reschedule to a past date.");
        }
        if (date.isEqual(LocalDate.now()) && time.isBefore(LocalTime.now())) {
            throw new RuntimeException("Cannot book or reschedule to a past time today.");
        }
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
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

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed appointment.");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot modify a cancelled appointment.");
        }
        if (appointment.getStatus() == AppointmentStatus.REJECTED) {
            throw new RuntimeException("Cannot modify a rejected appointment.");
        }

        LocalDate newDate = request.getAppointmentDate() != null ? request.getAppointmentDate() : appointment.getAppointmentDate();
        LocalTime newTime = request.getAppointmentTime() != null ? request.getAppointmentTime() : appointment.getAppointmentTime();

        if (request.getAppointmentDate() != null || request.getAppointmentTime() != null) {
            validateDateTime(newDate, newTime);
            
            // Check if rescheduled slot is busy (excluding the current appointment itself)
            boolean isBusy = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                    appointment.getDoctorId(), newDate, newTime, BUSY_STATUSES
            );
            if (isBusy && (!newDate.equals(appointment.getAppointmentDate()) || !newTime.equals(appointment.getAppointmentTime()))) {
                throw new RuntimeException("The rescheduled time slot is already taken.");
            }
            
            appointment.setAppointmentDate(newDate);
            appointment.setAppointmentTime(newTime);
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
    public AppointmentResponse rescheduleAppointment(Long id, LocalDate newDate, LocalTime newTime) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Only pending or confirmed appointments can be rescheduled.");
        }

        validateDateTime(newDate, newTime);

        boolean isBusy = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                appointment.getDoctorId(), newDate, newTime, BUSY_STATUSES
        );
        
        if (isBusy) {
            throw new RuntimeException("Selected time slot is not available");
        }

        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        Appointment updated = appointmentRepository.save(appointment);
        
        notificationIntegrationService.notifyAppointmentRescheduled(updated);
        
        return mapToResponse(updated);
    }
    
    @Override
    public boolean checkAvailability(Long doctorId, LocalDate date, LocalTime time) {
        validateDateTime(date, time);
        return !appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                doctorId, date, time, BUSY_STATUSES
        );
    }

    @Override
    public AppointmentResponse updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        AppointmentStatus newStatus = AppointmentStatus.valueOf(status);
        AppointmentStatus currentStatus = appointment.getStatus();

        if (currentStatus == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of a cancelled appointment.");
        }
        if (currentStatus == AppointmentStatus.COMPLETED && newStatus != AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot change status of a completed appointment.");
        }

        Set<AppointmentStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException(
                    "Invalid appointment status transition from " + currentStatus + " to " + newStatus);
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
        appointment.setStatus(AppointmentStatus.CONFIRMED);
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
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LocalTime> getBookedSlots(Long doctorId, LocalDate date) {
        return appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(doctorId, date, BUSY_STATUSES)
                .stream()
                .map(Appointment::getAppointmentTime)
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

        DoctorContactResponse doctor = fetchDoctor(appointment.getDoctorId());
        if (doctor != null) {
            response.setDoctorName(doctor.getName());
            response.setDoctorSpecialization(doctor.getSpecialization());
            response.setDoctorHospital(doctor.getHospital());
        }

        UserContactResponse patient = fetchUser(appointment.getPatientId());
        if (patient != null) {
            response.setPatientName(patient.getName());
        }

        return response;
    }

    private final Map<Long, DoctorContactResponse> doctorCache = new ConcurrentHashMap<>();
    private final Map<Long, UserContactResponse> userCache = new ConcurrentHashMap<>();
    private static final DoctorContactResponse DOCTOR_MISSING = new DoctorContactResponse();
    private static final UserContactResponse USER_MISSING = new UserContactResponse();

    private DoctorContactResponse fetchDoctor(Long doctorId) {
        if (doctorId == null) return null;
        DoctorContactResponse cached = doctorCache.computeIfAbsent(doctorId, id -> {
            try {
                DoctorContactResponse d = restTemplate.getForObject(
                        doctorServiceBaseUrl + "/doctors/" + id, DoctorContactResponse.class);
                return d != null ? d : DOCTOR_MISSING;
            } catch (Exception ignored) {
                return DOCTOR_MISSING;
            }
        });
        return cached == DOCTOR_MISSING ? null : cached;
    }

    private UserContactResponse fetchUser(Long userId) {
        if (userId == null) return null;
        UserContactResponse cached = userCache.computeIfAbsent(userId, id -> {
            try {
                UserContactResponse u = restTemplate.getForObject(
                        userServiceBaseUrl + "/users/" + id, UserContactResponse.class);
                return u != null ? u : USER_MISSING;
            } catch (Exception ignored) {
                return USER_MISSING;
            }
        });
        return cached == USER_MISSING ? null : cached;
    }

    private String resolveAppointmentType(String appointmentType) {
        if (appointmentType == null || appointmentType.isBlank()) {
            return "PHYSICAL";
        }
        return appointmentType;
    }
}
