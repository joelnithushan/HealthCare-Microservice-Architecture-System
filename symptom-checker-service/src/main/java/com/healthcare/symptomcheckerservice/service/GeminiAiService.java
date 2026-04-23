package com.healthcare.symptomcheckerservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.symptomcheckerservice.dto.SymptomCheckResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SymptomCheckResponse analyzeSymptoms(List<String> symptoms) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your-gemini-api-key-placeholder")) {
            return buildUnavailableResponse(symptoms);
        }

        try {
            String prompt = buildPrompt(symptoms);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("HTTP-Referer", "http://localhost:3000"); // Optional but recommended for OpenRouter
            headers.set("X-Title", "Healthcare MS Platform");

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "google/gemma-2-27b-it"); // OpenRouter ID for Gemma 2 27B IT
            body.put("messages", Collections.singletonList(message));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(OPENROUTER_API_URL, HttpMethod.POST, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseOpenRouterResponse(response.getBody(), symptoms);
            }
        } catch (Exception e) {
            System.err.println("OpenRouter API call failed: " + e.getMessage());
        }
        return buildUnavailableResponse(symptoms);
    }

    private String buildPrompt(List<String> symptoms) {
        return "You are a medical triage assistant. A patient reports the following symptoms: "
                + String.join(", ", symptoms) + ".\n"
                + "Return ONLY a compact JSON object with these exact keys:\n"
                + "{\n"
                + "  \"possibleConditions\": [\"...\", \"...\"],\n"
                + "  \"recommendedSpecialty\": \"e.g. Cardiology, General Physician, Dermatology\",\n"
                + "  \"urgency\": \"LOW | MEDIUM | HIGH\",\n"
                + "  \"recommendation\": \"short plain-text advice sentence\"\n"
                + "}\n"
                + "Use HIGH for symptoms suggesting emergency (chest pain, stroke, severe bleeding), "
                + "MEDIUM for concerning but non-urgent symptoms, LOW for minor symptoms. "
                + "Do not include any markdown formatting, backticks, or text outside the JSON object.";
    }

    @SuppressWarnings("rawtypes")
    private SymptomCheckResponse parseOpenRouterResponse(Map responseBody, List<String> originalSymptoms) {
        try {
            List choices = (List) responseBody.get("choices");
            if (choices == null || choices.isEmpty()) return buildUnavailableResponse(originalSymptoms);

            Map choice = (Map) choices.get(0);
            Map message = (Map) choice.get("message");
            String text = (String) message.get("content");
            if (text == null) return buildUnavailableResponse(originalSymptoms);

            int start = text.indexOf("{");
            int end = text.lastIndexOf("}");
            if (start < 0 || end <= start) return buildUnavailableResponse(originalSymptoms);
            String json = text.substring(start, end + 1);

            JsonNode node = objectMapper.readTree(json);

            SymptomCheckResponse res = new SymptomCheckResponse();
            res.setSymptoms(String.join(", ", originalSymptoms));

            List<String> conditions = new ArrayList<>();
            JsonNode pcNode = node.get("possibleConditions");
            if (pcNode != null && pcNode.isArray()) {
                for (JsonNode n : pcNode) conditions.add(n.asText());
            }
            res.setPossibleConditions(conditions);

            String specialty = node.hasNonNull("recommendedSpecialty") ? node.get("recommendedSpecialty").asText() : "General Physician";
            res.setRecommendedSpecialty(specialty);

            String urgency = node.hasNonNull("urgency") ? node.get("urgency").asText().toUpperCase() : "MEDIUM";
            if (!Arrays.asList("LOW", "MEDIUM", "HIGH").contains(urgency)) urgency = "MEDIUM";
            res.setUrgency(urgency);
            res.setSeverity(urgency);

            String recommendation = node.hasNonNull("recommendation") ? node.get("recommendation").asText() : "Please consult a qualified medical professional.";
            res.setRecommendation(recommendation);
            res.setAiSuggestion(recommendation);

            return res;
        } catch (Exception e) {
            System.err.println("Failed to parse response: " + e.getMessage());
            return buildUnavailableResponse(originalSymptoms);
        }
    }

    private SymptomCheckResponse buildUnavailableResponse(List<String> input) {
        SymptomCheckResponse res = new SymptomCheckResponse();
        res.setSymptoms(input != null ? String.join(", ", input) : "");
        res.setPossibleConditions(Collections.emptyList());
        res.setRecommendedSpecialty("General Physician");
        res.setUrgency("MEDIUM");
        res.setSeverity("MEDIUM");
        res.setRecommendation("AI analysis is currently unavailable. Please consult a qualified medical professional.");
        res.setAiSuggestion("AI analysis is currently unavailable. Please consult a qualified medical professional.");
        return res;
    }
}
