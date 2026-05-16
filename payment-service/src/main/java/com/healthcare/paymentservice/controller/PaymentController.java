package com.healthcare.paymentservice.controller;

import com.healthcare.paymentservice.dto.PaymentRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Value("${payhere.merchant.id:1235381}")
    private String merchantId;

    @Value("${payhere.merchant.secret:}")
    private String merchantSecret;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        PaymentResponse created = paymentService.createPayment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    @PostMapping(value = "/notify", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> handlePayHereNotification(@RequestParam Map<String, String> payload) {
        // Verify PayHere HMAC signature before trusting the notification
        String incomingSig = payload.get("md5sig");
        if (incomingSig == null || !verifyPayHereSignature(payload, incomingSig)) {
            log.warn("PayHere notification rejected: invalid or missing md5sig");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        paymentService.handlePayHereNotification(payload);
        return ResponseEntity.ok().build();
    }

    private boolean verifyPayHereSignature(Map<String, String> payload, String incomingSig) {
        try {
            String orderId      = payload.getOrDefault("order_id", "");
            String amount       = payload.getOrDefault("payhere_amount", "");
            String currency     = payload.getOrDefault("payhere_currency", "");
            String effectiveSecret = merchantSecret != null ? merchantSecret.trim() : "";
            String secretHash = md5(effectiveSecret).toUpperCase();
            String raw = merchantId.trim() + orderId + amount + currency + secretHash;
            String expected = md5(raw).toUpperCase();
            return expected.equals(incomingSig.toUpperCase());
        } catch (Exception e) {
            log.error("Error during PayHere signature verification", e);
            return false;
        }
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5 hashing failed", e);
        }
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {
        return ResponseEntity.ok(paymentService.getPaymentStats());
    }
}
