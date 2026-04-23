package com.healthcare.userservice.dto;

import com.healthcare.userservice.model.Role;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;

    // Sri Lankan profile fields
    private String mobileNumber;
    private String nic;
    private String gender;
    private String dob;
    private String slmcNumber;
    private String specialization;
    private String hospitalAttached;
    private String profilePicUrl;
    private String district;
    private String availability;

    // Computed flag: true if ALL required fields for the role are filled
    private boolean profileComplete;
    private Integer age;
    private Boolean suspended;
    private String suspensionReason;
    private Boolean approved;
    private Boolean isSsoUser;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

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

    public boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }

    public String getProfilePicUrl() { return profilePicUrl; }
    public void setProfilePicUrl(String profilePicUrl) { this.profilePicUrl = profilePicUrl; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Boolean getSuspended() { return suspended; }
    public void setSuspended(Boolean suspended) { this.suspended = suspended; }

    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }

    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }

    public Boolean getIsSsoUser() { return isSsoUser; }
    public void setIsSsoUser(Boolean isSsoUser) { this.isSsoUser = isSsoUser; }
}
