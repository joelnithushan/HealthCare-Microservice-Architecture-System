package com.healthcare.userservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.BinaryJdbcType;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Entity
@Table(name = "users")

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private Long resetTokenExpiry;

    @Column(name = "mobile_number", unique = true)
    private String mobileNumber;

    @Column(name = "nic", unique = true)
    private String nic;

    @Column(name = "gender")
    private String gender;

    @Column(name = "dob")
    private String dob;

    @Column(name = "slmc_number")
    private String slmcNumber;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "hospital_attached")
    private String hospitalAttached;

    @Column(name = "profile_pic_url")
    private String profilePicUrl;

    @JdbcType(BinaryJdbcType.class)
    @Column(name = "profile_image_data")
    private byte[] profileImageData;

    @Column(name = "profile_image_content_type")
    private String profileImageContentType;

    @Column(name = "age")
    private Integer age;

    @Column(name = "suspended")
    private Boolean suspended = false;

    @Column(name = "suspension_reason")
    private String suspensionReason;

    @PrePersist
    @PreUpdate
    public void calculateAge() {
        if (this.dob != null && !this.dob.isEmpty()) {
            try {
                LocalDate birthDate = LocalDate.parse(this.dob, DateTimeFormatter.ISO_LOCAL_DATE);
                this.age = Period.between(birthDate, LocalDate.now()).getYears();
            } catch (DateTimeParseException e) {
                // Invalid DOB format, set age to null or leave as is
                this.age = null;
            }
        }
    }

    public User() {
    }

    public User(Long id, String name, String email, String password, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public Long getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(Long resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getSlmcNumber() { return slmcNumber; }
    public void setSlmcNumber(String slmcNumber) { this.slmcNumber = slmcNumber; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getHospitalAttached() { return hospitalAttached; }
    public void setHospitalAttached(String hospitalAttached) { this.hospitalAttached = hospitalAttached; }

    public String getProfilePicUrl() { return profilePicUrl; }
    public void setProfilePicUrl(String profilePicUrl) { this.profilePicUrl = profilePicUrl; }

    public byte[] getProfileImageData() { return profileImageData; }
    public void setProfileImageData(byte[] profileImageData) { this.profileImageData = profileImageData; }

    public String getProfileImageContentType() { return profileImageContentType; }
    public void setProfileImageContentType(String profileImageContentType) { this.profileImageContentType = profileImageContentType; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Boolean getSuspended() { return suspended; }
    public void setSuspended(Boolean suspended) { this.suspended = suspended; }

    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }
}
