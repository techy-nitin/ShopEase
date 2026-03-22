package com.example.ShopEase_Back.Location;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class LocationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Get location from IP
    public LocationResponse getLocationFromIP(HttpServletRequest req) {
        try {
            // Get client IP address
            String ip = req.getRemoteAddr();
            String url = "https://ipapi.co/" + ip + "/json/";

            // Call the API
            String result = restTemplate.getForObject(url, String.class);

            // Parse JSON using Jackson
            JsonNode json = objectMapper.readTree(result);
            String pincode = json.has("postal") ? json.get("postal").asText() : "Not available";
            String district = json.has("region") ? json.get("region").asText() : "Not available";

            return new LocationResponse(district, pincode);
        } catch (Exception e) {
            e.printStackTrace();
            return new LocationResponse("Error", "Error");
        }
    }

    // Get location from coordinates
    public LocationResponse getLocationFromCoordinates(double lat, double lon) {
        try {
            String url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="
                    + lat + "&lon=" + lon + "&addressdetails=1";

            // Call the API
            String result = restTemplate.getForObject(url, String.class);

            // Parse JSON using Jackson
            JsonNode json = objectMapper.readTree(result);
            JsonNode address = json.get("address");

            String pincode = (address != null && address.has("postcode")) ? address.get("postcode").asText() : "Not available";
            String district;
            if (address != null && address.has("county")) {
                district = address.get("county").asText();
            } else if (address != null && address.has("city")) {
                district = address.get("city").asText();
            } else {
                district = "Not available";
            }

            return new LocationResponse(district, pincode);
        } catch (Exception e) {
            e.printStackTrace();
            return new LocationResponse("Error", "Error");
        }
    }
}