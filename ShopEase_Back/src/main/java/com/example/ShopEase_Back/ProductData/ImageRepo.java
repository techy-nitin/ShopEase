package com.example.ShopEase_Back.ProductData;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImageRepo extends JpaRepository<ProductImage, Integer> {
    List<ProductImage> findByProductId(Integer productId);
}