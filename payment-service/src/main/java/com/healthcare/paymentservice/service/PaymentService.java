package com.healthcare.paymentservice.service;

import com.healthcare.paymentservice.dto.PaymentRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Long id);

    List<PaymentResponse> getPaymentsByUser(Long userId);

    List<PaymentResponse> getAllPayments();

    PaymentResponse updatePaymentStatus(Long id, String status);

    void handlePayHereNotification(java.util.Map<String, String> payload);

    java.util.Map<String, Object> getPaymentStats();
}
