package com.example.ShopEase_Back.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class Controller {
@Autowired
    private  Logic authservice;
//signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> req){
        try{
            entity user = authservice.signup(
                    req.get("name"),
                    req.get("email"),
                    req.get("password")
            );
            return  ResponseEntity.ok(user);
        }catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req){
        try{
            Map<String, Object> response = authservice.login(
                    req.get("email"),
                    req.get("password")
            );
            return ResponseEntity.ok(response);
        }catch(Exception e){
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String , String> req){
        return ResponseEntity.ok(Map.of("Message","Logout Successful"));
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        try{
            authservice.delteuser(id);
            return  ResponseEntity.ok(Map.of("message","Delete Successful"));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("error",e.getMessage()));
        }
    }
    @GetMapping("/test")
    public String test(){
        return "working";
    }

}
