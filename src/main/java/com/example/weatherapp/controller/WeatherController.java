package com.example.weatherapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;
    private final WeatherApiService weatherApiService;
    private final WeatherReportRepository weatherReportRepository;

    public WeatherController(
            WeatherService weatherService,
            WeatherApiService weatherApiService,
            WeatherReportRepository weatherReportRepository) {
        this.weatherService = weatherService;
        this.weatherApiService = weatherApiService;
        this.weatherReportRepository = weatherReportRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentWeather(@RequestParam String city) {
        try {
            WeatherData weatherData = weatherApiService.getCurrentWeather(city);
            return ResponseEntity.ok(weatherData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching current weather: " + e.getMessage());
        }
    }

    @GetMapping("/coordinates")
    public ResponseEntity<?> getWeatherByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            WeatherData weatherData = weatherApiService.getWeatherByCoordinates(lat, lon);
            return ResponseEntity.ok(weatherData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching weather by coordinates: " + e.getMessage());
        }
    }


    @GetMapping("/forecast/hourly")
    public ResponseEntity<?> getHourlyForecast(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "24") int hours) {
        try {
            List<Map<String, Object>> hourlyForecast = weatherApiService.getHourlyForecast(lat, lon, hours);
            return ResponseEntity.ok(hourlyForecast);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching hourly forecast: " + e.getMessage());
        }
    }

    @GetMapping("/historical")
    public ResponseEntity<?> getHistoricalWeather(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam String period) {
        try {
            Map<String, Object> historicalData = weatherApiService.getHistoricalWeather(lat, lon, period);
            return ResponseEntity.ok(historicalData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching historical weather: " + e.getMessage());
        }
    }

    @GetMapping("/air-pollution")
    public ResponseEntity<?> getAirPollution(@RequestParam double lat, @RequestParam double lon) {
        try {
            Map<String, Object> airPollutionData = weatherApiService.getAirPollution(lat, lon);
            return ResponseEntity.ok(airPollutionData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching air pollution data: " + e.getMessage());
        }
    }

    @GetMapping("/alerts")
    public ResponseEntity<?> getWeatherAlerts(@RequestParam double lat, @RequestParam double lon) {
        try {
            List<WeatherAlert> alerts = weatherApiService.getWeatherAlerts(lat, lon);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching weather alerts: " + e.getMessage());
        }
    }

    @GetMapping("/compare")
    public ResponseEntity<?> compareCities(@RequestParam List<String> cities) {
        try {
            List<Map<String, Object>> comparisonData = weatherApiService.compareCities(cities);
            return ResponseEntity.ok(comparisonData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error comparing cities: " + e.getMessage());
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getWeatherRecommendations(@RequestParam double lat, @RequestParam double lon) {
        try {
            Map<String, Object> recommendations = weatherApiService.getWeatherRecommendations(lat, lon);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating recommendations: " + e.getMessage());
        }
    }

    @PostMapping("/reports")
    public ResponseEntity<?> submitWeatherReport(@RequestBody WeatherReport report) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            report.setUsername(username);

            WeatherReport savedReport = weatherReportRepository.save(report);
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error submitting weather report: " + e.getMessage());
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getCommunityReports(@RequestParam double lat, @RequestParam double lon, @RequestParam double radius) {
        try {
            List<WeatherReport> reports = weatherService.getNearbyReports(lat, lon, radius);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching community reports: " + e.getMessage());
        }
    }

    @GetMapping("/widget")
    public ResponseEntity<?> getWidgetData(@RequestParam String location) {
        try {
            Map<String, Object> widgetData = new HashMap<>();

            // Get current weather for the location
            WeatherData currentWeather = weatherApiService.getCurrentWeather(location);

            // Create location info
            Map<String, String> locationInfo = new HashMap<>();
            locationInfo.put("name", currentWeather.getCity());
            locationInfo.put("country", currentWeather.getCountry());

            widgetData.put("location", locationInfo);
            widgetData.put("current", currentWeather);

            return ResponseEntity.ok(widgetData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating widget data: " + e.getMessage());
        }
    }
}