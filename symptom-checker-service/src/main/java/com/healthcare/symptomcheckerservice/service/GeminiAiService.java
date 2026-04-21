package com.healthcare.symptomcheckerservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.healthcare.symptomcheckerservice.dto.SymptomCheckResponse;

import java.util.*;

@Service
public class GeminiAiService {

    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();

    public SymptomCheckResponse analyzeSymptoms(List<String> symptoms) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-gemini-api-key-placeholder")) {
            return buildUnavailableResponse(symptoms);
        }

        try {
            String prompt = "Act as a preliminary medical symptom analyzer. "
                          + "A patient reports these symptoms: " + String.join(", ", symptoms) + ". "
                          + "Provide a JSON response with these keys: "
                          + "'riskLevel' (High, Medium, or Low), "
                          + "'recommendation' (Short medical advice), "
                          + "'possibleConditions' (List of strings). "
                          + "Ensure it is valid JSON and only return the JSON object.";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            contents.put("parts", Collections.singletonList(parts));

            Map<String, Object> body = new HashMap<>();
            body.put("contents", Collections.singletonList(contents));

            String url = GEMINI_API_URL + "?key=" + apiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseGeminiResponse(response.getBody(), symptoms);
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
        }

        return buildUnavailableResponse(symptoms);
    }

    private SymptomCheckResponse parseGeminiResponse(Map responseBody, List<String> originalSymptoms) {
        try {
            List candidates = (List) responseBody.get("candidates");
            Map candidate = (Map) candidates.get(0);
            Map content = (Map) candidate.get("content");
            List parts = (List) content.get("parts");
            Map part = (Map) parts.get(0);
            String text = (String) part.get("text");

            if (text.contains("{")) {
                text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
            }

            SymptomCheckResponse res = new SymptomCheckResponse();
            res.setSeverity(text.contains("High") ? "High" : (text.contains("Medium") ? "Medium" : "Low"));
            res.setAiSuggestion("AI-Generated advice: " + (text.length() > 200 ? text.substring(0, 200) + "..." : text));
            res.setSymptoms(String.join(", ", originalSymptoms));
            return res;

        } catch (Exception e) {
            return buildUnavailableResponse(originalSymptoms);
        }
    }

    private SymptomCheckResponse buildUnavailableResponse(List<String> input) {
        SymptomCheckResponse res = new SymptomCheckResponse();
        res.setSeverity("UNKNOWN");
        res.setAiSuggestion("AI analysis is currently unavailable. Please consult a qualified medical professional for guidance.");
        res.setSymptoms(String.join(", ", input));
        res.setRecommendedSpecialty("General Medicine");
        return res;
    }
}
