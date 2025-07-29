// src/main/java/com/example/weatherapp/controller/UserController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.model.EnhancedWeatherPreferences;
import com.example.weatherapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}/preferences")
    public ResponseEntity<EnhancedWeatherPreferences> getUserPreferences(@PathVariable String userId) {
        Optional<EnhancedWeatherPreferences> preferences = userService.getUserPreferences(userId);
        if (preferences.isPresent()) {
            return ResponseEntity.ok(preferences.get());
        } else {
            // Return default preferences if user not found
            EnhancedWeatherPreferences defaultPrefs = new EnhancedWeatherPreferences();
            return ResponseEntity.ok(defaultPrefs);
        }
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<String> updateUserPreferences(@PathVariable String userId, @RequestBody EnhancedWeatherPreferences preferences) {
        boolean updated = userService.updateUserPreferences(userId, preferences);
        if (updated) {
            return ResponseEntity.ok("{\"message\":\"Preferences updated successfully\"}");
        } else {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to update preferences\"}");
        }
    }

    @PostMapping("/{userId}")
    public ResponseEntity<String> createUser(@PathVariable String userId, @RequestBody EnhancedWeatherPreferences preferences) {
        boolean created = userService.createUser(userId, preferences);
        if (created) {
            return ResponseEntity.ok("{\"message\":\"User created successfully\"}");
        } else {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to create user\"}");
        }
    }
}