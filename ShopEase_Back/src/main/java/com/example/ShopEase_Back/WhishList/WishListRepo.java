package com.example.ShopEase_Back.WhishList;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishListRepo  extends JpaRepository<WishListEntity, Integer> {
    List<WishListEntity> findByUserId(Integer userId);
    Optional<WishListEntity> findByUserIdAndProductId(Integer userId,Integer productId);


}
