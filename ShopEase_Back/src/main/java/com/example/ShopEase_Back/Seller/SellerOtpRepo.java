package com.example.ShopEase_Back.Seller;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SellerOtpRepo extends JpaRepository<SellerOtpEntity, Long> {
    Optional<SellerOtpEntity> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}