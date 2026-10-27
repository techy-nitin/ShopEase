package com.example.ShopEase_Back.Payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepo paymentRepo;

    public PaymentEntity createPayment(PaymentEntity payment) {

        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(LocalDateTime.now());
        }

        if (payment.getPaymentStatus() != null &&
                payment.getPaymentStatus().equalsIgnoreCase("PAID")) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepo.save(payment);
    }

    public PaymentEntity getPaymentByOrder(Integer orderId) {
        return paymentRepo.findByOrderId(orderId).orElse(null);
    }
}