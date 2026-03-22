package com.example.ShopEase_Back.Payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    @PostMapping("/create")
    public PaymentEntity createPayment(@RequestBody PaymentEntity payment){
        return paymentService.createPayment(payment);
    }

    @GetMapping("/order/{orderId}")
    public PaymentEntity getPayment(@PathVariable Integer orderId){
        return paymentService.getPaymentByOrder(orderId);
    }
}
