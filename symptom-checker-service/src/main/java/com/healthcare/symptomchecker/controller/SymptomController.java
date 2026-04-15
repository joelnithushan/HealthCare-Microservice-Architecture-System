package com.healthcare.symptomchecker.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/v1/symptoms")
public class SymptomController {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SymptomRequest {
        private List<String> symptoms;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SymptomResponse {
        private String riskLevel;
        private String recommendation;
        private List<String> possibleConditions;
        private boolean error;
    }

    // Builder pattern manually to avoid build issues if Lombok config is missing
    public static class SymptomResponseBuilder {
        private String riskLevel;
        private String recommendation;
        private List<String> possibleConditions;
        private boolean error;

        public SymptomResponseBuilder riskLevel(String riskLevel) { this.riskLevel = riskLevel; return this; }
        public SymptomResponseBuilder recommendation(String recommendation) { this.recommendation = recommendation; return this; }
        public SymptomResponseBuilder possibleConditions(List<String> possibleConditions) { this.possibleConditions = possibleConditions; return this; }
        public SymptomResponseBuilder error(boolean error) { this.error = error; return this; }
        public SymptomResponse build() { return new SymptomResponse(riskLevel, recommendation, possibleConditions, error); }
    }

    @PostMapping("/check")
    public ResponseEntity<SymptomResponse> checkSymptoms(@RequestBody SymptomRequest request) {
        List<String> input = request.getSymptoms();
        if (input == null || input.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // --- Mock AI logic ---
        String risk = "Low";
        String recommendation = "Your symptoms appear manageable. Ensure adequate rest and hydration.";
        List<String> conditions = new ArrayList<>();

        boolean matchesHigh = false;
        boolean matchesMed = false;

        for (String s : input) {
            String sym = s.toLowerCase();
            if (sym.contains("chest pain") || sym.contains("breath") || sym.contains("heart") || sym.contains("stroke")) {
                matchesHigh = true;
            } else if (sym.contains("fever") || sym.contains("cough") || sym.contains("pain") || sym.contains("dizzy")) {
                matchesMed = true;
            }
        }

        if (matchesHigh) {
            risk = "High";
            recommendation = "URGENT: Please seek immediate medical attention or visit the nearest emergency room.";
            conditions.add("Potential Cardiac Issue");
            conditions.add("Respiratory Distress");
        } else if (matchesMed) {
            risk = "Medium";
            recommendation = "We recommend scheduling an appointment with a specialist soon to investigate these symptoms further.";
            conditions.add("Common Cold / Flu");
            conditions.add("Viral Infection");
        } else {
            conditions.add("Minor Fatigue");
            conditions.add("General Malaise");
        }

        SymptomResponse res = new SymptomResponseBuilder()
                .riskLevel(risk)
                .recommendation(recommendation)
                .possibleConditions(conditions)
                .error(false)
                .build();

        return ResponseEntity.ok(res);
    }
}
