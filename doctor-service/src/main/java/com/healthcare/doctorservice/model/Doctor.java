package com.healthcare.doctorservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.BinaryJdbcType;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String specialization;

    private String phone;

    private String availability;

    private String hospital;

    @Column(name = "consultation_modes")
    private String consultationModes;

    @Column(nullable = false)
    private boolean verified = false;

    private LocalDateTime verifiedAt;

    @Column(name = "profile_pic_url")
    private String profilePicUrl;

    @JdbcType(BinaryJdbcType.class)
    @Column(name = "profile_image_data")
    private byte[] profileImageData;

    @Column(name = "profile_image_content_type")
    private String profileImageContentType;

    public Doctor() {
    }

    public Doctor(Long id, String name, String email, String specialization, String phone, String availability) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.specialization = specialization;
        this.phone = phone;
        this.availability = availability;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getProfilePicUrl() {
        return profilePicUrl;
    }

    public void setProfilePicUrl(String profilePicUrl) {
        this.profilePicUrl = profilePicUrl;
    }

    public byte[] getProfileImageData() { return profileImageData; }
    public void setProfileImageData(byte[] profileImageData) { this.profileImageData = profileImageData; }

    public String getProfileImageContentType() { return profileImageContentType; }
    public void setProfileImageContentType(String profileImageContentType) { this.profileImageContentType = profileImageContentType; }
}
