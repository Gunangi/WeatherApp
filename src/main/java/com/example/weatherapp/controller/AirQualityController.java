package com.example.weatherapp.controller;

import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.service.AirQualityService;
import com.example.weatherapp.exception.WeatherServiceException;
import com.example.weatherapp.exception.LocationNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/air-quality")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class AirQualityController {

    private final AirQualityService airQualityService;

    // Use constructor injection
    public AirQualityController(AirQualityService airQualityService) {
        this.airQualityService = airQualityService;
    }

    /**
     * Get current air quality by city name
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentAirQualityByCity(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city) {
        try {
            AirQualityResponse airQuality = airQualityService.getCurrentAirQualityByCity(city);
            return ResponseEntity.ok(airQuality);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponseMap("City not found: " + city));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponseMap("Air quality service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponseMap("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get current air quality by coordinates
     */
    @GetMapping("/current/coordinates")
    public ResponseEntity<?> getCurrentAirQualityByCoordinates(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude) {
        try {
            AirQualityResponse airQuality = airQualityService.getCurrentAirQualityByLocation(latitude, longitude);
            return ResponseEntity.ok(airQuality);
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponseMap("Air quality service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponseMap("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get air quality forecast
     */
    @GetMapping("/forecast")
    public ResponseEntity<List<AirQualityResponse>> getAirQualityForecast(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(7) int days) {
        try {
            List<AirQualityResponse> forecast = airQualityService.getAirQualityForecast(city, days);
            return ResponseEntity.ok(forecast);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get detailed pollutant information
     */
    @GetMapping("/pollutants")
    public ResponseEntity<Map<String, Object>> getDetailedPollutants(
            @RequestParam @NotBlank String city) {
        try {
            Map<String, Object> pollutants = airQualityService.getDetailedPollutants(city);
            return ResponseEntity.ok(pollutants);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get air quality history
     */
    @GetMapping("/history")
    public ResponseEntity<List<AirQualityResponse>> getAirQualityHistory(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "7") @Min(1) @Max(30) int days) {
        try {
            List<AirQualityResponse> history = airQualityService.getAirQualityHistory(city, days);
            return ResponseEntity.ok(history);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private Map<String, Object> createErrorResponseMap(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", message);
        errorResponse.put("success", false);
        return errorResponse;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Air Quality Service"));
    }
}