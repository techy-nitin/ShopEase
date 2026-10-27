package com.example.ShopEase_Back.ReturnRefund;

import com.example.ShopEase_Back.Order.OrderItemEntity;
import com.example.ShopEase_Back.Order.OrderItemRepo;
import com.example.ShopEase_Back.ProductData.ProductEntity;
import com.example.ShopEase_Back.ProductData.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RRService {

    @Autowired
    private ReturnRefundRepo returnRefundRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ProductRepo productRepo;

    public ReturnRefundEntity requestreturn(ReturnRefundEntity req) {
        if (req.getOrderItemId() == null) {
            throw new RuntimeException("orderItemId is required");
        }

        if (returnRefundRepo.existsByOrderItemId(req.getOrderItemId())) {
            throw new RuntimeException("Return already requested for this item");
        }

        req.setRequestedAt(LocalDateTime.now());
        req.setProcessedAt(null);
        req.setStatus("RETURN_REQUESTED");

        return returnRefundRepo.save(req);
    }

    @Transactional
    public ReturnRefundEntity processRefund(Integer id) {
        ReturnRefundEntity r = returnRefundRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        if ("RETURN_SUCCESSFUL".equalsIgnoreCase(r.getStatus())) {
            return r;
        }

        r.setStatus("RETURN_SUCCESSFUL");
        r.setProcessedAt(LocalDateTime.now());
        ReturnRefundEntity saved = returnRefundRepo.save(r);

        restoreStockForReturnedItem(saved.getOrderItemId());

        return saved;
    }

    public List<ReturnRefundEntity> getByOrder(Integer orderItemId) {
        return returnRefundRepo.findByOrderItemId(orderItemId);
    }

    public ReturnRefundEntity getLatestByOrderItem(Integer orderItemId) {
        return returnRefundRepo.findTopByOrderItemIdOrderByRequestedAtDesc(orderItemId)
                .orElse(null);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoUpdateReturnStatus() {
        List<ReturnRefundEntity> allReturns = returnRefundRepo.findAll();

        for (ReturnRefundEntity item : allReturns) {
            if (item.getRequestedAt() == null || item.getStatus() == null) {
                continue;
            }

            long minutes = Duration.between(item.getRequestedAt(), LocalDateTime.now()).toMinutes();

            if ("RETURN_REQUESTED".equalsIgnoreCase(item.getStatus()) && minutes >= 2) {
                item.setStatus("PICKED_FROM_HOME");
                returnRefundRepo.save(item);
            } else if ("PICKED_FROM_HOME".equalsIgnoreCase(item.getStatus()) && minutes >= 5) {
                item.setStatus("RETURN_SUCCESSFUL");
                item.setProcessedAt(LocalDateTime.now());
                returnRefundRepo.save(item);

                restoreStockForReturnedItem(item.getOrderItemId());
            }
        }
    }

    private void restoreStockForReturnedItem(Integer orderItemId) {
        OrderItemEntity orderItem = orderItemRepo.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        ProductEntity product = productRepo.findById(orderItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int qty = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
        product.setStock(product.getStock() + qty);
        productRepo.save(product);
    }
}