package com.example.weatherapp.controller;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all active weather alerts for a user
     */
    @GetMapping("/alerts/{userId}")
    public ResponseEntity<List<WeatherAlert>> getWeatherAlerts(@PathVariable String userId) {
        try {
            List<WeatherAlert> alerts = notificationService.getActiveAlerts(userId);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather alerts for a specific location
     */
    @GetMapping("/alerts/{userId}/location")
    public ResponseEntity<List<WeatherAlert>> getLocationAlerts(
            @PathVariable String userId,
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            List<WeatherAlert> alerts = notificationService.getLocationAlerts(userId, lat, lon);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new weather alert
     */
    @PostMapping("/alerts/{userId}")
    public ResponseEntity<WeatherAlert> createWeatherAlert(
            @PathVariable String userId,
            @Valid @RequestBody WeatherAlert alert) {
        try {
            alert.setUserId(userId);
            WeatherAlert createdAlert = notificationService.createAlert(alert);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAlert);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing weather alert
     */
    @PutMapping("/alerts/{userId}/{alertId}")
    public ResponseEntity<WeatherAlert> updateWeatherAlert(
            @PathVariable String userId,
            @PathVariable String alertId,
            @Valid @RequestBody WeatherAlert alert) {
        try {
            alert.setId(alertId);
            alert.setUserId(userId);
            WeatherAlert updatedAlert = notificationService.updateAlert(alert);
            return ResponseEntity.ok(updatedAlert);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a weather alert
     */
    @DeleteMapping("/alerts/{userId}/{alertId}")
    public ResponseEntity<Void> deleteWeatherAlert(
            @PathVariable String userId,
            @PathVariable String alertId) {
        try {
            notificationService.deleteAlert(userId, alertId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Enable/disable a weather alert
     */
    @PatchMapping("/alerts/{userId}/{alertId}/toggle")
    public ResponseEntity<WeatherAlert> toggleAlert(
            @PathVariable String userId,
            @PathVariable String alertId,
            @RequestParam boolean enabled) {
        try {
            WeatherAlert alert = notificationService.toggleAlert(userId, alertId, enabled);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Set up push notification subscription
     */
    @PostMapping("/subscribe/{userId}")
    public ResponseEntity<Map<String, String>> subscribeToPushNotifications(
            @PathVariable String userId,
            @RequestBody Map<String, Object> subscriptionData) {
        try {
            String subscriptionId = notificationService.subscribeToPushNotifications(userId, subscriptionData);
            return ResponseEntity.ok(Map.of("subscriptionId", subscriptionId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    @DeleteMapping("/unsubscribe/{userId}")
    public ResponseEntity<Void> unsubscribeFromPushNotifications(@PathVariable String userId) {
        try {
            notificationService.unsubscribeFromPushNotifications(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Send test notification
     */
    @PostMapping("/test/{userId}")
    public ResponseEntity<Map<String, String>> sendTestNotification(
            @PathVariable String userId,
            @RequestBody Map<String, String> testData) {
        try {
            String result = notificationService.sendTestNotification(userId, testData);
            return ResponseEntity.ok(Map.of("result", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get notification preferences for user
     */
    @GetMapping("/preferences/{userId}")
    public ResponseEntity<Map<String, Object>> getNotificationPreferences(@PathVariable String userId) {
        try {
            Map<String, Object> preferences = notificationService.getNotificationPreferences(userId);
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update notification preferences
     */
    @PutMapping("/preferences/{userId}")
    public ResponseEntity<Map<String, Object>> updateNotificationPreferences(
            @PathVariable String userId,
            @RequestBody Map<String, Object> preferences) {
        try {
            Map<String, Object> updatedPreferences = notificationService.updateNotificationPreferences(userId, preferences);
            return ResponseEntity.ok(updatedPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get severe weather alerts for a region
     */
    @GetMapping("/severe-weather")
    public ResponseEntity<List<WeatherAlert>> getSevereWeatherAlerts(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "50") int radius) {
        try {
            List<WeatherAlert> severeAlerts = notificationService.getSevereWeatherAlerts(lat, lon, radius);
            return ResponseEntity.ok(severeAlerts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/alerts/{userId}/{alertId}/read")
    public ResponseEntity<WeatherAlert> markAsRead(
            @PathVariable String userId,
            @PathVariable String alertId) {
        try {
            WeatherAlert alert = notificationService.markAlertAsRead(userId, alertId);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get notification history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<WeatherAlert>> getNotificationHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<WeatherAlert> history = notificationService.getNotificationHistory(userId, page, size);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Clear all notifications for user
     */
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Void> clearAllNotifications(@PathVariable String userId) {
        try {
            notificationService.clearAllNotifications(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}