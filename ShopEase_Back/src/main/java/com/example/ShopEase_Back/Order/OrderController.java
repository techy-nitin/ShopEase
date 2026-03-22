package com.example.ShopEase_Back.Order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody ProductOrderRequest request) {
        try {
            OrderEntity order = orderService.placeOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getOrders(@PathVariable Integer buyerId) {
        try {
            System.out.println("GET /orders/buyer/" + buyerId);
            Object result = orderService.getOrderSummaryByBuyer(buyerId);
            System.out.println("Response: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Integer orderId) {
        try {
            OrderEntity order = orderService.getOrder(orderId);
            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "id", order.getId(),
                    "buyerId", order.getBuyerId(),
                    "orderDate", order.getOrderDate(),
                    "totalAmount", order.getTotalAmount(),
                    "status", order.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{orderId}/download-invoice")
    public ResponseEntity<?> downloadInvoice(@PathVariable Integer orderId) {
        try {
            byte[] pdfBytes = orderService.getInvoicePdfBytes(orderId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + orderId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderService.confirmOrder(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/ship")
    public ResponseEntity<?> shipOrder(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderService.shipOrder(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/out-for-delivery")
    public ResponseEntity<?> outForDelivery(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderService.outForDelivery(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<?> deliverOrder(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderService.deliverOrder(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderService.cancelOrder(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}