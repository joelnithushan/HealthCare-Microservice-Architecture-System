package com.healthcare.userservice.dto;

import com.healthcare.userservice.model.Role;

public class UserRequest {

    private String name;
    private String email;
    private Role role;

    // Sri Lankan profile fields
    private String mobileNumber;
    private String nic;
    private String gender;
    private String dob;
    private String district;
    private String slmcNumber;
    private String specialization;
    private String hospitalAttached;

    public UserRequest() {
    }

    public UserRequest(String name, String email, Role role) {
        this.name = name;
        this.email = email;
        this.role = role;
    }

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

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSlmcNumber() { return slmcNumber; }
    public void setSlmcNumber(String slmcNumber) { this.slmcNumber = slmcNumber; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getHospitalAttached() { return hospitalAttached; }
    public void setHospitalAttached(String hospitalAttached) { this.hospitalAttached = hospitalAttached; }

    private String password;
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
