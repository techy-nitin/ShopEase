package com.example.ShopEase_Back.ProductData;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="product_id")
    private Integer productId;

    @Column(name="user_id")
    private Integer userId;

    private Integer rating;

    private String comment;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    private Integer likes;
    private Integer dislikes;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id=id;}

    public Integer getProductId(){return productId;}
    public void setProductId(Integer productId){this.productId=productId;}

    public Integer getUserId(){return userId;}
    public void setUserId(Integer userId){this.userId=userId;}

    public Integer getRating(){return rating;}
    public void setRating(Integer rating){this.rating=rating;}

    public String getComment(){return comment;}
    public void setComment(String comment){this.comment=comment;}

    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt){this.createdAt=createdAt;}

    public Integer getLikes(){return likes;}
    public void setLikes(Integer likes){this.likes=likes;}

    public Integer getDislikes(){return dislikes;}
    public void setDislikes(Integer dislikes){this.dislikes=dislikes;}

}