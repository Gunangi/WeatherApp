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
import java.util.List; // Assuming LocationDto is an array/list

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "*")
@Validated // Added to enable validation on request parameters
public class ForecastController {

    private final ForecastService forecastService;

    // Use constructor injection for better practice
    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    /**
     * Get daily weather forecast by city name
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
     * Get daily weather forecast by coordinates
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
     * Get hourly weather forecast for next 24-48 hours
     */
    @GetMapping("/hourly")
    public ResponseEntity<ForecastResponse> getHourlyForecast(
            @RequestParam @NotBlank(message = "City name cannot be empty") String city,
            @RequestParam(defaultValue = "24") @Min(1) @Max(48) int hours,
            @RequestParam(defaultValue = "metric") String units) {

        ForecastResponse forecast = forecastService.getHourlyForecast(city, hours, units);
        return ResponseEntity.ok(forecast);
    }

    // ... all other controller endpoints from your file ...
    // They will now map correctly to the methods in the updated service.
}