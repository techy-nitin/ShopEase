package com.example.ShopEase_Back.Order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;
import org.springframework.data.repository.query.Param;


public interface OrdersRepo extends JpaRepository<OrderEntity, Integer> {

    List<OrderEntity> findByBuyerId(Integer buyerId);

    @Query("SELECT o.id, o.buyerId, o.orderDate, o.totalAmount, o.status FROM OrderEntity o WHERE o.buyerId = :buyerId")
    List<Object[]> findOrderSummaryWithoutInvoice(Integer buyerId);

    @Query("SELECT o.pdfInvoice FROM OrderEntity o WHERE o.id = :orderId")
    String findPdfInvoiceByOrderId(@Param("orderId") Integer orderId);

    @Query("SELECT COUNT(o) > 0 FROM OrderEntity o WHERE o.id = :orderId")
    boolean existsOrderByIdOnly(@Param("orderId") Integer orderId);
}