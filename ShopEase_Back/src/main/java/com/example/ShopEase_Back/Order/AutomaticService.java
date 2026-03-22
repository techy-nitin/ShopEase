package com.example.ShopEase_Back.Order;

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

    @Scheduled(fixedRate = 60000)
    public void automaticService() {

        List<OrderEntity> orders = ordersRepo.findAll();

        for (OrderEntity order : orders) {
            if (order.getOrderDate() == null || order.getStatus() == null) {
                continue;
            }

            long minutes = Duration.between(order.getOrderDate(), LocalDateTime.now()).toMinutes();


            if ("PLACED".equalsIgnoreCase(order.getStatus()) && minutes >= 5) {
                order.setStatus("CONFIRMED");
            } else if ("CONFIRMED".equalsIgnoreCase(order.getStatus()) && minutes >= 10) {
                order.setStatus("SHIPPED");
            } else if ("SHIPPED".equalsIgnoreCase(order.getStatus()) && minutes >= 20) {
                order.setStatus("OUT_FOR_DELIVERY");
            } else if ("OUT_FOR_DELIVERY".equalsIgnoreCase(order.getStatus()) && minutes >= 30) {
                order.setStatus("DELIVERED");
            } else {
                continue;
            }

            ordersRepo.save(order);

        }
    }
}