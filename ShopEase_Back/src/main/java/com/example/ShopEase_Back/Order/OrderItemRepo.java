package com.example.ShopEase_Back.Order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepo extends JpaRepository<OrderItemEntity , Integer> {
    List<OrderItemEntity> findByOrderId(Integer orderId);
}