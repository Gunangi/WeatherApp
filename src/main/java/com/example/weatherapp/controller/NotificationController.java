package com.example.weatherapp.controller;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/alerts/{city}")
    public ResponseEntity<List<WeatherAlert>> getAlerts(@PathVariable String city) {
        return ResponseEntity.ok(notificationService.getAlertsForCity(city));
    }
}