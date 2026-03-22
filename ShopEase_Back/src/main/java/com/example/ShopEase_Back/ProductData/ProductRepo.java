package com.example.ShopEase_Back.ProductData;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepo extends JpaRepository<ProductEntity, Integer> {

    @Query(value = """
        SELECT * FROM products
        WHERE search_vector @@ plainto_tsquery('english', :keyword)
        LIMIT 20
        """, nativeQuery = true)
    List<ProductEntity> searchProducts(@Param("keyword") String keyword);

    // ✅ NEW: fetch products by categoryId
    List<ProductEntity> findByCategoryId(Integer categoryId);

    // ✅ OPTIONAL: search inside category
    @Query(value = """
        SELECT * FROM products
        WHERE category_id = :categoryId
        AND search_vector @@ plainto_tsquery('english', :keyword)
        LIMIT 20
        """, nativeQuery = true)
    List<ProductEntity> searchProductsByCategory(
            @Param("categoryId") Integer categoryId,
            @Param("keyword") String keyword
    );
}