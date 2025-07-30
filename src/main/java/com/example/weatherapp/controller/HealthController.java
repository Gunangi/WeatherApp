package com.example.weatherapp.controller;

import com.example.weatherapp.dto.HealthRecommendationDto;
import com.example.weatherapp.dto.AirQualityHealthDto;
import com.example.weatherapp.dto.UVRecommendationDto;
import com.example.weatherapp.dto.PollenForecastDto;
import com.example.weatherapp.dto.HealthAlertDto;
import com.example.weatherapp.dto.HealthPreferencesDto;
import com.example.weatherapp.dto.ApiResponse;
import com.example.weatherapp.service.HealthWeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.util.List;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private HealthWeatherService healthWeatherService;

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<HealthRecommendationDto>> getHealthRecommendations(
            @RequestParam @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
            @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90") Double lat,
            @RequestParam @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
            @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180") Double lon) {

        HealthRecommendationDto recommendations = healthWeatherService.getHealthRecommendations(lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Health recommendations retrieved successfully", recommendations));
    }

    @GetMapping("/air-quality-impact")
    public ResponseEntity<ApiResponse<AirQualityHealthDto>> getAirQualityHealthImpact(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon) {

        AirQualityHealthDto healthImpact = healthWeatherService.getAirQualityHealthImpact(lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Air quality health impact retrieved successfully", healthImpact));
    }

    @GetMapping("/uv-recommendations")
    public ResponseEntity<ApiResponse<UVRecommendationDto>> getUVRecommendations(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon) {

        UVRecommendationDto uvRecommendations = healthWeatherService.getUVRecommendations(lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "UV recommendations retrieved successfully", uvRecommendations));
    }

    @GetMapping("/pollen-forecast")
    public ResponseEntity<ApiResponse<PollenForecastDto>> getPollenForecast(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon) {

        PollenForecastDto pollenData = healthWeatherService.getPollenForecast(lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pollen forecast retrieved successfully", pollenData));
    }

    @GetMapping("/alerts/{userId}")
    public ResponseEntity<ApiResponse<List<HealthAlertDto>>> getPersonalizedHealthAlerts(
            @PathVariable @NotBlank(message = "User ID cannot be blank") String userId,
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon) {

        List<HealthAlertDto> alerts = healthWeatherService.getPersonalizedHealthAlerts(userId, lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Personalized health alerts retrieved successfully", alerts));
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<ApiResponse<HealthPreferencesDto>> updateHealthPreferences(
            @PathVariable @NotBlank(message = "User ID cannot be blank") String userId,
            @Valid @RequestBody HealthPreferencesDto preferences) {

        HealthPreferencesDto updatedPreferences = healthWeatherService.updateHealthPreferences(userId, preferences);
        return ResponseEntity.ok(new ApiResponse<>(true, "Health preferences updated successfully", updatedPreferences));
    }

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<ApiResponse<HealthPreferencesDto>> getHealthPreferences(
            @PathVariable @NotBlank(message = "User ID cannot be blank") String userId) {

        HealthPreferencesDto preferences = healthWeatherService.getHealthPreferences(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Health preferences retrieved successfully", preferences));
    }

    @PostMapping("/emergency-alerts/{userId}")
    public ResponseEntity<ApiResponse<String>> createEmergencyAlert(
            @PathVariable @NotBlank(message = "User ID cannot be blank") String userId,
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon) {

        String alertId = healthWeatherService.createEmergencyAlert(userId, lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Emergency alert created successfully", alertId));
    }
}