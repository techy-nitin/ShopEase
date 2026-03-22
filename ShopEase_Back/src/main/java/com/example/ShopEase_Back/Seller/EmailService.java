package com.example.ShopEase_Back.Seller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopEase Seller Verification OTP");
        message.setText("Your ShopEase seller OTP is: " + otp + ". It will expire in 5 minutes.");
        mailSender.send(message);
    }
}