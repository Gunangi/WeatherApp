package com.example.weatherapp.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/preferences")
public class UserSettingsController {

    private final Map<String, Object> userPreferences = new HashMap<>();

    @GetMapping
    public Map<String, Object> getPreferences() {
        return userPreferences;
    }

    @PostMapping
    public Map<String, Object> savePreferences(@RequestBody Map<String, Object> preferences) {
        userPreferences.clear();
        userPreferences.putAll(preferences);
        return userPreferences;
    }
}
