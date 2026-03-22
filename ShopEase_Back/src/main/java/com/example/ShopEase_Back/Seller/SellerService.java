package com.example.ShopEase_Back.Seller;

import com.example.ShopEase_Back.ProductData.ImageRepo;
import com.example.ShopEase_Back.ProductData.ProductEntity;
import com.example.ShopEase_Back.ProductData.ProductImage;
import com.example.ShopEase_Back.ProductData.ProductRepo;
import com.example.ShopEase_Back.Order.OrderEntity;
import com.example.ShopEase_Back.Order.OrderItemEntity;
import com.example.ShopEase_Back.Order.OrderItemRepo;
import com.example.ShopEase_Back.Order.OrdersRepo;
import com.example.ShopEase_Back.login.entity;
import com.example.ShopEase_Back.login.userrepo;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SellerService {

    @Autowired
    private userrepo userrepo;

    @Autowired
    private SellerOtpRepo sellerOtpRepo;

    @Autowired
    private SellerProfileRepo sellerProfileRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private ImageRepo imageRepo;

    @Autowired
    private OrdersRepo ordersRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Map<String, Object> sendOtp(SellerSendOtpRequest request) {

        entity user = userrepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email does not match registered account");
        }

        if ("seller".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User already seller");
        }

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        SellerOtpEntity sellerOtp = new SellerOtpEntity();
        sellerOtp.setUserId(request.getUserId());
        sellerOtp.setEmail(request.getEmail());
        sellerOtp.setOtp(otp);
        sellerOtp.setVerified(false);
        sellerOtp.setCreatedAt(LocalDateTime.now());
        sellerOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        sellerOtpRepo.save(sellerOtp);

        emailService.sendOtp(request.getEmail(), otp);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "OTP sent successfully");
        res.put("email", request.getEmail());

        return res;
    }

    public Map<String, Object> verifyOtp(SellerOtpRequest request) {
        SellerOtpEntity latestOtp = sellerOtpRepo
                .findTopByUserIdOrderByCreatedAtDesc(request.getUserId())
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (Boolean.TRUE.equals(latestOtp.getVerified())) {
            throw new RuntimeException("OTP already used");
        }

        if (latestOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!latestOtp.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        Optional<SellerProfileEntity> existingOpt = sellerProfileRepo.findByUserId(request.getUserId());

        SellerProfileEntity profile;

        if (existingOpt.isPresent()) {
            profile = existingOpt.get();

            if ("active".equalsIgnoreCase(profile.getStatus())) {
                throw new RuntimeException("Seller already active");
            }

            if ("pending".equalsIgnoreCase(profile.getStatus())) {
                throw new RuntimeException("Seller request already pending");
            }

            if ("deactivated".equalsIgnoreCase(profile.getStatus())) {
                profile.setStatus("pending");
                profile.setAppliedAt(LocalDateTime.now());
                profile.setActivatedAt(null);

                // old storeName, phone, address remain same
            } else {
                throw new RuntimeException("Invalid seller status");
            }
        } else {
            if (request.getStoreName() == null || request.getStoreName().trim().isEmpty()) {
                throw new RuntimeException("Store name is required");
            }
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                throw new RuntimeException("Phone is required");
            }
            if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
                throw new RuntimeException("Address is required");
            }

            profile = new SellerProfileEntity();
            profile.setUserId(request.getUserId());
            profile.setStoreName(request.getStoreName());
            profile.setPhone(request.getPhone());
            profile.setAddress(request.getAddress());
            profile.setStatus("pending");
            profile.setAppliedAt(LocalDateTime.now());
            profile.setActivatedAt(null);
        }

        latestOtp.setVerified(true);
        sellerOtpRepo.save(latestOtp);
        sellerProfileRepo.save(profile);

        Map<String, Object> map = new HashMap<>();
        map.put("message", "OTP verified. Seller account will activate in 5 minutes.");
        map.put("status", "pending");
        map.put("reusedProfile", existingOpt.isPresent());
        return map;
    }
    public Map<String, Object> getSellerStatus(Long userId) {
        entity user = userrepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> map = new HashMap<>();
        map.put("userId", user.getId());
        map.put("role", user.getRole());

        Optional<SellerProfileEntity> profile = sellerProfileRepo.findByUserId(userId);
        if (profile.isPresent()) {
            map.put("sellerStatus", profile.get().getStatus());
            map.put("storeName", profile.get().getStoreName());
            map.put("address", profile.get().getAddress());
            map.put("phone", profile.get().getPhone());
        } else {
            map.put("sellerStatus", "not_registered");
        }

        return map;
    }

    public ProductEntity addProduct(SellerProductRequest request) {
        entity seller = userrepo.findById(Long.valueOf(request.getSellerId()))
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (!"seller".equalsIgnoreCase(seller.getRole())) {
            throw new RuntimeException("User is not active seller");
        }

        Integer newProductId = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(id), 0) + 1 FROM products",
                Integer.class
        );

        jdbcTemplate.update("""
            INSERT INTO products (id, seller_id, category_id, name, description, price, stock, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
                newProductId,
                request.getSellerId(),
                request.getCategoryId(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStock(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            Integer newImageId = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(id), 0) + 1 FROM product_images",
                    Integer.class
            );

            jdbcTemplate.update("""
                INSERT INTO product_images (id, product_id, image_url, is_primary)
                VALUES (?, ?, ?, ?)
            """,
                    newImageId,
                    newProductId,
                    request.getImageUrl(),
                    true
            );
        }

        return productRepo.findById(newProductId)
                .orElseThrow(() -> new RuntimeException("Product saved but fetch failed"));
    }

    public List<ProductEntity> getSellerProducts(Integer sellerId) {
        List<ProductEntity> all = productRepo.findAll();
        List<ProductEntity> ans = new ArrayList<>();

        for (ProductEntity p : all) {
            if (p.getSellerId() != null && p.getSellerId().equals(sellerId)) {
                ans.add(p);
            }
        }
        return ans;
    }

    public ProductEntity updateProduct(Integer productId, SellerProductRequest request) {
        ProductEntity product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        jdbcTemplate.update("""
            UPDATE products
            SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, updated_at = ?
            WHERE id = ?
        """,
                request.getCategoryId(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStock(),
                LocalDateTime.now(),
                productId
        );

        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            List<ProductImage> images = imageRepo.findByProductId(productId);

            if (images.isEmpty()) {
                Integer newImageId = jdbcTemplate.queryForObject(
                        "SELECT COALESCE(MAX(id), 0) + 1 FROM product_images",
                        Integer.class
                );

                jdbcTemplate.update("""
                    INSERT INTO product_images (id, product_id, image_url, is_primary)
                    VALUES (?, ?, ?, ?)
                """,
                        newImageId,
                        productId,
                        request.getImageUrl(),
                        true
                );
            } else {
                jdbcTemplate.update("""
                    UPDATE product_images
                    SET image_url = ?, is_primary = ?
                    WHERE id = ?
                """,
                        request.getImageUrl(),
                        true,
                        images.get(0).getId()
                );
            }
        }

        return productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Updated product fetch failed"));
    }

    public void deleteProduct(Integer productId) {
        jdbcTemplate.update("DELETE FROM product_images WHERE product_id = ?", productId);
        jdbcTemplate.update("DELETE FROM products WHERE id = ?", productId);
    }

    public Map<String, Object> getDashboard(Integer sellerId) {
        List<ProductEntity> sellerProducts = getSellerProducts(sellerId);

        entity sellerUser = userrepo.findById(Long.valueOf(sellerId))
                .orElseThrow(() -> new RuntimeException("Seller user not found"));

        Optional<SellerProfileEntity> profileOpt = sellerProfileRepo.findByUserId(Long.valueOf(sellerId));

        Set<Integer> productIds = new HashSet<>();
        for (ProductEntity p : sellerProducts) {
            productIds.add(p.getId());
        }

        List<OrderItemEntity> allItems = orderItemRepo.findAll();
        List<OrderItemEntity> sellerItems = new ArrayList<>();

        for (OrderItemEntity item : allItems) {
            if (productIds.contains(item.getProductId())) {
                sellerItems.add(item);
            }
        }

        Set<Integer> orderIds = new HashSet<>();
        double totalRevenue = 0;
        int totalUnitsSold = 0;

        for (OrderItemEntity item : sellerItems) {
            orderIds.add(item.getOrderId());
            totalUnitsSold += item.getQuantity();
            totalRevenue += item.getPrice() * item.getQuantity();
        }

        int deliveredOrders = 0;
        int pendingOrders = 0;
        int cancelledOrders = 0;
        List<Map<String, Object>> recentOrders = new ArrayList<>();

        for (Integer orderId : orderIds) {
            Optional<OrderEntity> orderOpt = ordersRepo.findById(orderId);
            if (orderOpt.isPresent()) {
                OrderEntity order = orderOpt.get();

                if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
                    deliveredOrders++;
                } else if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
                    cancelledOrders++;
                } else {
                    pendingOrders++;
                }

                Map<String, Object> row = new HashMap<>();
                row.put("orderId", order.getId());
                row.put("orderDate", order.getOrderDate());
                row.put("status", order.getStatus());
                row.put("totalAmount", order.getTotalAmount());
                recentOrders.add(row);
            }
        }

        long lowStock = 0;
        for (ProductEntity p : sellerProducts) {
            if (p.getStock() != null && p.getStock() <= 5) {
                lowStock++;
            }
        }

        Map<String, Integer> salesMap = new HashMap<>();
        for (OrderItemEntity item : sellerItems) {
            Optional<ProductEntity> productOpt = productRepo.findById(item.getProductId());
            if (productOpt.isPresent()) {
                String name = productOpt.get().getName();
                salesMap.put(name, salesMap.getOrDefault(name, 0) + item.getQuantity());
            }
        }

        List<Map<String, Object>> topProducts = salesMap.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("unitsSold", e.getValue());
                    return m;
                })
                .toList();

        Map<String, Object> map = new HashMap<>();
        map.put("sellerId", sellerId);
        map.put("sellerName", sellerUser.getName());
        map.put("storeName", profileOpt.map(SellerProfileEntity::getStoreName).orElse(""));
        map.put("address", profileOpt.map(SellerProfileEntity::getAddress).orElse(""));
        map.put("phone", profileOpt.map(SellerProfileEntity::getPhone).orElse(""));
        map.put("sellerStatus", profileOpt.map(SellerProfileEntity::getStatus).orElse("not_registered"));

        map.put("totalProducts", sellerProducts.size());
        map.put("totalOrders", orderIds.size());
        map.put("totalRevenue", totalRevenue);
        map.put("totalUnitsSold", totalUnitsSold);
        map.put("deliveredOrders", deliveredOrders);
        map.put("pendingOrders", pendingOrders);
        map.put("cancelledOrders", cancelledOrders);
        map.put("lowStockProducts", lowStock);
        map.put("topProducts", topProducts);
        map.put("recentOrders", recentOrders);

        return map;
    }

    public Map<String, Object> deregisterSeller(Long userId) {
        SellerProfileEntity profile = sellerProfileRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        profile.setStatus("deactivated");
        sellerProfileRepo.save(profile);

        Map<String, Object> map = new HashMap<>();
        map.put("message", "Seller deregistered successfully");
        map.put("status", "deactivated");
        return map;
    }

    public void exportProductsCsv(Integer sellerId, HttpServletResponse response) throws IOException {
        List<ProductEntity> products = getSellerProducts(sellerId);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=seller_products.csv");

        PrintWriter writer = response.getWriter();
        writer.println("product_id,name,category_id,price,stock,created_at");

        for (ProductEntity p : products) {
            writer.println(
                    p.getId() + "," +
                            safe(p.getName()) + "," +
                            p.getCategoryId() + "," +
                            p.getPrice() + "," +
                            p.getStock() + "," +
                            p.getCreatedAt()
            );
        }

        writer.flush();
        writer.close();
    }

    public void exportOrdersCsv(Integer sellerId, HttpServletResponse response) throws IOException {
        List<ProductEntity> products = getSellerProducts(sellerId);

        Set<Integer> productIds = new HashSet<>();
        for (ProductEntity p : products) {
            productIds.add(p.getId());
        }

        List<OrderItemEntity> allItems = orderItemRepo.findAll();

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=seller_orders.csv");

        PrintWriter writer = response.getWriter();
        writer.println("order_id,product_id,quantity,price,status,order_date");

        for (OrderItemEntity item : allItems) {
            if (productIds.contains(item.getProductId())) {
                Optional<OrderEntity> orderOpt = ordersRepo.findById(item.getOrderId());
                if (orderOpt.isPresent()) {
                    OrderEntity order = orderOpt.get();
                    writer.println(
                            order.getId() + "," +
                                    item.getProductId() + "," +
                                    item.getQuantity() + "," +
                                    item.getPrice() + "," +
                                    safe(order.getStatus()) + "," +
                                    order.getOrderDate()
                    );
                }
            }
        }

        writer.flush();
        writer.close();
    }

    private String safe(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}