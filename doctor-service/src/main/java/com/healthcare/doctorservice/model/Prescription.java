package com.healthcare.doctorservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.BinaryJdbcType;

import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    private Long appointmentId;

    @Column(nullable = false)
    private String medication;

    private String dosage;

    @Column(length = 1000)
    private String instructions;

    private String frequency;

    private String duration;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "prescription_pdf_url", length = 500)
    private String prescriptionPdfUrl;

    @JdbcType(BinaryJdbcType.class)
    @Column(name = "prescription_document_data")
    private byte[] prescriptionDocumentData;

    @Column(name = "prescription_document_type")
    private String prescriptionDocumentType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime issuedDate;

    @PrePersist
    protected void onCreate() {
        this.issuedDate = LocalDateTime.now();
    }

    public Prescription() {
    }

    public Prescription(Long id, Long doctorId, Long patientId, Long appointmentId,
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

    public Prescription(Long id, Long doctorId, Long patientId, Long appointmentId,
            String medication, String dosage, String instructions, String frequency, String duration, String notes, String prescriptionPdfUrl, LocalDateTime issuedDate) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.appointmentId = appointmentId;
        this.medication = medication;
        this.dosage = dosage;
        this.instructions = instructions;
        this.frequency = frequency;
        this.duration = duration;
        this.notes = notes;
        this.prescriptionPdfUrl = prescriptionPdfUrl;
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

    public byte[] getPrescriptionDocumentData() { return prescriptionDocumentData; }
    public void setPrescriptionDocumentData(byte[] prescriptionDocumentData) { this.prescriptionDocumentData = prescriptionDocumentData; }

    public String getPrescriptionDocumentType() { return prescriptionDocumentType; }
    public void setPrescriptionDocumentType(String prescriptionDocumentType) { this.prescriptionDocumentType = prescriptionDocumentType; }
}
