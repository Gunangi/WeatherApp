package com.example.weatherapp.controller;

import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.service.UserPreferencesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    @Autowired
    public UserPreferencesController(UserPreferencesService preferencesService) {
        this.preferencesService = preferencesService;
    }

    @GetMapping
    public ResponseEntity<UserPreferences> getUserPreferences(Authentication authentication) {
        String username = authentication.getName();
        UserPreferences preferences = preferencesService.getUserPreferences(username);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping
    public ResponseEntity<UserPreferences> updateUserPreferences(
            Authentication authentication,
            @RequestBody UserPreferences updatedPreferences) {
        String username = authentication.getName();
        UserPreferences preferences = preferencesService.updateUserPreferences(username, updatedPreferences);
        return ResponseEntity.ok(preferences);
    }
}