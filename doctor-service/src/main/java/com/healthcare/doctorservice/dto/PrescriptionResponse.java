package com.healthcare.doctorservice.dto;

import java.time.LocalDateTime;

public class PrescriptionResponse {

    private Long id;
    private Long doctorId;
    private Long patientId;
    private Long appointmentId;
    private String medication;
    private String dosage;
    private String instructions;
    private String frequency;
    private String duration;
    private String notes;
    private String prescriptionPdfUrl;
    private LocalDateTime issuedDate;

    public PrescriptionResponse() {
    }

    public PrescriptionResponse(Long id, Long doctorId, Long patientId, Long appointmentId,
            String medication, String dosage, String instructions, LocalDateTime issuedDate) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.appointmentId = appointmentId;
        this.medication = medication;
        this.dosage = dosage;
        this.instructions = instructions;
        this.issuedDate = issuedDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getMedication() {
        return medication;
    }

    public void setMedication(String medication) {
        this.medication = medication;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public LocalDateTime getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDateTime issuedDate) {
        this.issuedDate = issuedDate;
    }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPrescriptionPdfUrl() { return prescriptionPdfUrl; }
    public void setPrescriptionPdfUrl(String prescriptionPdfUrl) { this.prescriptionPdfUrl = prescriptionPdfUrl; }
}
