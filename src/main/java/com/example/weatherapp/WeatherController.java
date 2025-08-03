package com.example.weatherapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private UserRepository userRepository;

    // Current weather endpoint
    @GetMapping("/weather")
    public ResponseEntity<WeatherResponse> getCurrentWeather(
            @RequestParam String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getCurrentWeather(city, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Current weather by coordinates
    @GetMapping("/weather/coordinates")
    public ResponseEntity<WeatherResponse> getCurrentWeatherByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getCurrentWeatherByCoordinates(lat, lon, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 5-day forecast
    @GetMapping("/forecast")
    public ResponseEntity<WeatherResponse> getForecast(
            @RequestParam String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getForecast(city, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Hourly forecast (24 hours)
    @GetMapping("/forecast/hourly")
    public ResponseEntity<WeatherResponse> getHourlyForecast(
            @RequestParam String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getHourlyForecast(city, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Air quality data
    @GetMapping("/air-quality")
    public ResponseEntity<WeatherResponse> getAirQuality(
            @RequestParam String city) {
        try {
            WeatherResponse response = weatherService.getAirQuality(city);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Historical weather data
    @GetMapping("/history")
    public ResponseEntity<WeatherResponse> getHistoricalWeather(
            @RequestParam String city,
            @RequestParam long timestamp,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getHistoricalWeather(city, timestamp, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // UV Index
    @GetMapping("/uv")
    public ResponseEntity<WeatherResponse> getUVIndex(
            @RequestParam String city) {
        try {
            WeatherResponse response = weatherService.getUVIndex(city);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Activity recommendations
    @GetMapping("/recommendations/activities")
    public ResponseEntity<WeatherResponse> getActivityRecommendations(
            @RequestParam String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getActivityRecommendations(city, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Clothing suggestions
    @GetMapping("/recommendations/clothing")
    public ResponseEntity<WeatherResponse> getClothingRecommendations(
            @RequestParam String city,
            @RequestParam(defaultValue = "metric") String units) {
        try {
            WeatherResponse response = weatherService.getClothingRecommendations(city, units);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // User preferences endpoints
    @PostMapping("/preferences")
    public ResponseEntity<UserPreferences> savePreferences(@RequestBody UserPreferences preferences) {
        try {
            UserPreferences saved = userRepository.save(preferences);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<UserPreferences> getPreferences(@PathVariable String userId) {
        Optional<UserPreferences> preferences = userRepository.findByUserId(userId);
        return preferences.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<UserPreferences> updatePreferences(
            @PathVariable String userId,
            @RequestBody Map<String, Object> updates) {
        Optional<UserPreferences> existingPrefs = userRepository.findByUserId(userId);
        if (existingPrefs.isPresent()) {
            UserPreferences prefs = existingPrefs.get();

            // Update fields based on the provided map
            if (updates.containsKey("temperatureUnit")) {
                prefs.setTemperatureUnit((String) updates.get("temperatureUnit"));
            }
            if (updates.containsKey("theme")) {
                prefs.setTheme((String) updates.get("theme"));
            }
            if (updates.containsKey("defaultCity")) {
                prefs.setDefaultCity((String) updates.get("defaultCity"));
            }
            if (updates.containsKey("notifications")) {
                prefs.setNotifications((Boolean) updates.get("notifications"));
            }

            UserPreferences updated = userRepository.save(prefs);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // City search suggestions
    @GetMapping("/cities/search")
    public ResponseEntity<WeatherResponse> searchCities(@RequestParam String query) {
        try {
            WeatherResponse response = weatherService.searchCities(query);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}