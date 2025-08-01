package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WeatherComparisonDto;
import com.example.weatherapp.service.WeatherComparisonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comparison")
@CrossOrigin(origins = "*")
@Validated
public class ComparisonController {

    private final WeatherComparisonService weatherComparisonService;

    // Use constructor injection instead of @Autowired on the field
    public ComparisonController(WeatherComparisonService weatherComparisonService) {
        this.weatherComparisonService = weatherComparisonService;
    }

    /**
     * Compare current weather between multiple cities
     */
    @PostMapping("/current")
    public ResponseEntity<WeatherComparisonDto> compareCurrentWeather(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            WeatherComparisonDto comparison = weatherComparisonService.compareCurrentWeather(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare weather forecasts between multiple cities
     */
    @PostMapping("/forecast")
    public ResponseEntity<Map<String, Object>> compareForecast(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam(defaultValue = "5") int days) {
        try {
            // Updated to call the newly implemented service method
            Map<String, Object> comparison = weatherComparisonService.compareForecast(locations, days);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare two specific cities in detail
     */
    @GetMapping("/cities")
    public ResponseEntity<Map<String, Object>> compareTwoCities(
            @RequestParam double lat1, @RequestParam double lon1, @RequestParam String city1,
            @RequestParam double lat2, @RequestParam double lon2, @RequestParam String city2) {
        try {
            // Updated to call the newly implemented service method
            Map<String, Object> comparison = weatherComparisonService.compareTwoCities(
                    lat1, lon1, city1, lat2, lon2, city2);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare air quality between cities
     */
    @PostMapping("/air-quality")
    public ResponseEntity<Map<String, Object>> compareAirQuality(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            // Updated to call the newly implemented service method
            Map<String, Object> comparison = weatherComparisonService.compareAirQuality(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}