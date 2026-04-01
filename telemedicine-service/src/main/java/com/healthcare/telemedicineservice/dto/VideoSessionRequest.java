package com.healthcare.telemedicineservice.dto;

public class VideoSessionRequest {

    private Long appointmentId;
    private Long doctorId;
    private Long patientId;

    public VideoSessionRequest() {
    }

    public VideoSessionRequest(Long appointmentId, Long doctorId, Long patientId) {
        this.appointmentId = appointmentId;
        this.doctorId = doctorId;
        this.patientId = patientId;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }
}
