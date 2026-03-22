package com.example.ShopEase_Back.ReturnRefund;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRefundRepo extends JpaRepository<ReturnRefundEntity, Integer> {

    List<ReturnRefundEntity> findByOrderItemId(Integer orderItemId);

    Optional<ReturnRefundEntity> findTopByOrderItemIdOrderByRequestedAtDesc(Integer orderItemId);

    boolean existsByOrderItemId(Integer orderItemId);
}