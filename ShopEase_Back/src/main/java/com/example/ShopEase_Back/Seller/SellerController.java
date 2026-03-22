package com.example.ShopEase_Back.Seller;

import com.example.ShopEase_Back.ProductData.ProductEntity;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "http://localhost:5173")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @DeleteMapping("/deregister/{userId}")
    public ResponseEntity<?> deregisterSeller(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(sellerService.deregisterSeller(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SellerSendOtpRequest request) {
        try {
            return ResponseEntity.ok(sellerService.sendOtp(request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody SellerOtpRequest request) {
        try {
            return ResponseEntity.ok(sellerService.verifyOtp(request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> sellerStatus(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(sellerService.getSellerStatus(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestBody SellerProductRequest request) {
        try {
            ProductEntity product = sellerService.addProduct(request);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/products/{sellerId}")
    public ResponseEntity<?> getSellerProducts(@PathVariable Integer sellerId) {
        try {
            List<ProductEntity> products = sellerService.getSellerProducts(sellerId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer productId,
                                           @RequestBody SellerProductRequest request) {
        try {
            ProductEntity product = sellerService.updateProduct(productId, request);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer productId) {
        try {
            sellerService.deleteProduct(productId);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/dashboard/{sellerId}")
    public ResponseEntity<?> getDashboard(@PathVariable Integer sellerId) {
        try {
            return ResponseEntity.ok(sellerService.getDashboard(sellerId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() == null ? "Unknown server error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/export/products/{sellerId}")
    public void exportProducts(@PathVariable Integer sellerId,
                               HttpServletResponse response) throws IOException {
        sellerService.exportProductsCsv(sellerId, response);
    }

    @GetMapping("/export/orders/{sellerId}")
    public void exportOrders(@PathVariable Integer sellerId,
                             HttpServletResponse response) throws IOException {
        sellerService.exportOrdersCsv(sellerId, response);
    }
}