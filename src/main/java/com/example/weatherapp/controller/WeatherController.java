package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/{city}")
    public ResponseEntity<WeatherResponse> getCurrentWeather(
            @PathVariable String city,
            @RequestParam(required = false) String userId) { // userId for history
        return ResponseEntity.ok(weatherService.getWeatherForCity(city, userId));
    }
}