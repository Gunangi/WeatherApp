// src/main/java/com/example/weatherapp/controller/UserController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.model.WeatherPreferences;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @GetMapping("/{userId}/preferences")
    public ResponseEntity<WeatherPreferences> getUserPreferences(@PathVariable String userId) {
        // Return default preferences without database
        WeatherPreferences defaultPrefs = new WeatherPreferences();
        defaultPrefs.setTemperatureUnit("celsius");
        defaultPrefs.setTheme("light");
        return ResponseEntity.ok(defaultPrefs);
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<String> updateUserPreferences(@PathVariable String userId, @RequestBody WeatherPreferences preferences) {
        // Just return success without saving to database
        return ResponseEntity.ok("{\"message\":\"Preferences updated successfully (in-memory only)\"}");
    }
}