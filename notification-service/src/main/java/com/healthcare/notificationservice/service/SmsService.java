package com.healthcare.notificationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class SmsService {

    private static final String NOTIFY_LK_URL = "https://app.notify.lk/api/v1/send";

    @Value("${notifylk.user_id:}")
    private String userId;

    @Value("${notifylk.api_key:}")
    private String apiKey;

    @Value("${notifylk.sender_id:NotifyDEMO}")
    private String senderId;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendSms(String to, String messageBody) {
        if (userId == null || userId.isBlank() || apiKey == null || apiKey.isBlank()) {
            System.out.println("[SMS LOG - Notify.lk not configured] To: " + to + " | Message: " + messageBody);
            return true;
        }

        String formattedNumber = formatSriLankanNumber(to);
        if (formattedNumber == null) {
            System.err.println("[SMS] Skipped: unable to format number " + to);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("user_id", userId);
            body.add("api_key", apiKey);
            body.add("sender_id", senderId);
            body.add("to", formattedNumber);
            body.add("message", messageBody);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(NOTIFY_LK_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("[SMS] Sent via Notify.lk to " + formattedNumber);
                return true;
            }
            System.err.println("[SMS] Notify.lk responded: " + response.getStatusCode() + " body=" + response.getBody());
            return false;
        } catch (Exception e) {
            System.err.println("[SMS] Notify.lk send failed to " + formattedNumber + ": " + e.getMessage());
            return false;
        }
    }

    private String formatSriLankanNumber(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return null;
        if (digits.startsWith("94")) return digits;
        if (digits.startsWith("0")) return "94" + digits.substring(1);
        if (digits.length() == 9) return "94" + digits;
        return digits;
    }
}
