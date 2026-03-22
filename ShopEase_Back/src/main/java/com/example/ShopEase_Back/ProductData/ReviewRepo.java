package com.example.ShopEase_Back.ProductData;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ReviewRepo extends JpaRepository<Review, Integer> {
    List<Review> findByProductId(Integer productId);
    Optional<Review> findByProductIdAndUserId(Integer productId, Integer userId);
}