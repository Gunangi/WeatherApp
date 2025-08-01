package com.weatherapp.controller;

import com.weatherapp.dto.WeatherResponse;
import com.weatherapp.dto.WeatherComparisonDto;
import com.weatherapp.service.WeatherService;
import com.weatherapp.service.WeatherComparisonService;
import com.weatherapp.exception.WeatherServiceException;
import com.weatherapp.exception.LocationNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private WeatherComparisonService weatherComparisonService;

    /**
     * Get current weather by city name
     */
    @GetMapping("/current")
    public ResponseEntity<WeatherResponse> getCurrentWeatherByCity(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse weather = weatherService.getCurrentWeatherByCity(city, units);
            return ResponseEntity.ok(weather);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("City not found: " + city));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get current weather by coordinates
     */
    @GetMapping("/current/coordinates")
    public ResponseEntity<WeatherResponse> getCurrentWeatherByCoordinates(
            @RequestParam @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
            @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90") Double latitude,
            @RequestParam @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
            @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180") Double longitude,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse weather = weatherService.getCurrentWeatherByLocation(latitude, longitude, units);
            return ResponseEntity.ok(weather);
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get current weather with detailed metrics
     */
    @GetMapping("/current/detailed")
    public ResponseEntity<WeatherResponse> getDetailedCurrentWeather(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(defaultValue = "true") boolean includeMetrics,
            @RequestParam(defaultValue = "true") boolean includeAstronomy) {
        try {
            WeatherResponse weather = weatherService.getDetailedCurrentWeather(
                    city, units, includeMetrics, includeAstronomy);
            return ResponseEntity.ok(weather);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("City not found: " + city));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get weather for multiple cities
     */
    @PostMapping("/current/multiple")
    public ResponseEntity<Map<String, WeatherResponse>> getCurrentWeatherForMultipleCities(
            @RequestBody List<String> cities,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            if (cities == null || cities.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            if (cities.size() > 10) {
                return ResponseEntity.badRequest().build(); // Limit to 10 cities
            }

            Map<String, WeatherResponse> weatherMap = weatherService.getCurrentWeatherForMultipleCities(cities, units);
            return ResponseEntity.ok(weatherMap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare current weather between cities
     */
    @PostMapping("/compare")
    public ResponseEntity<WeatherComparisonDto> compareWeatherBetweenCities(
            @RequestBody List<String> cities,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            if (cities == null || cities.size() < 2) {
                return ResponseEntity.badRequest().build();
            }

            if (cities.size() > 5) {
                return ResponseEntity.badRequest().build(); // Limit to 5 cities for comparison
            }

            WeatherComparisonDto comparison = weatherComparisonService.compareWeatherBetweenCities(cities, units);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather by ZIP code
     */
    @GetMapping("/current/zip")
    public ResponseEntity<WeatherResponse> getCurrentWeatherByZipCode(
            @RequestParam @NotBlank String zipCode,
            @RequestParam(defaultValue = "US") String countryCode,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse weather = weatherService.getCurrentWeatherByZipCode(zipCode, countryCode, units);
            return ResponseEntity.ok(weather);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Location not found for ZIP code: " + zipCode));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get weather alerts for a location
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getWeatherAlerts(
            @RequestParam @NotBlank String city) {
        try {
            List<Map<String, Object>> alerts = weatherService.getWeatherAlerts(city);
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
     * Get current weather with caching preference
     */
    @GetMapping("/current/cached")
    public ResponseEntity<WeatherResponse> getCachedCurrentWeather(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(defaultValue = "300") int maxCacheAgeSeconds) {
        try {
            WeatherResponse weather = weatherService.getCachedCurrentWeather(city, units, maxCacheAgeSeconds);
            return ResponseEntity.ok(weather);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("City not found: " + city));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get weather summary for dashboard
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getWeatherSummary(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            Map<String, Object> summary = weatherService.getWeatherSummary(city, units);
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
     * Search weather by partial city name
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchWeatherByCityName(
            @RequestParam @NotBlank String query,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            if (query.length() < 2) {
                return ResponseEntity.badRequest().build();
            }

            List<Map<String, Object>> searchResults = weatherService.searchWeatherByCityName(query, limit);
            return ResponseEntity.ok(searchResults);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather trends for a city (last 7 days)
     */
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getWeatherTrends(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "7") int days) {
        try {
            if (days < 1 || days > 30) {
                return ResponseEntity.badRequest().build();
            }

            Map<String, Object> trends = weatherService.getWeatherTrends(city, days);
            return ResponseEntity.ok(trends);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather health impact assessment
     */
    @GetMapping("/health-impact")
    public ResponseEntity<Map<String, Object>> getWeatherHealthImpact(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            Map<String, Object> healthImpact = weatherService.getWeatherHealthImpact(city, units);
            return ResponseEntity.ok(healthImpact);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Refresh weather data for a city (force update)
     */
    @PostMapping("/refresh")
    public ResponseEntity<WeatherResponse> refreshWeatherData(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse weather = weatherService.refreshWeatherData(city, units);
            return ResponseEntity.ok(weather);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("City not found: " + city));
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Create error response
     */
    private WeatherResponse createErrorResponse(String message) {
        WeatherResponse errorResponse = new WeatherResponse();
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
                "service", "Weather Service",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}