package com.example.ShopEase_Back.Cart;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartRepo extends JpaRepository<CartEntity , Integer> {
    List<CartEntity> findByUserId(Integer userId);

    Optional<CartEntity> findByUserIdAndProductId(Integer userId, Integer productId);
}
