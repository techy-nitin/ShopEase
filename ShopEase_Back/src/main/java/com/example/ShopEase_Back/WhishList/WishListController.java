package com.example.ShopEase_Back.WhishList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WishListController {
    @Autowired
    private  WishListService wishListService;

    @PostMapping("/add")
    public WishListEntity add(@RequestBody WishListEntity wishListEntity) {
        return wishListService.additeminwhishlist(wishListEntity);
    }

    @GetMapping("/{userid}")
    public List<WishListEntity> getWishListById(@PathVariable Integer userid) {
        return wishListService.getWishList(userid);
    }
    @DeleteMapping("/remove")
    public void remove(@RequestParam Integer userid , @RequestParam Integer productId) {
        wishListService.removeWishlist(userid,productId);
    }
}
