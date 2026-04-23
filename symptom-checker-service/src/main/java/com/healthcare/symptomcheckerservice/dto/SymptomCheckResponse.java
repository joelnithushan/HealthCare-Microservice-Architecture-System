package com.healthcare.symptomcheckerservice.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SymptomCheckResponse {

    private Long id;
    private Long userId;
    private String symptoms;
    private List<String> possibleConditions;
    private String recommendedSpecialty;
    private String urgency;
    private String riskLevel;
    private String recommendation;
    private String aiSuggestion;
    private String severity;
    private LocalDateTime createdAt;

    public SymptomCheckResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public List<String> getPossibleConditions() { return possibleConditions; }
    public void setPossibleConditions(List<String> possibleConditions) { this.possibleConditions = possibleConditions; }

    public String getRecommendedSpecialty() { return recommendedSpecialty; }
    public void setRecommendedSpecialty(String recommendedSpecialty) { this.recommendedSpecialty = recommendedSpecialty; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) {
        this.urgency = urgency;
        if (urgency != null) {
            String u = urgency.toUpperCase();
            if ("HIGH".equals(u)) this.riskLevel = "High";
            else if ("MEDIUM".equals(u)) this.riskLevel = "Medium";
            else if ("LOW".equals(u)) this.riskLevel = "Low";
        }
    }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
        if (this.aiSuggestion == null) this.aiSuggestion = recommendation;
    }

    public String getAiSuggestion() { return aiSuggestion; }
    public void setAiSuggestion(String aiSuggestion) { this.aiSuggestion = aiSuggestion; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
