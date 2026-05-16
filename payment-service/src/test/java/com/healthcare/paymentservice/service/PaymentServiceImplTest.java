package com.healthcare.paymentservice.service;

import com.healthcare.paymentservice.dto.PaymentRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.exception.ResourceNotFoundException;
import com.healthcare.paymentservice.model.Payment;
import com.healthcare.paymentservice.model.PaymentMethod;
import com.healthcare.paymentservice.model.PaymentStatus;
import com.healthcare.paymentservice.repo.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentServiceImpl service;

    @BeforeEach
    void setUp() {
        // Use placeholder keys so Stripe SDK is never called
        ReflectionTestUtils.setField(service, "publishableKey", "pk_test_placeholder");
        ReflectionTestUtils.setField(service, "currency", "usd");
    }

    private Payment savedPayment(Long id, PaymentStatus status) {
        Payment p = new Payment();
        p.setId(id);
        p.setAppointmentId(100L);
        p.setUserId(1L);
        p.setAmount(BigDecimal.valueOf(2500));
        p.setPaymentMethod(PaymentMethod.CARD);
        p.setStatus(status);
        p.setPaymentDate(LocalDateTime.now());
        return p;
    }

    // ── Mock mode: payment auto-succeeds without hitting Stripe ──

    @Test
    void createPayment_shouldAutoSucceedInMockMode() {
        PaymentRequest req = new PaymentRequest();
        req.setAppointmentId(100L);
        req.setUserId(1L);
        req.setAmount(BigDecimal.valueOf(2500));
        req.setPaymentMethod("CARD");

        Payment initial = savedPayment(1L, PaymentStatus.PENDING);
        Payment succeeded = savedPayment(1L, PaymentStatus.SUCCESS);

        when(paymentRepository.save(any()))
                .thenReturn(initial)    // first save (PENDING)
                .thenReturn(succeeded); // second save (SUCCESS auto)

        PaymentResponse result = service.createPayment(req);

        assertEquals("SUCCESS", result.getStatus());
        assertEquals("mock_client_secret", result.getStripeClientSecret());
    }

    // ── Issue #15: getPaymentById must throw on missing id, not NPE ──

    @Test
    void getPaymentById_shouldThrowResourceNotFoundForUnknownId() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getPaymentById(999L));
    }

    // ── Issue #15: updatePaymentStatus must throw on missing id ──

    @Test
    void updatePaymentStatus_shouldThrowForUnknownPaymentId() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.updatePaymentStatus(999L, "SUCCESS"));
    }

    // ── Revenue stat only counts SUCCESS payments ──

    @Test
    void getPaymentStats_shouldOnlyCountSuccessfulPaymentsInRevenue() {
        Payment success = savedPayment(1L, PaymentStatus.SUCCESS);
        Payment failed  = savedPayment(2L, PaymentStatus.FAILED);
        Payment pending = savedPayment(3L, PaymentStatus.PENDING);

        when(paymentRepository.findAll()).thenReturn(List.of(success, failed, pending));

        Map<String, Object> stats = service.getPaymentStats();

        assertEquals(3L, stats.get("totalPayments"));
        assertEquals(BigDecimal.valueOf(2500), stats.get("totalRevenue"));
        assertEquals(1L, stats.get("pendingPayments"));
        assertEquals(1L, stats.get("failedPayments"));
    }

    // ── updatePaymentStatus skips Stripe for mock payments ──

    @Test
    void updatePaymentStatus_shouldUpdateToFailedWithoutStripeForMockPayment() {
        Payment p = savedPayment(1L, PaymentStatus.PENDING);
        p.setStripePaymentIntentId(null); // no Stripe intent = mock

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(p));
        when(paymentRepository.save(any())).thenReturn(p);

        PaymentResponse result = service.updatePaymentStatus(1L, "FAILED");

        assertEquals("FAILED", result.getStatus());
        verify(paymentRepository).save(p);
    }
}
