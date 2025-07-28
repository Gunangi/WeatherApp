// src/main/java/com/example/weatherapp/service/UserService.java
package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherPreferences;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    // In-memory storage for demo purposes
    private Map<String, WeatherPreferences> userPreferences = new HashMap<>();

    public Optional<WeatherPreferences> getUserPreferences(String userId) {
        WeatherPreferences prefs = userPreferences.getOrDefault(userId, new WeatherPreferences());
        return Optional.of(prefs);
    }

    public boolean updateUserPreferences(String userId, WeatherPreferences preferences) {
        userPreferences.put(userId, preferences);
        return true;
    }
}