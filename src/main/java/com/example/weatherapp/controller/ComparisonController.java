package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WeatherComparisonDto;
import com.example.weatherapp.service.WeatherComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
public class ComparisonController {

    private final WeatherComparisonService weatherComparisonService;

    @PostMapping
    public ResponseEntity<WeatherComparisonDto> compareCities(@RequestBody List<String> cities) {
        return ResponseEntity.ok(weatherComparisonService.compareWeather(cities));
    }
}