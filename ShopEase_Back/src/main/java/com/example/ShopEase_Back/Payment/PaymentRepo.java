package com.example.ShopEase_Back.Payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepo extends JpaRepository<PaymentEntity,Integer> {

    Optional<PaymentEntity> findByOrderId(Integer orderId);
}
