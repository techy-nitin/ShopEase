package com.example.ShopEase_Back.Seller;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SellerProfileRepo extends JpaRepository<SellerProfileEntity, Long> {
    Optional<SellerProfileEntity> findByUserId(Long userId);
    List<SellerProfileEntity> findByStatus(String status);
}