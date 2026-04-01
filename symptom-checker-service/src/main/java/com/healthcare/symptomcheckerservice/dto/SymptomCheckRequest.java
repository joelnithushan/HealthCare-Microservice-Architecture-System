package com.healthcare.symptomcheckerservice.dto;

public class SymptomCheckRequest {

    private Long userId;
    private String symptoms;

    public SymptomCheckRequest() {
    }

    public SymptomCheckRequest(Long userId, String symptoms) {
        this.userId = userId;
        this.symptoms = symptoms;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}
