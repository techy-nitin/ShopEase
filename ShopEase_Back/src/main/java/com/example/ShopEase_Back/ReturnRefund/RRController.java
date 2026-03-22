package com.example.ShopEase_Back.ReturnRefund;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/return-refund")
@CrossOrigin(origins = "http://localhost:5173")
public class RRController {

    @Autowired
    private RRService rrService;

    @PostMapping("/request")
    public ReturnRefundEntity requestreturn(@RequestBody ReturnRefundEntity returnRefundEntity) {
        return rrService.requestreturn(returnRefundEntity);
    }

    @PostMapping("/process/{id}")
    public ReturnRefundEntity processrefund(@PathVariable Integer id) {
        return rrService.processRefund(id);
    }

    @PostMapping("/order-item/{orderItemId}")
    public List<ReturnRefundEntity> orderitemrefund(@PathVariable Integer orderItemId) {
        return rrService.getByOrder(orderItemId);
    }

    @GetMapping("/latest/{orderItemId}")
    public Object latestReturnStatus(@PathVariable Integer orderItemId) {
        ReturnRefundEntity result = rrService.getLatestByOrderItem(orderItemId);

        if (result == null) {
            return Map.of("message", "No return request found");
        }

        return result;
    }
}