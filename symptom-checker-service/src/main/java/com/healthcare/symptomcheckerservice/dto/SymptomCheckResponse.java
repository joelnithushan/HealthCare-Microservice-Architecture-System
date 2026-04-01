package com.healthcare.symptomcheckerservice.dto;

import java.time.LocalDateTime;

public class SymptomCheckResponse {

    private Long id;
    private Long userId;
    private String symptoms;
    private String aiSuggestion;
    private String recommendedSpecialty;
    private String severity;
    private LocalDateTime createdAt;

    public SymptomCheckResponse() {
    }

    public SymptomCheckResponse(Long id, Long userId, String symptoms, String aiSuggestion,
            String recommendedSpecialty, String severity, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.symptoms = symptoms;
        this.aiSuggestion = aiSuggestion;
        this.recommendedSpecialty = recommendedSpecialty;
        this.severity = severity;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getAiSuggestion() {
        return aiSuggestion;
    }

    public void setAiSuggestion(String aiSuggestion) {
        this.aiSuggestion = aiSuggestion;
    }

    public String getRecommendedSpecialty() {
        return recommendedSpecialty;
    }

    public void setRecommendedSpecialty(String recommendedSpecialty) {
        this.recommendedSpecialty = recommendedSpecialty;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
