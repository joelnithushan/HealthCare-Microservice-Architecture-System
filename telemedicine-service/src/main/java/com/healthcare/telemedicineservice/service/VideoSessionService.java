package com.healthcare.telemedicineservice.service;

import com.healthcare.telemedicineservice.dto.VideoSessionRequest;
import com.healthcare.telemedicineservice.dto.VideoSessionResponse;

import java.util.List;

public interface VideoSessionService {

    VideoSessionResponse createSession(VideoSessionRequest request);

    VideoSessionResponse getSessionById(Long id);

    VideoSessionResponse getSessionByAppointment(Long appointmentId);

    VideoSessionResponse startSession(Long id);

    VideoSessionResponse endSession(Long id);

    List<VideoSessionResponse> getSessionsByDoctor(Long doctorId);

    List<VideoSessionResponse> getSessionsByPatient(Long patientId);
}
