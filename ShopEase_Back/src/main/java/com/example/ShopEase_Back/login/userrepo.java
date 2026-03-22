package com.example.ShopEase_Back.login;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface userrepo extends JpaRepository<entity , Long> {
    Optional<entity> findByEmail(String email);
}
