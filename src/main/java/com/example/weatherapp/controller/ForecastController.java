package com.example.weatherapp.controller;

import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.service.ForecastService;
import com.example.weatherapp.exception.WeatherServiceException;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.example.weatherapp.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.Max;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ForecastController {

    @Autowired
    private ForecastService forecastService;

    /**
     * Get 5-day weather forecast by city name
     */
    @GetMapping("/daily")
    public ResponseEntity<ForecastResponse> getDailyForecastByCity(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            ForecastResponse forecast = forecastService.getDailyForecastByCity(city, days, units);
            return ResponseEntity.ok(forecast);
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
     * Get hourly forecast by city name
     */
    @GetMapping("/hourly")
    public ResponseEntity<ForecastResponse> getHourlyForecastByCity(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "24") @Min(1) @Max(168) int hours,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            ForecastResponse forecast = forecastService.getHourlyForecastByCity(city, hours, units);
            return ResponseEntity.ok(forecast);
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
     * Get forecast by coordinates
     */
    @GetMapping("/coordinates")
    public ResponseEntity<ForecastResponse> getForecastByCoordinates(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude,
            @RequestParam(defaultValue = "5") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(defaultValue = "daily") String type) {
        try {
            ForecastResponse forecast;
            if ("hourly".equals(type)) {
                forecast = forecastService.getHourlyForecastByLocation(latitude, longitude, days * 24, units);
            } else {
                forecast = forecastService.getForecastByLocation(latitude, longitude, days, units);
            }
            return ResponseEntity.ok(forecast);
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createErrorResponse("Weather service temporarily unavailable"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get extended forecast (up to 14 days)
     */
    @GetMapping("/extended")
    public ResponseEntity<ForecastResponse> getExtendedForecast(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "14") @Min(7) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            ForecastResponse forecast = forecastService.getExtendedForecast(city, days, units);
            return ResponseEntity.ok(forecast);
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
     * Get forecast for specific date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<ForecastResponse> getForecastForDateRange(
            @RequestParam @NotBlank String city,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            if (startDate.isAfter(endDate)) {
                throw new InvalidRequestException("Start date must be before end date");
            }

            if (startDate.isBefore(LocalDate.now()) || endDate.isAfter(LocalDate.now().plusDays(14))) {
                throw new InvalidRequestException("Date range must be within the next 14 days");
            }

            ForecastResponse forecast = forecastService.getForecastForDateRange(city, startDate, endDate, units);
            return ResponseEntity.ok(forecast);
        } catch (InvalidRequestException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));
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
     * Get forecast for multiple cities
     */
    @PostMapping("/multiple")
    public ResponseEntity<Map<String, ForecastResponse>> getForecastForMultipleCities(
            @RequestBody List<String> cities,
            @RequestParam(defaultValue = "5") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            if (cities == null || cities.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            if (cities.size() > 10) {
                return ResponseEntity.badRequest().build(); // Limit to 10 cities
            }

            Map<String, ForecastResponse> forecastMap = forecastService.getForecastForMultipleCities(cities, days, units);
            return ResponseEntity.ok(forecastMap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weekend forecast
     */
    @GetMapping("/weekend")
    public ResponseEntity<ForecastResponse> getWeekendForecast(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            ForecastResponse forecast = forecastService.getWeekendForecast(city, units);
            return ResponseEntity.ok(forecast);
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
     * Get forecast summary for quick overview
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getForecastSummary(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "7") @Min(3) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            Map<String, Object> summary = forecastService.getForecastSummary(city, days, units);
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
     * Get forecast with precipitation details
     */
    @GetMapping("/precipitation")
    public ResponseEntity<Map<String, Object>> getPrecipitationForecast(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            Map<String, Object> precipitation = forecastService.getPrecipitationForecast(city, days, units);
            return ResponseEntity.ok(precipitation);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get temperature trend forecast
     */
    @GetMapping("/temperature-trend")
    public ResponseEntity<Map<String, Object>> getTemperatureTrend(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "7") @Min(3) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            Map<String, Object> trend = forecastService.getTemperatureTrend(city, days, units);
            return ResponseEntity.ok(trend);
        } catch (LocationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (WeatherServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get forecast for outdoor activities
     */
    @GetMapping("/outdoor-activities")
    public ResponseEntity<Map<String, Object>> getForecastForOutdoorActivities(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "7") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(required = false) String activity) {
        try {
            Map<String, Object> forecast = forecastService.getForecastForOutdoorActivities(city, days, units, activity);
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
     * Get hourly forecast for today
     */
    @GetMapping("/today-hourly")
    public ResponseEntity<ForecastResponse> getTodayHourlyForecast(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            ForecastResponse forecast = forecastService.getTodayHourlyForecast(city, units);
            return ResponseEntity.ok(forecast);
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
     * Get forecast alerts and warnings
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getForecastAlerts(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "7") @Min(1) @Max(14) int days) {
        try {
            List<Map<String, Object>> alerts = forecastService.getForecastAlerts(city, days);
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
     * Get forecast by ZIP code
     */
    @GetMapping("/zip")
    public ResponseEntity<ForecastResponse> getForecastByZipCode(
            @RequestParam @NotBlank String zipCode,
            @RequestParam(defaultValue = "US") String countryCode,
            @RequestParam(defaultValue = "5") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            ForecastResponse forecast = forecastService.getForecastByZipCode(zipCode, countryCode, days, units);
            return ResponseEntity.ok(forecast);
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
     * Get forecast with UV index
     */
    @GetMapping("/uv-index")
    public ResponseEntity<Map<String, Object>> getForecastWithUVIndex(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            Map<String, Object> forecast = forecastService.getForecastWithUVIndex(city, days, units);
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
     * Create error response
     */
    private ForecastResponse createErrorResponse(String message) {
        ForecastResponse errorResponse = new ForecastResponse();
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
                "service", "Forecast Service",
                "timestamp", java.time.Instant.now().toString()
        ));
    }