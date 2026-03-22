package com.example.ShopEase_Back.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class Logic {

    @Autowired
    private userrepo userrepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private utility utility;

    public entity signup(String name, String email, String rawPassword) {
        if (userrepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already present");
        }

        entity user = new entity();
        user.setName(name);
        user.setEmail(email);
        user.setRole("buyer");
        user.setPassword(passwordEncoder.encode(rawPassword));

        return userrepository.save(user);
    }

    public Map<String, Object> login(String email, String rawPassword) {
        entity user = userrepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = utility.generatetoken(user.getEmail());

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "token", token
        );
    }

    public void delteuser(Long id) {
        if (!userrepository.existsById(id)) {
            throw new RuntimeException("User not Found");
        }
        userrepository.deleteById(id);
    }
}