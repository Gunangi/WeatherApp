package com.example.weatherapp.controller;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.service.WeatherAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class WeatherAlertController {

    private final WeatherAlertService alertService;

    @Autowired
    public WeatherAlertController(WeatherAlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<WeatherAlert>> getUserAlerts(Authentication authentication) {
        String username = authentication.getName();
        List<WeatherAlert> alerts = alertService.getUserAlerts(username);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping
    public ResponseEntity<WeatherAlert> createAlert(
            Authentication authentication,
            @RequestBody WeatherAlert alert) {
        String username = authentication.getName();
        alert.setUsername(username);
        WeatherAlert savedAlert = alertService.createAlert(alert);
        return ResponseEntity.ok(savedAlert);
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<?> deleteAlert(
            Authentication authentication,
            @PathVariable String alertId) {
        String username = authentication.getName();
        boolean deleted = alertService.deleteAlert(alertId, username);

        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{alertId}/status")
    public ResponseEntity<WeatherAlert> toggleAlertStatus(
            Authentication authentication,
            @PathVariable String alertId,
            @RequestParam boolean active) {
        String username = authentication.getName();
        WeatherAlert updated = alertService.toggleAlertStatus(alertId, username, active);

        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}