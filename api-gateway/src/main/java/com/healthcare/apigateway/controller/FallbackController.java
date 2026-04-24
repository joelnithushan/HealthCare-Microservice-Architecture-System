package com.healthcare.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Fallback controller for Resilience4j Circuit Breaker.
 * When a downstream microservice is unavailable or the circuit is open,
 * the gateway routes to these fallback endpoints instead of returning a raw error.
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/{serviceName}")
    public ResponseEntity<Map<String, Object>> serviceFallback(@PathVariable String serviceName) {
        String friendlyName = formatServiceName(serviceName);

        Map<String, Object> response = Map.of(
                "status", "SERVICE_UNAVAILABLE",
                "service", friendlyName,
                "message", friendlyName + " is currently unavailable. Please try again shortly.",
                "timestamp", LocalDateTime.now().toString()
        );

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    private String formatServiceName(String raw) {
        // "user-service" → "User Service"
        if (raw == null || raw.isBlank()) return "Unknown Service";
        String[] parts = raw.split("-");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            sb.append(Character.toUpperCase(part.charAt(0)))
              .append(part.substring(1))
              .append(" ");
        }
        return sb.toString().trim();
    }
}
