package com.example.ShopEase_Back.Order;

import java.time.LocalDateTime;

public class OrderSummaryDto {
    private Integer id;
    private Integer buyerId;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String status;

    private Integer productId;
    private String productName;
    private String productImage;
    private Integer orderItemId;
    private Integer quantity;   // <-- add this

    public OrderSummaryDto() {}

    public OrderSummaryDto(Integer id, Integer buyerId, LocalDateTime orderDate,
                           Double totalAmount, String status,
                           Integer productId, String productName, String productImage,
                           Integer orderItemId, Integer quantity) {
        this.id = id;
        this.buyerId = buyerId;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.orderItemId = orderItemId;
        this.quantity = quantity;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getBuyerId() { return buyerId; }
    public void setBuyerId(Integer buyerId) { this.buyerId = buyerId; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public Integer getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Integer orderItemId) {
        this.orderItemId = orderItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}