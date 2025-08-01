package com.example.weatherapp.controller;

import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.dto.LocationDto;
import com.example.weatherapp.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "*")
@Validated
public class ForecastController {

    private final ForecastService forecastService;

    // Use constructor injection for better dependency management
    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    /**
     * Get daily weather forecast by city name.
     */
    @GetMapping("/daily")
    public ResponseEntity<ForecastResponse> getDailyForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(16) int days,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getDailyForecast(city, days, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get daily weather forecast by coordinates.
     */
    @GetMapping("/daily/coordinates")
    public ResponseEntity<ForecastResponse> getDailyForecastByCoordinates(
            @RequestParam @Min(-90) @Max(90) double lat,
            @RequestParam @Min(-180) @Max(180) double lon,
            @RequestParam(defaultValue = "5") @Min(1) @Max(16) int days,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getDailyForecastByCoordinates(lat, lon, days, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get hourly weather forecast for the next 24-48 hours.
     */
    @GetMapping("/hourly")
    public ResponseEntity<ForecastResponse> getHourlyForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "24") @Min(1) @Max(48) int hours,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getHourlyForecast(city, hours, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get hourly weather forecast by coordinates.
     */
    @GetMapping("/hourly/coordinates")
    public ResponseEntity<ForecastResponse> getHourlyForecastByCoordinates(
            @RequestParam @Min(-90) @Max(90) double lat,
            @RequestParam @Min(-180) @Max(180) double lon,
            @RequestParam(defaultValue = "24") @Min(1) @Max(48) int hours,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getHourlyForecastByCoordinates(lat, lon, hours, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get weather forecast for a specific date range.
     */
    @GetMapping("/range")
    public ResponseEntity<ForecastResponse> getForecastByDateRange(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "metric") String units) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        ForecastResponse forecast = forecastService.getForecastByDateRange(city, start, end, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get a detailed forecast for multiple locations for travel planning.
     */
    @PostMapping("/multi-location")
    public ResponseEntity<ForecastResponse> getMultiLocationForecast(
            @Valid @RequestBody List<LocationDto> locations,
            @RequestParam(defaultValue = "5") @Min(1) @Max(10) int days,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getMultiLocationForecast(locations, days, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get an extended forecast (e.g., up to 14 days).
     */
    @GetMapping("/extended")
    public ResponseEntity<ForecastResponse> getExtendedForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "14") @Min(7) @Max(16) int days,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getExtendedForecast(city, days, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get a forecast with additional weather parameters like UV index and air quality.
     */
    @GetMapping("/detailed")
    public ResponseEntity<ForecastResponse> getDetailedForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(10) int days,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(defaultValue = "false") boolean includeUvIndex,
            @RequestParam(defaultValue = "false") boolean includeAirQuality) {
        ForecastResponse forecast = forecastService.getDetailedForecast(
                city, days, units, includeUvIndex, includeAirQuality);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get a weather forecast for specific event or activity planning.
     */
    @GetMapping("/event")
    public ResponseEntity<ForecastResponse> getEventForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam String eventDate,
            @RequestParam String eventTime,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(defaultValue = "outdoor") String activityType) {
        ForecastResponse forecast = forecastService.getEventForecast(
                city, eventDate, eventTime, units, activityType);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get a marine or coastal weather forecast.
     */
    @GetMapping("/marine")
    public ResponseEntity<ForecastResponse> getMarineForecast(
            @RequestParam @Min(-90) @Max(90) double lat,
            @RequestParam @Min(-180) @Max(180) double lon,
            @RequestParam(defaultValue = "5") @Min(1) @Max(7) int days,
            @RequestParam(defaultValue = "metric") String units) {
        ForecastResponse forecast = forecastService.getMarineForecast(lat, lon, days, units);
        return ResponseEntity.ok(forecast);
    }

    /**
     * Get an agricultural weather forecast.
     */
    @GetMapping("/agriculture")
    public ResponseEntity<ForecastResponse> getAgriculturalForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "7") @Min(3) @Max(14) int days,
            @RequestParam(defaultValue = "metric") String units,
            @RequestParam(defaultValue = "general") String cropType) {
        ForecastResponse forecast = forecastService.getAgriculturalForecast(city, days, units, cropType);
        return ResponseEntity.ok(forecast);
    }
}