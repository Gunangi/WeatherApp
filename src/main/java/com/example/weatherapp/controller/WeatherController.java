package com.example.weatherapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private final RestTemplate restTemplate;

    private final String API_KEY = "38b64d931ea106a38a71f9ec1643ba9d"; // Replace with your real key

    @Autowired
    public WeatherController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/weather")
    public ResponseEntity<?> getWeather(@RequestParam String city) {
        try {
            String url = "https://api.openweathermap.org/data/2.5/weather?q=" +
                    city + "&appid=" + API_KEY + "&units=metric";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Map<String, Object> weather = ((java.util.List<Map<String, Object>>) response.get("weather")).get(0);

            return ResponseEntity.ok(Map.of(
                    "city", response.get("name"),
                    "temperature", main.get("temp"),
                    "humidity", main.get("humidity"),
                    "description", weather.get("description")
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch weather data"));
        }
    }
}
