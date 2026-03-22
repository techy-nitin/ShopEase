package com.example.ShopEase_Back.WhishList;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist")
public class WishListEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "added_it")
    private LocalDateTime addedIt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public LocalDateTime getAddedIt() {
        return addedIt;
    }

    public void setAddedIt(LocalDateTime addedIt) {
        this.addedIt = addedIt;
    }
}
