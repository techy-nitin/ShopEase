package com.example.ShopEase_Back.Payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public PaymentEntity createPayment(@RequestBody PaymentEntity payment) {
        return paymentService.createPayment(payment);
    }

    @GetMapping("/order/{orderId}")
    public PaymentEntity getPayment(@PathVariable Integer orderId) {
        return paymentService.getPaymentByOrder(orderId);
    }

    @PutMapping("/order/{orderId}/status")
    public PaymentEntity updatePaymentStatus(
            @PathVariable Integer orderId,
            @RequestParam String status,
            @RequestParam(required = false) String transactionId
    ) {
        return paymentService.updatePaymentStatus(orderId, status, transactionId);
    }
}