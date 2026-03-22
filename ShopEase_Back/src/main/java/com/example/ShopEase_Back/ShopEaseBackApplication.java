package com.example.ShopEase_Back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ShopEaseBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopEaseBackApplication.class, args);
	}

}
