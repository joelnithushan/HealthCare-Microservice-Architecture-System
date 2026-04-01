package com.healthcare.telemedicineservice.service;

import com.healthcare.telemedicineservice.dto.VideoSessionRequest;
import com.healthcare.telemedicineservice.dto.VideoSessionResponse;
import com.healthcare.telemedicineservice.exception.ResourceNotFoundException;
import com.healthcare.telemedicineservice.model.SessionStatus;
import com.healthcare.telemedicineservice.model.VideoSession;
import com.healthcare.telemedicineservice.repo.VideoSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoSessionServiceImpl implements VideoSessionService {

    @Autowired
    private VideoSessionRepository videoSessionRepository;

    @Value("${jitsi.domain}")
    private String jitsiDomain;

    @Override
    public VideoSessionResponse createSession(VideoSessionRequest request) {
        String roomName = "healthcare-" + UUID.randomUUID().toString().substring(0, 8);
        String sessionUrl = "https://" + jitsiDomain + "/" + roomName;

        VideoSession session = new VideoSession();
        session.setAppointmentId(request.getAppointmentId());
        session.setDoctorId(request.getDoctorId());
        session.setPatientId(request.getPatientId());
        session.setRoomName(roomName);
        session.setSessionUrl(sessionUrl);
        session.setStatus(SessionStatus.SCHEDULED);

        VideoSession saved = videoSessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Override
    public VideoSessionResponse getSessionById(Long id) {
        VideoSession session = videoSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
        return mapToResponse(session);
    }

    @Override
    public VideoSessionResponse getSessionByAppointment(Long appointmentId) {
        VideoSession session = videoSessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found for appointment: " + appointmentId));
        return mapToResponse(session);
    }

    @Override
    public VideoSessionResponse startSession(Long id) {
        VideoSession session = videoSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
        session.setStatus(SessionStatus.ACTIVE);
        session.setStartTime(LocalDateTime.now());
        VideoSession updated = videoSessionRepository.save(session);
        return mapToResponse(updated);
    }

    @Override
    public VideoSessionResponse endSession(Long id) {
        VideoSession session = videoSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());
        VideoSession updated = videoSessionRepository.save(session);
        return mapToResponse(updated);
    }

    @Override
    public List<VideoSessionResponse> getSessionsByDoctor(Long doctorId) {
        return videoSessionRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoSessionResponse> getSessionsByPatient(Long patientId) {
        return videoSessionRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VideoSessionResponse mapToResponse(VideoSession session) {
        VideoSessionResponse response = new VideoSessionResponse();
        response.setId(session.getId());
        response.setAppointmentId(session.getAppointmentId());
        response.setDoctorId(session.getDoctorId());
        response.setPatientId(session.getPatientId());
        response.setRoomName(session.getRoomName());
        response.setSessionUrl(session.getSessionUrl());
        response.setStatus(session.getStatus().name());
        response.setStartTime(session.getStartTime());
        response.setEndTime(session.getEndTime());
        response.setCreatedAt(session.getCreatedAt());
        return response;
    }
}
