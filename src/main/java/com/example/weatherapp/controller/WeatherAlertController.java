package com.example.weatherapp.controller;


import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.service.UserService;
import com.example.weatherapp.service.WeatherAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/alerts")
public class WeatherAlertController {

    private final WeatherAlertService alertService;
    private final UserService userService;

    public WeatherAlertController(WeatherAlertService alertService, UserService userService) {
        this.alertService = alertService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<WeatherAlert>> getUserAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        List<WeatherAlert> alerts = alertService.getUserAlerts(user);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/active")
    public ResponseEntity<List<WeatherAlert>> getActiveAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        List<WeatherAlert> activeAlerts = alertService.getActiveAlerts(user);
        return ResponseEntity.ok(activeAlerts);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<WeatherAlert>> getUnreadAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        List<WeatherAlert> unreadAlerts = alertService.getUnreadAlerts(user);
        return ResponseEntity.ok(unreadAlerts);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<WeatherAlert> markAlertAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        WeatherAlert alert = alertService.markAlertAsRead(user, id);
        return ResponseEntity.ok(alert);
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAlertsAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        alertService.markAllAlertsAsRead(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        alertService.deleteAlert(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<WeatherAlert>> getLocationAlerts(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long locationId) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        List<WeatherAlert> locationAlerts = alertService.getLocationAlerts(user, locationId);
        return ResponseEntity.ok(locationAlerts);
    }

    @PostMapping("/subscribe/{locationId}")
    public ResponseEntity<Void> subscribeToAlerts(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long locationId) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        alertService.subscribeToAlerts(user, locationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/unsubscribe/{locationId}")
    public ResponseEntity<Void> unsubscribeFromAlerts(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long locationId) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        alertService.unsubscribeFromAlerts(user, locationId);
        return ResponseEntity.noContent().build();
    }
}