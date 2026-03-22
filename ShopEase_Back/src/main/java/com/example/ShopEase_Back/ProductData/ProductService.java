package com.example.ShopEase_Back.ProductData;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private ImageRepo imageRepo;

    @Autowired
    private ReviewRepo reviewRepo;

    public Map<String, Object> getproductdetails(Integer productId) {
        ProductEntity productEntity = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        List<ProductImage> images = imageRepo.findByProductId(productId);
        List<Review> reviews = reviewRepo.findByProductId(productId);

        Map<String, Object> ans = new HashMap<>();
        ans.put("product", productEntity);
        ans.put("images", images);
        ans.put("reviews", reviews);

        return ans;
    }

    public Review addreview(Review review) {
        return reviewRepo.save(review);
    }

    public Review likereview(Integer reviewId) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review Not Found"));

        review.setLikes(review.getLikes() + 1);
        return reviewRepo.save(review);
    }

    public Review dislikeReview(Integer reviewId) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setDislikes(review.getDislikes() + 1);
        return reviewRepo.save(review);
    }

    public void deleteReview(Integer reviewId) {
        reviewRepo.deleteById(reviewId);
    }

    public List<ProductEntity> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }

    public List<Map<String, Object>> getproductListing() {
        List<ProductEntity> products = productRepo.findAll();
        System.out.println("TOTAL PRODUCTS = " + products.size());
        List<Map<String, Object>> ans = new ArrayList<>();
        Random rand = new Random();

        for (ProductEntity productEntity : products) {
            Map<String, Object> map = new HashMap<>();

            map.put("id", productEntity.getId());
            map.put("name", productEntity.getName());
            map.put("price", productEntity.getPrice());

            List<ProductImage> images = imageRepo.findByProductId(productEntity.getId());
            map.put("image", images.isEmpty() ? "" : images.get(0).getImageUrl());

            List<Review> reviews = reviewRepo.findByProductId(productEntity.getId());

            double rating = 0.0;
            if (!reviews.isEmpty()) {
                int total = 0;
                for (Review review : reviews) {
                    total += review.getRating();
                }
                rating = (double) total / reviews.size();
            }

            map.put("rating", rating);
            map.put("reviewCount", reviews.size());
            map.put("delivery", "Free Delivery By ShopEase");

            int days = rand.nextBoolean() ? 3 : 4;
            LocalDate deliveryDate = LocalDate.now().plusDays(days);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMM d");
            map.put("deliveryDate", "Get it By " + deliveryDate.format(formatter));

            ans.add(map);
        }

        return ans;
    }

    public List<Map<String, Object>> searchProductListing(String keyword) {
        List<ProductEntity> products = productRepo.searchProducts(keyword);
        List<Map<String, Object>> ans = new ArrayList<>();
        Random rand = new Random();

        for (ProductEntity productEntity : products) {
            Map<String, Object> map = new HashMap<>();

            map.put("id", productEntity.getId());
            map.put("name", productEntity.getName());
            map.put("price", productEntity.getPrice());

            List<ProductImage> images = imageRepo.findByProductId(productEntity.getId());
            map.put("image", images.isEmpty() ? "" : images.get(0).getImageUrl());

            List<Review> reviews = reviewRepo.findByProductId(productEntity.getId());

            double rating = 0.0;
            if (!reviews.isEmpty()) {
                int total = 0;
                for (Review review : reviews) {
                    total += review.getRating();
                }
                rating = (double) total / reviews.size();
            }

            map.put("rating", rating);
            map.put("reviewCount", reviews.size());
            map.put("delivery", "Free Delivery By ShopEase");

            int days = rand.nextBoolean() ? 3 : 4;
            LocalDate deliveryDate = LocalDate.now().plusDays(days);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMM d");
            map.put("deliveryDate", "Get it By " + deliveryDate.format(formatter));

            ans.add(map);
        }

        return ans;
    }
    public void deleteUserReview(Integer productId, Integer userId) {
        Review review = reviewRepo.findByProductIdAndUserId(productId, userId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        reviewRepo.delete(review);
    }

    public List<Map<String, Object>> getproductListingByCategory(Integer categoryId) {
        List<ProductEntity> products = productRepo.findByCategoryId(categoryId);
        List<Map<String, Object>> ans = new ArrayList<>();
        Random rand = new Random();

        for (ProductEntity productEntity : products) {
            Map<String, Object> map = new HashMap<>();

            map.put("id", productEntity.getId());
            map.put("name", productEntity.getName());
            map.put("price", productEntity.getPrice());
            map.put("categoryId", productEntity.getCategoryId());

            List<ProductImage> images = imageRepo.findByProductId(productEntity.getId());
            map.put("image", images.isEmpty() ? "" : images.get(0).getImageUrl());

            List<Review> reviews = reviewRepo.findByProductId(productEntity.getId());

            double rating = 0.0;
            if (!reviews.isEmpty()) {
                int total = 0;
                for (Review review : reviews) {
                    total += review.getRating();
                }
                rating = (double) total / reviews.size();
            }

            map.put("rating", rating);
            map.put("reviewCount", reviews.size());
            map.put("delivery", "Free Delivery By ShopEase");

            int days = rand.nextBoolean() ? 3 : 4;
            LocalDate deliveryDate = LocalDate.now().plusDays(days);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMM d");
            map.put("deliveryDate", "Get it By " + deliveryDate.format(formatter));

            ans.add(map);
        }

        return ans;
    }

    public List<Map<String, Object>> searchProductListingByCategory(String keyword, Integer categoryId) {
        List<ProductEntity> products = productRepo.searchProducts(keyword);
        List<Map<String, Object>> ans = new ArrayList<>();
        Random rand = new Random();

        for (ProductEntity productEntity : products) {
            if (!productEntity.getCategoryId().equals(categoryId)) {
                continue;
            }

            Map<String, Object> map = new HashMap<>();

            map.put("id", productEntity.getId());
            map.put("name", productEntity.getName());
            map.put("price", productEntity.getPrice());
            map.put("categoryId", productEntity.getCategoryId());

            List<ProductImage> images = imageRepo.findByProductId(productEntity.getId());
            map.put("image", images.isEmpty() ? "" : images.get(0).getImageUrl());

            List<Review> reviews = reviewRepo.findByProductId(productEntity.getId());

            double rating = 0.0;
            if (!reviews.isEmpty()) {
                int total = 0;
                for (Review review : reviews) {
                    total += review.getRating();
                }
                rating = (double) total / reviews.size();
            }

            map.put("rating", rating);
            map.put("reviewCount", reviews.size());
            map.put("delivery", "Free Delivery By ShopEase");

            int days = rand.nextBoolean() ? 3 : 4;
            LocalDate deliveryDate = LocalDate.now().plusDays(days);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMM d");
            map.put("deliveryDate", "Get it By " + deliveryDate.format(formatter));

            ans.add(map);
        }

        return ans;
    }
}