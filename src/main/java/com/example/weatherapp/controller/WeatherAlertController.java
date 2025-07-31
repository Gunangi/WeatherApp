// src/main/java/com/example/weatherapp/controller/WeatherAlertController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.service.WeatherAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:3000")
public class WeatherAlertController {

    @Autowired
    private WeatherAlertService alertService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<WeatherAlert>> getUserAlerts(@PathVariable String userId) {
        List<WeatherAlert> alerts = alertService.getUserAlerts(userId);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{userId}/active")
    public ResponseEntity<List<WeatherAlert>> getActiveUserAlerts(@PathVariable String userId) {
        List<WeatherAlert> alerts = alertService.getActiveUserAlerts(userId);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<WeatherAlert> createAlert(@PathVariable String userId,
                                                    @Valid @RequestBody WeatherAlert alert) {
        try {
            WeatherAlert createdAlert = alertService.createAlert(userId, alert);
            return ResponseEntity.ok(createdAlert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{alertId}")
    public ResponseEntity<WeatherAlert> updateAlert(@PathVariable String alertId,
                                                    @Valid @RequestBody WeatherAlert alert) {
        try {
            WeatherAlert updatedAlert = alertService.updateAlert(alertId, alert);
            return ResponseEntity.ok(updatedAlert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<String> deleteAlert(@PathVariable String alertId) {
        try {
            alertService.deleteAlert(alertId);
            return ResponseEntity.ok("{\"message\":\"Alert deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to delete alert\"}");
        }
    }

    @PostMapping("/{alertId}/toggle")
    public ResponseEntity<WeatherAlert> toggleAlert(@PathVariable String alertId) {
        try {
            WeatherAlert alert = alertService.toggleAlert(alertId);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/types")
    public ResponseEntity<AlertType[]> getAlertTypes() {
        return ResponseEntity.ok(AlertType.values());
    }

    @PostMapping("/test/{alertId}")
    public ResponseEntity<String> testAlert(@PathVariable String alertId) {
        try {
            alertService.testAlert(alertId);
            return ResponseEntity.ok("{\"message\":\"Test alert sent successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to send test alert\"}");
        }
    }
}