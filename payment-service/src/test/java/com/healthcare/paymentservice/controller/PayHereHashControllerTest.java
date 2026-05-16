package com.healthcare.paymentservice.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PayHereHashControllerTest {

    private PayHereHashController controller;

    @BeforeEach
    void setUp() {
        controller = new PayHereHashController();
        ReflectionTestUtils.setField(controller, "merchantId", "1230128");
        ReflectionTestUtils.setField(controller, "merchantSecret", "3qTFwIBRPV");
    }

    // ── Issue #1: PayHere hash must be non-empty and correctly formatted ──

    @Test
    void generateHash_shouldReturnNonEmptyHash() {
        Map<String, String> request = Map.of(
                "order_id", "ORDER001",
                "amount", "1000",
                "currency", "LKR");

        ResponseEntity<Map<String, String>> response = controller.generateHash(request);

        assertNotNull(response.getBody());
        String hash = response.getBody().get("hash");
        assertNotNull(hash);
        assertFalse(hash.isEmpty());
    }

    @Test
    void generateHash_shouldReturnExactly32UppercaseHexCharacters() {
        Map<String, String> request = Map.of(
                "order_id", "ORDER001",
                "amount", "1000",
                "currency", "LKR");

        ResponseEntity<Map<String, String>> response = controller.generateHash(request);

        String hash = response.getBody().get("hash");
        assertEquals(32, hash.length(), "MD5 hex must be exactly 32 characters");
        assertTrue(hash.matches("[0-9A-F]{32}"), "Hash must be uppercase hex");
    }

    @Test
    void generateHash_shouldBeDeterministicForSameInputs() {
        Map<String, String> request = Map.of(
                "order_id", "ORDER001",
                "amount", "2500",
                "currency", "LKR");

        String hash1 = controller.generateHash(request).getBody().get("hash");
        String hash2 = controller.generateHash(request).getBody().get("hash");

        assertEquals(hash1, hash2, "Same inputs must always produce the same hash");
    }

    @Test
    void generateHash_shouldProduceDifferentHashesForDifferentAmounts() {
        Map<String, String> req1 = Map.of("order_id", "ORDER001", "amount", "1000", "currency", "LKR");
        Map<String, String> req2 = Map.of("order_id", "ORDER001", "amount", "2000", "currency", "LKR");

        String hash1 = controller.generateHash(req1).getBody().get("hash");
        String hash2 = controller.generateHash(req2).getBody().get("hash");

        assertNotEquals(hash1, hash2, "Different amounts must produce different hashes");
    }

    @Test
    void generateHash_shouldReturnMerchantIdInResponse() {
        Map<String, String> request = Map.of(
                "order_id", "ORDER001",
                "amount", "1000",
                "currency", "LKR");

        ResponseEntity<Map<String, String>> response = controller.generateHash(request);

        assertEquals("1230128", response.getBody().get("merchant_id"));
    }

    @Test
    void generateHash_shouldFormatAmountToTwoDecimalPlaces() {
        // Amount "1000" should be treated as "1000.00" in hash formula
        Map<String, String> reqInt  = Map.of("order_id", "ORD", "amount", "1000",    "currency", "LKR");
        Map<String, String> reqDec  = Map.of("order_id", "ORD", "amount", "1000.00", "currency", "LKR");

        String hashInt = controller.generateHash(reqInt).getBody().get("hash");
        String hashDec = controller.generateHash(reqDec).getBody().get("hash");

        assertEquals(hashInt, hashDec, "Integer and decimal amounts must hash identically");
    }
}
