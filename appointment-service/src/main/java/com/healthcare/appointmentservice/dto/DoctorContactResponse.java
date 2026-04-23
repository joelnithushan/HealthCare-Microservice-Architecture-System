package com.healthcare.appointmentservice.dto;

public class DoctorContactResponse {

    private Long id;
    private String name;
    private String email;
    private String specialization;
    private String hospital;
    private String phone;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
