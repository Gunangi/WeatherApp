package com.example.weatherapp.controller;

import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;

    @GetMapping("/{city}")
    public ResponseEntity<ForecastResponse> getForecast(@PathVariable String city) {
        return ResponseEntity.ok(forecastService.getForecastForCity(city));
    }
}