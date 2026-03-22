package com.example.ShopEase_Back.Cart;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    public CartEntity addCart(CartEntity cart) {
        if (cart.getUserId() == null) {
            throw new RuntimeException("userId is missing");
        }

        if (cart.getProductId() == null) {
            throw new RuntimeException("productId is missing");
        }

        if (cart.getQuantity() == null || cart.getQuantity() <= 0) {
            cart.setQuantity(1);
        }

        CartEntity existing = cartRepo
                .findByUserIdAndProductId(cart.getUserId(), cart.getProductId())
                .orElse(null);

        if (existing != null) {
            Integer oldQty = existing.getQuantity() == null ? 0 : existing.getQuantity();
            existing.setQuantity(oldQty + cart.getQuantity());
            return cartRepo.save(existing);
        }

        cart.setAddedAt(LocalDateTime.now());
        return cartRepo.save(cart);
    }

    public List<CartEntity> getUserCart(Integer userId) {
        return cartRepo.findByUserId(userId);
    }

    public void deleteCart(Integer id) {
        cartRepo.deleteById(id);
    }
}