package com.example.ShopEase_Back.WhishList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class WishListService {
    @Autowired
    private  WishListRepo wishListRepo;

    public WishListEntity additeminwhishlist(WishListEntity wishListEntity){
        WishListEntity existing = wishListRepo
                .findByUserIdAndProductId(
                        wishListEntity.getUserId(),
                        wishListEntity.getProductId()
                )
                .orElse(null);

        if(existing != null){
            return existing;
        }

        wishListEntity.setAddedIt(java.time.LocalDateTime.now());

        return wishListRepo.save(wishListEntity);
    }

    public List<WishListEntity> getWishList(Integer userId){
        return wishListRepo.findByUserId(userId);
    }
    public void removeWishlist(Integer userId,Integer productId){

        WishListEntity existing =
                wishListRepo.findByUserIdAndProductId(userId,productId)
                        .orElse(null);

        if(existing != null){
            wishListRepo.delete(existing);
        }
    }
}
