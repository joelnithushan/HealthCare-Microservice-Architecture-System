package com.healthcare.symptomcheckerservice.dto;

import java.util.List;

public class SymptomCheckRequest {

    private Long userId;
    private List<String> symptoms;

    public SymptomCheckRequest() {
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }
}
