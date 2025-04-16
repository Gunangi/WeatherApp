package com.example.weatherapp.controller;

import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.ForecastData;
import com.example.weatherapp.model.WeatherSearchHistory;
import com.example.weatherapp.service.WeatherService;
import com.example.weatherapp.service.WeatherHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private final WeatherService weatherService;
    private final WeatherHistoryService historyService;

    @Autowired
    public WeatherController(WeatherService weatherService, WeatherHistoryService historyService) {
        this.weatherService = weatherService;
        this.historyService = historyService;
    }

    @GetMapping("/weather")
    public ResponseEntity<?> getWeather(@RequestParam String city, Authentication authentication) {
        try {
            WeatherData weather = weatherService.getWeather(city);

            // Save search to history if user is authenticated
            if (authentication != null) {
                historyService.saveSearch(authentication.getName(), city);
            }

            return ResponseEntity.ok(weather);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/weather/coordinates")
    public ResponseEntity<?> getWeatherByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon,
            Authentication authentication) {
        try {
            WeatherData weather = weatherService.getWeatherByCoordinates(lat, lon);

            // Save search to history if user is authenticated
            if (authentication != null && weather != null) {
                historyService.saveSearch(authentication.getName(), weather.getCity());
            }

            return ResponseEntity.ok(weather);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(@RequestParam String city) {
        try {
            List<ForecastData> forecast = weatherService.getForecast(city);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/forecast/coordinates")
    public ResponseEntity<?> getForecastByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            List<ForecastData> forecast = weatherService.getForecastByCoordinates(lat, lon);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getUserSearchHistory(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        List<WeatherSearchHistory> history = historyService.getUserSearchHistory(authentication.getName());
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteSearchHistory(@PathVariable String id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        boolean deleted = historyService.deleteSearchHistory(id, authentication.getName());

        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to delete this record"));
        }
    }

    @GetMapping("/weather/pollution")
    public ResponseEntity<?> getAirPollution(@RequestParam double lat, @RequestParam double lon) {
        try {
            Map<String, Object> pollutionData = weatherService.getAirPollution(lat, lon);
            return ResponseEntity.ok(pollutionData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
