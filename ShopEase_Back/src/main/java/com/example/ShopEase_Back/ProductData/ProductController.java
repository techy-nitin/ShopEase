package com.example.ShopEase_Back.ProductData;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/{id}")
    public Map<String, Object> getproduct(@PathVariable Integer id) {
        return productService.getproductdetails(id);
    }

    @PostMapping("/review")
    public Review addReview(@RequestBody Review review) {
        return productService.addreview(review);
    }

    @PostMapping("/review/like/{id}")
    public Review likeReview(@PathVariable Integer id) {
        return productService.likereview(id);
    }

    @PostMapping("/review/dislike/{id}")
    public Review dislikeReview(@PathVariable Integer id) {
        return productService.dislikeReview(id);
    }

    @DeleteMapping("/review/{id}")
    public void deleteReview(@PathVariable Integer id) {
        productService.deleteReview(id);
    }

    @GetMapping("/search")
    public List<Map<String, Object>> search(@RequestParam String keyword) {
        return productService.searchProductListing(keyword);
    }

    @GetMapping
    public List<Map<String, Object>> getproducts() {
        return productService.getproductListing();
    }
    @DeleteMapping("/review/product/{productId}/user/{userId}")
    public void deleteUserReview(@PathVariable Integer productId, @PathVariable Integer userId) {
        productService.deleteUserReview(productId, userId);
    }
    @GetMapping("/category/{categoryId}")
    public List<Map<String, Object>> getProductsByCategory(@PathVariable Integer categoryId) {
        return productService.getproductListingByCategory(categoryId);
    }

    @GetMapping("/search/category/{categoryId}")
    public List<Map<String, Object>> searchByKeywordAndCategory(
            @PathVariable Integer categoryId,
            @RequestParam String keyword
    ) {
        return productService.searchProductListingByCategory(keyword, categoryId);
    }
}