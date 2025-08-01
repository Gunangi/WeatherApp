package com.example.weatherapp.controller;

import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.service.AirQualityService;
import com.example.weatherapp.exception.WeatherServiceException;
import com.example.weatherapp.exception.LocationNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.Max;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/air-quality")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AirQualityController {

    @Autowired
    private AirQualityService airQualityService;

    /**
     * Get current air quality by city name
     */
    @GetMapping("/current")
    public ResponseEntity<AirQualityResponse> getCurrentAirQualityByCity(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city) {
        try {
            AirQualityResponse airQuality = airQualityService.getCurrentAirQualityByCity(city);
            return ResponseEntity.ok(airQuality);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("City not found: " + city));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Air quality service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get current air quality by coordinates
     */
    @GetMapping("/current/coordinates")
    public ResponseEntity<AirQualityResponse> getCurrentAirQualityByCoordinates(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude) {
        try {
            AirQualityResponse airQuality = airQualityService.getCurrentAirQualityByLocation(latitude, longitude);
            return ResponseEntity.ok(airQuality);
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Air quality service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality for multiple cities
     */
    @PostMapping("/multiple")
    public ResponseEntity<Map<String, AirQualityResponse>> getAirQualityForMultipleCities(
            @RequestBody List<String> cities) {
        try {
            if (cities == null || cities.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            if (cities.size() > 10) {
                return ResponseEntity.badRequest().build(); // Limit to 10 cities
            }

            Map<String, AirQualityResponse> airQualityMap = airQualityService.getAirQualityForMultipleCities(cities);
            return ResponseEntity.ok(airQualityMap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality health recommendations
     */
    @GetMapping("/health-recommendations")
    public ResponseEntity<Map<String, Object>> getHealthRecommendations(
            @RequestParam @NotBlank String city) {
        try {
            Map<String, Object> recommendations = airQualityService.getHealthRecommendations(city);
            return ResponseEntity.ok(recommendations);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getAirQualityAlerts(
            @RequestParam @NotBlank String city) {
        try {
            List<Map<String, Object>> alerts = airQualityService.getAirQualityAlerts(city);
            return ResponseEntity.ok(alerts);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality by ZIP code
     */
    @GetMapping("/zip")
    public ResponseEntity<AirQualityResponse> getAirQualityByZipCode(
            @RequestParam @NotBlank String zipCode,
            @RequestParam(defaultValue = "US") String countryCode) {
        try {
            AirQualityResponse airQuality = airQualityService.getAirQualityByZipCode(zipCode, countryCode);
            return ResponseEntity.ok(airQuality);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Location not found for ZIP code: " + zipCode));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Air quality service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get air quality summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getAirQualitySummary(
            @RequestParam @NotBlank String city) {
        try {
            Map<String, Object> summary = airQualityService.getAirQualitySummary(city);
            return ResponseEntity.ok(summary);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality trends
     */
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getAirQualityTrends(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "30") @Min(7) @Max(90) int days) {
        try {
            Map<String, Object> trends = airQualityService.getAirQualityTrends(city, days);
            return ResponseEntity.ok(trends);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get hourly air quality data
     */
    @GetMapping("/hourly")
    public ResponseEntity<List<AirQualityResponse>> getHourlyAirQuality(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "24") @Min(1) @Max(72) int hours) {
        try {
            List<AirQualityResponse> hourlyData = airQualityService.getHourlyAirQuality(city, hours);
            return ResponseEntity.ok(hourlyData);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare air quality between cities
     */
    @PostMapping("/compare")
    public ResponseEntity<Map<String, Object>> compareAirQualityBetweenCities(
            @RequestBody List<String> cities) {
        try {
            if (cities == null || cities.size() < 2) {
                return ResponseEntity.badRequest().build();
            }

            if (cities.size() > 5) {
                return ResponseEntity.badRequest().build(); // Limit to 5 cities for comparison
            }

            Map<String, Object> comparison = airQualityService.compareAirQualityBetweenCities(cities);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality for outdoor activities
     */
    @GetMapping("/outdoor-activities")
    public ResponseEntity<Map<String, Object>> getAirQualityForOutdoorActivities(
            @RequestParam @NotBlank String city,
            @RequestParam(required = false) String activity,
            @RequestParam(required = false) String sensitivityLevel) {
        try {
            Map<String, Object> recommendations = airQualityService.getAirQualityForOutdoorActivities(
                    city, activity, sensitivityLevel);
            return ResponseEntity.ok(recommendations);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality heatmap data
     */
    @GetMapping("/heatmap")
    public ResponseEntity<Map<String, Object>> getAirQualityHeatmapData(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double centerLat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double centerLon,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int radius) {
        try {
            Map<String, Object> heatmapData = airQualityService.getAirQualityHeatmapData(centerLat, centerLon, radius);
            return ResponseEntity.ok(heatmapData);
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get nearest monitoring stations
     */
    @GetMapping("/monitoring-stations")
    public ResponseEntity<List<Map<String, Object>>> getNearestMonitoringStations(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit) {
        try {
            List<Map<String, Object>> stations = airQualityService.getNearestMonitoringStations(latitude, longitude, limit);
            return ResponseEntity.ok(stations);
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAirQualityStatistics(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "30") @Min(7) @Max(365) int days) {
        try {
            Map<String, Object> statistics = airQualityService.getAirQualityStatistics(city, days);
            return ResponseEntity.ok(statistics);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get air quality for sensitive groups
     */
    @GetMapping("/sensitive-groups")
    public ResponseEntity<Map<String, Object>> getAirQualityForSensitiveGroups(
            @RequestParam @NotBlank String city,
            @RequestParam(required = false) String group) {
        try {
            Map<String, Object> recommendations = airQualityService.getAirQualityForSensitiveGroups(city, group);
            return ResponseEntity.ok(recommendations);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create error response
     */
    private AirQualityResponse createErrorResponse(String message) {
        AirQualityResponse errorResponse = new AirQualityResponse();
        errorResponse.setError(message);
        errorResponse.setSuccess(false);
        return errorResponse;
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Air Quality Service",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}