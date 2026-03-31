package com.healthcare.paymentservice.service;

import com.healthcare.paymentservice.dto.PaymentRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.exception.ResourceNotFoundException;
import com.healthcare.paymentservice.model.Payment;
import com.healthcare.paymentservice.model.PaymentMethod;
import com.healthcare.paymentservice.model.PaymentStatus;
import com.healthcare.paymentservice.repo.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${stripe.currency}")
    private String currency;

    @Value("${stripe.publishable.key}")
    private String publishableKey;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setAppointmentId(request.getAppointmentId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null && !request.getPaymentMethod().isEmpty()
                ? PaymentMethod.valueOf(request.getPaymentMethod())
                : PaymentMethod.CARD);
        payment.setStatus(PaymentStatus.PENDING);
        Payment saved = paymentRepository.save(payment);

        // Create Stripe PaymentIntent (amount must be in smallest currency unit = cents)
        long amountInCents = request.getAmount().multiply(new java.math.BigDecimal("100")).longValue();
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency)
                    .setDescription("Healthcare appointment #" + request.getAppointmentId())
                    .putMetadata("paymentId", String.valueOf(saved.getId()))
                    .putMetadata("appointmentId", String.valueOf(request.getAppointmentId()))
                    .addPaymentMethodType("card")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            saved.setStripePaymentIntentId(intent.getId());
            saved = paymentRepository.save(saved);
            return mapToResponse(saved, intent.getClientSecret());
        } catch (StripeException e) {
            saved.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(saved);
            throw new RuntimeException("Stripe payment creation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return mapToResponse(payment, null);
    }

    @Override
    public List<PaymentResponse> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId)
                .stream().map(p -> mapToResponse(p, null)).collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream().map(p -> mapToResponse(p, null)).collect(Collectors.toList());
    }

    @Override
    public PaymentResponse updatePaymentStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        payment.setStatus(PaymentStatus.valueOf(status));
        return mapToResponse(paymentRepository.save(payment), null);
    }

    @Override
    public void handlePayHereNotification(Map<String, String> payload) {
        // Stripe uses webhooks — this method is kept for interface compatibility
        // For Stripe webhook handling, integrate a /webhook endpoint separately
        String intentId = payload.get("stripe_payment_intent_id");
        String status = payload.get("status");
        if (intentId == null || status == null) return;

        paymentRepository.findByStripePaymentIntentId(intentId).ifPresent(payment -> {
            payment.setStatus("succeeded".equals(status) ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
            paymentRepository.save(payment);
        });
    }

    private PaymentResponse mapToResponse(Payment payment, String clientSecret) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getId());
        response.setAppointmentId(payment.getAppointmentId());
        response.setUserId(payment.getUserId());
        response.setAmount(payment.getAmount());
        if (payment.getPaymentMethod() != null) {
            response.setPaymentMethod(payment.getPaymentMethod().name());
        }
        response.setStatus(payment.getStatus().name());
        response.setPaymentDate(payment.getPaymentDate());
        // Stripe-specific fields
        response.setStripeClientSecret(clientSecret);
        response.setStripePublishableKey(publishableKey);
        return response;
    }
}

