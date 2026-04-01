package com.healthcare.symptomcheckerservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    private final WebClient webClient;
    private final String apiKey;
    private final String apiUrl;
    private final ObjectMapper objectMapper;

    public GeminiAiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.url}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, String> analyzeSymptoms(String symptoms) {
        String prompt = buildPrompt(symptoms);

        try {
            // Build Gemini API request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", List.of(part));
            requestBody.put("contents", List.of(content));

            String responseJson = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseGeminiResponse(responseJson);

        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
            return getFallbackResponse(symptoms);
        }
    }

    private String buildPrompt(String symptoms) {
        return """
                You are a healthcare AI assistant for a telemedicine platform.
                A patient has reported the following symptoms: %s
                
                Please analyze these symptoms and provide your response in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
                {
                    "suggestion": "A brief health suggestion and preliminary assessment (2-3 sentences)",
                    "recommendedSpecialty": "The most appropriate doctor specialty to consult (e.g., General Physician, Cardiologist, Dermatologist, Neurologist, Orthopedic, ENT Specialist, Gastroenterologist, Pulmonologist, Psychiatrist, Ophthalmologist)",
                    "severity": "LOW or MEDIUM or HIGH"
                }
                
                Important guidelines:
                - This is for preliminary guidance only, always recommend consulting a doctor
                - Be concise but informative in your suggestion
                - Choose severity based on: LOW (minor/manageable), MEDIUM (needs attention), HIGH (urgent/seek immediate care)
                - Respond with ONLY the JSON object, no additional text
                """.formatted(symptoms);
    }

    private Map<String, String> parseGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                String aiText = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();

                // Clean up the response - remove markdown code blocks if present
                aiText = aiText.trim();
                if (aiText.startsWith("```json")) {
                    aiText = aiText.substring(7);
                }
                if (aiText.startsWith("```")) {
                    aiText = aiText.substring(3);
                }
                if (aiText.endsWith("```")) {
                    aiText = aiText.substring(0, aiText.length() - 3);
                }
                aiText = aiText.trim();

                JsonNode aiJson = objectMapper.readTree(aiText);

                Map<String, String> result = new HashMap<>();
                result.put("suggestion", aiJson.path("suggestion").asText("Please consult a healthcare professional."));
                result.put("recommendedSpecialty", aiJson.path("recommendedSpecialty").asText("General Physician"));
                result.put("severity", aiJson.path("severity").asText("MEDIUM"));
                return result;
            }
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
        }

        return getFallbackResponse("");
    }

    private Map<String, String> getFallbackResponse(String symptoms) {
        Map<String, String> fallback = new HashMap<>();
        fallback.put("suggestion",
                "Based on your symptoms, we recommend consulting a healthcare professional for a proper diagnosis. " +
                "Please book an appointment with a doctor at your earliest convenience.");
        fallback.put("recommendedSpecialty", "General Physician");
        fallback.put("severity", "MEDIUM");
        return fallback;
    }
}
