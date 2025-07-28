package com.example.weatherapp.controller;

import com.example.weatherapp.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend
public class WeatherController {

    private final WeatherService weatherService;

    // Constructor injection instead of @Autowired
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/current")
    public ResponseEntity<String> getCurrentWeather(@RequestParam String city) {
        try {
            String weatherData = weatherService.getCurrentWeather(city);
            return ResponseEntity.ok(weatherData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to fetch weather data for " + city + "\"}");
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<String> getForecast(@RequestParam String city) {
        try {
            String forecastData = weatherService.getForecast(city);
            return ResponseEntity.ok(forecastData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to fetch forecast data for " + city + "\"}");
        }
    }

    @GetMapping("/air-pollution")
    public ResponseEntity<String> getAirPollution(@RequestParam double lat, @RequestParam double lon) {
        try {
            String airPollutionData = weatherService.getAirPollution(lat, lon);
            return ResponseEntity.ok(airPollutionData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to fetch air pollution data\"}");
        }
    }
}