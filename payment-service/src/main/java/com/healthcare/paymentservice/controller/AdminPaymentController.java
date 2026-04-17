package com.healthcare.paymentservice.controller;

import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/payments")
public class AdminPaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {
        List<PaymentResponse> allPayments = paymentService.getAllPayments();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPayments", allPayments.size());

        double totalRevenue = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        long completedCount = allPayments.stream().filter(p -> "SUCCESS".equals(p.getStatus())).count();
        long pendingCount = allPayments.stream().filter(p -> "PENDING".equals(p.getStatus())).count();
        long failedCount = allPayments.stream().filter(p -> "FAILED".equals(p.getStatus())).count();

        stats.put("completedPayments", completedCount);
        stats.put("pendingPayments", pendingCount);
        stats.put("failedPayments", failedCount);

        return ResponseEntity.ok(stats);
    }
}
