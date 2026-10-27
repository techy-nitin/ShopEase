package com.example.ShopEase_Back.Payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepo paymentRepo;

    public PaymentEntity createPayment(PaymentEntity payment) {
        if (payment.getOrderId() == null) {
            throw new RuntimeException("orderId is required");
        }

        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            throw new RuntimeException("Valid amount is required");
        }

        if (payment.getPaymentMethod() == null || payment.getPaymentMethod().trim().isEmpty()) {
            throw new RuntimeException("paymentMethod is required");
        }

        // prevent duplicate payment row for same order
        if (paymentRepo.findByOrderId(payment.getOrderId()).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }

        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(LocalDateTime.now());
        }

        if (payment.getPaymentStatus() == null || payment.getPaymentStatus().isBlank()) {
            payment.setPaymentStatus("PENDING");
        }

        if ("SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepo.save(payment);
    }

    public PaymentEntity getPaymentByOrder(Integer orderId) {
        return paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order id: " + orderId));
    }

    public PaymentEntity updatePaymentStatus(Integer orderId, String status, String transactionId) {
        PaymentEntity payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order id: " + orderId));

        payment.setPaymentStatus(status);

        if (transactionId != null && !transactionId.isBlank()) {
            payment.setTransactionId(transactionId);
        }

        if ("SUCCESS".equalsIgnoreCase(status)) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepo.save(payment);
    }
}