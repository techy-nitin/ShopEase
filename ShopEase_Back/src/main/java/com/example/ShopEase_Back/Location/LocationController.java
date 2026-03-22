package com.example.ShopEase_Back.Location;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    private final Map<String, Map<String, String>> ipCache = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/get")
    public Map<String, String> getLocation(HttpServletRequest request) {

        String clientIp = getClientIP(request);

        // REPLACE localhost with your actual public IP for testing
        if(clientIp.equals("127.0.0.1") || clientIp.equals("0:0:0:0:0:0:0:1")) {
            clientIp = "103.72.7.85"; // e.g., 123.45.67.89
        }

        // Check cache
        if(ipCache.containsKey(clientIp)) {
            return ipCache.get(clientIp);
        }

        // Call external IP API
        try {
            String url = "https://ipapi.co/" + clientIp + "/json/";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            String district = (String) response.get("region"); // region/district
            String pincode = (String) response.get("postal");  // postal code

            Map<String, String> result = Map.of(
                    "district", district != null ? district : "Unknown",
                    "pincode", pincode != null ? pincode : "000000"
            );

            ipCache.put(clientIp, result);

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("district", "Unknown", "pincode", "000000");
        }
    }

    @PostMapping("/get-accurate")
    public Map<String, String> getAccurateLocation(@RequestBody Map<String, Double> coords) {
        double latitude = coords.getOrDefault("latitude", 0.0);
        double longitude = coords.getOrDefault("longitude", 0.0);

        // Replace with actual geocoding API if needed
        return Map.of(
                "district", "Mumbai",
                "pincode", "400049"
        );
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) return request.getRemoteAddr();
        return xfHeader.split(",")[0];
    }
}