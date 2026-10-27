package com.example.ShopEase_Back.Cart;

import com.example.ShopEase_Back.ProductData.ProductEntity;
import com.example.ShopEase_Back.ProductData.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private ProductRepo productRepo;

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

        ProductEntity product = productRepo.findById(cart.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer stock = product.getStock() == null ? 0 : product.getStock();

        if (stock <= 0) {
            throw new RuntimeException("Product is out of stock");
        }

        CartEntity existing = cartRepo
                .findByUserIdAndProductId(cart.getUserId(), cart.getProductId())
                .orElse(null);

        if (existing != null) {
            Integer oldQty = existing.getQuantity() == null ? 0 : existing.getQuantity();
            Integer newQty = oldQty + cart.getQuantity();

            if (newQty > stock) {
                throw new RuntimeException("Only " + stock + " item(s) available in stock");
            }

            existing.setQuantity(newQty);
            return cartRepo.save(existing);
        }

        if (cart.getQuantity() > stock) {
            throw new RuntimeException("Only " + stock + " item(s) available in stock");
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