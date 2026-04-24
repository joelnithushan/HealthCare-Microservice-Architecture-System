package com.healthcare.paymentservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.Map;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/payments/payhere")
public class PayHereHashController {

    private static final Logger logger = LoggerFactory.getLogger(PayHereHashController.class);

    @Value("${payhere.merchant.id:1235381}")
    private String merchantId;

    @Value("${payhere.merchant.secret:}")
    private String merchantSecret;

    /**
     * Generates a secure MD5 hash required by PayHere to verify the transaction.
     * This prevents tampering with payment amounts or order IDs.
     */
    @PostMapping("/hash")
    public ResponseEntity<Map<String, String>> generateHash(@RequestBody Map<String, String> request) {
        String orderId = request.get("order_id");
        String amountStr = request.get("amount");
        String currency = request.getOrDefault("currency", "LKR");

        // PayHere requires exactly 2 decimal places (e.g., 3000.00) for the hash to match.
        double amountDouble = Double.parseDouble(amountStr);
        String formattedAmount = String.format(Locale.US, "%.2f", amountDouble);

        // Use secret exactly as provided, trimmed. 
        String effectiveSecret = (merchantSecret != null) ? merchantSecret.trim() : "";

        // MD5 of Secret (Uppercase)
        String secretHash = md5(effectiveSecret).toUpperCase();
        
        // The security signature is built by joining specific fields with an MD5-hashed secret.
        // Formula: MD5(MerchantID + OrderID + Amount + Currency + MD5(Secret).toUpperCase())
        String rawHash = merchantId.trim() + orderId.trim() + formattedAmount + currency.trim() + secretHash;
        String hash = md5(rawHash).toUpperCase();

        System.out.println("--- PAYHERE HASH ATTEMPT ---");
        System.out.println("ID: [" + merchantId + "]");
        System.out.println("Order: [" + orderId + "]");
        System.out.println("Amount: [" + formattedAmount + "]");
        System.out.println("Hash: [" + hash + "]");
        System.out.println("----------------------------");

        return ResponseEntity.ok(Map.of(
                "hash", hash,
                "merchant_id", merchantId
        ));
    }

    private String md5(String input) {
        if (input == null || input.isEmpty()) return "";
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5 hashing failed", e);
        }
    }
}
