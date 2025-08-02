package com.example.weatherapp.controller;

import com.example.weatherapp.model.HistoricalWeather;
import com.example.weatherapp.service.HistoricalWeatherService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/historical")
@RequiredArgsConstructor
public class HistoricalController {

    private final HistoricalWeatherService historicalWeatherService;

    @GetMapping("/{city}")
    public ResponseEntity<List<HistoricalWeather>> getHistoricalData(
            @PathVariable String city,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(historicalWeatherService.getHistoricalWeather(city, startDate, endDate));
    }
}