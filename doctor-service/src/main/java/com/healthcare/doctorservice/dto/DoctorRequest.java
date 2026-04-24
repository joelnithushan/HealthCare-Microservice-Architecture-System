package com.healthcare.doctorservice.dto;

public class DoctorRequest {

    private String name;
    private String email;
    private String specialization;
    private String phone;
    private String availability;
    private String hospital;
    private String consultationModes;
    private Double consultationFee;

    public DoctorRequest() {
    }

    public DoctorRequest(String name, String email, String specialization, String phone, String availability) {
        this.name = name;
        this.email = email;
        this.specialization = specialization;
        this.phone = phone;
        this.availability = availability;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public String getConsultationModes() {
        return consultationModes;
    }

    public void setConsultationModes(String consultationModes) {
        this.consultationModes = consultationModes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }
}
