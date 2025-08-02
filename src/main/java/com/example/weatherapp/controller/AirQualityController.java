package com.example.weatherapp.controller;

import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.service.AirQualityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/air-quality")
@RequiredArgsConstructor
public class AirQualityController {

    private final AirQualityService airQualityService;

    @GetMapping("/{city}")
    public ResponseEntity<AirQualityResponse> getAirQuality(@PathVariable String city) {
        return ResponseEntity.ok(airQualityService.getAirQualityForCity(city));
    }
}