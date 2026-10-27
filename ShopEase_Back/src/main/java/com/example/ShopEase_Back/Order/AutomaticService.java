package com.example.ShopEase_Back.Order;

import com.example.ShopEase_Back.Payment.PaymentEntity;
import com.example.ShopEase_Back.Payment.PaymentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AutomaticService {

    @Autowired
    private OrdersRepo ordersRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Scheduled(fixedRate = 60000)
    public void automaticService() {

        List<OrderEntity> orders = ordersRepo.findAll();

        for (OrderEntity order : orders) {

            if (order.getOrderDate() == null || order.getStatus() == null) {
                continue;
            }

            long minutes = Duration
                    .between(order.getOrderDate(), LocalDateTime.now())
                    .toMinutes();

            boolean updated = false;

            if ("PLACED".equalsIgnoreCase(order.getStatus()) && minutes >= 5) {
                order.setStatus("CONFIRMED");
                updated = true;

            } else if ("CONFIRMED".equalsIgnoreCase(order.getStatus()) && minutes >= 10) {
                order.setStatus("SHIPPED");
                updated = true;

            } else if ("SHIPPED".equalsIgnoreCase(order.getStatus()) && minutes >= 20) {
                order.setStatus("OUT_FOR_DELIVERY");
                updated = true;

            } else if ("OUT_FOR_DELIVERY".equalsIgnoreCase(order.getStatus()) && minutes >= 30) {

                order.setStatus("DELIVERED");
                updated = true;

                // 🔥 update payment automatically
                PaymentEntity payment =
                        paymentRepo.findByOrderId(order.getId()).orElse(null);

                if (payment != null &&
                        "PENDING".equalsIgnoreCase(payment.getPaymentStatus())) {

                    payment.setPaymentStatus("SUCCESS");
                    payment.setPaidAt(LocalDateTime.now());

                    paymentRepo.save(payment);
                }
            }

            if (updated) {
                ordersRepo.save(order);
            }
        }
    }
}