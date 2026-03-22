package com.example.ShopEase_Back.Seller;

import com.example.ShopEase_Back.login.entity;
import com.example.ShopEase_Back.login.userrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SellerActivationService {

    @Autowired
    private SellerProfileRepo sellerProfileRepo;

    @Autowired
    private userrepo userrepo;

    @Scheduled(fixedRate = 60000)
    public void activateSeller() {
        List<SellerProfileEntity> pendingProfiles = sellerProfileRepo.findByStatus("pending");

        for (SellerProfileEntity profile : pendingProfiles) {
            if (profile.getAppliedAt() == null) {
                continue;
            }

            long minutes = Duration.between(profile.getAppliedAt(), LocalDateTime.now()).toMinutes();

            if (minutes >= 5) {
                profile.setStatus("active");
                profile.setActivatedAt(LocalDateTime.now());
                sellerProfileRepo.save(profile);

                entity user = userrepo.findById(profile.getUserId()).orElse(null);
                if (user != null) {
                    user.setRole("seller");
                    userrepo.save(user);
                }
            }
        }
    }
}