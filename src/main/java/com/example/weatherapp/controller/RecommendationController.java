// src/main/java/com/weatherapp/controller/RecommendationController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.dto.ClothingSuggestionDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.service.ActivityRecommendationService;
import com.example.weatherapp.service.ClothingRecommendationService;
import com.example.weatherapp.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final ActivityRecommendationService activityRecommendationService;
    private final ClothingRecommendationService clothingRecommendationService;
    private final WeatherService weatherService;

    @GetMapping("/{city}")
    // FIX: Changed the response type to Map<String, Object> to hold different kinds of data
    public ResponseEntity<Map<String, Object>> getRecommendations(@PathVariable String city) {
        WeatherResponse weather = weatherService.getWeatherForCity(city, null);

        // This remains a List<String>
        List<String> activities = activityRecommendationService.getRecommendations(weather);

        // FIX: Changed the variable type to match the service's return type
        ClothingSuggestionDto clothing = clothingRecommendationService.getClothingSuggestions(weather);

        // FIX: The map now correctly holds a List and a complex DTO object
        return ResponseEntity.ok(Map.of("activities", activities, "clothing", clothing));
    }
}