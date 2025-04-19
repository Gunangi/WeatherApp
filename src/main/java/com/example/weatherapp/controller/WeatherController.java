package com.example.weatherapp.controller;


import com.example.weatherapp.model.SavedLocation;
import com.example.weatherapp.model.User;
import com.example.weatherapp.model.UserPreferences.TemperatureUnit;
import com.example.weatherapp.service.SavedLocationService;
import com.example.weatherapp.service.UserService;
import com.example.weatherapp.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/weather")
public class WeatherController {

    private final WeatherService weatherService;
    private final UserService userService;
    private final SavedLocationService locationService;

    public WeatherController(WeatherService weatherService, UserService userService, SavedLocationService locationService) {
        this.weatherService = weatherService;
        this.userService = userService;
        this.locationService = locationService;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentWeather(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Long locationId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine coordinates to use
        double latitude;
        double longitude;

        if (locationId != null) {
            // Use saved location
            SavedLocation location = locationService.getLocationById(locationId);
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        } else if (lat != null && lon != null) {
            // Use provided coordinates
            latitude = lat;
            longitude = lon;
        } else {
            // Use default location for user if authenticated
            if (userDetails != null) {
                User user = userService.getUserByUsername(userDetails.getUsername());
                SavedLocation defaultLocation = locationService.getDefaultLocation(user);
                latitude = defaultLocation.getLatitude();
                longitude = defaultLocation.getLongitude();
            } else {
                // Default coordinates if no user or location provided
                latitude = 40.7128; // New York City
                longitude = -74.0060;
            }
        }

        // Determine temperature unit
        TemperatureUnit unit = TemperatureUnit.CELSIUS;
        if (userDetails != null) {
            User user = userService.getUserByUsername(userDetails.getUsername());
            unit = user.getPreferences() != null ? user.getPreferences().getTemperatureUnit() : TemperatureUnit.CELSIUS;
        }

        Map<String, Object> weatherData = weatherService.getCurrentWeather(latitude, longitude, unit);
        return ResponseEntity.ok(weatherData);
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getForecast(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Integer days,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine coordinates to use (similar to getCurrentWeather)
        double latitude;
        double longitude;

        if (locationId != null) {
            SavedLocation location = locationService.getLocationById(locationId);
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        } else if (lat != null && lon != null) {
            latitude = lat;
            longitude = lon;
        } else {
            if (userDetails != null) {
                User user = userService.getUserByUsername(userDetails.getUsername());
                SavedLocation defaultLocation = locationService.getDefaultLocation(user);
                latitude = defaultLocation.getLatitude();
                longitude = defaultLocation.getLongitude();
            } else {
                latitude = 40.7128;
                longitude = -74.0060;
            }
        }

        // Determine forecast days and temperature unit
        int forecastDays = days != null ? days : 5;
        TemperatureUnit unit = TemperatureUnit.CELSIUS;

        if (userDetails != null) {
            User user = userService.getUserByUsername(userDetails.getUsername());
            if (user.getPreferences() != null) {
                if (days == null) {
                    forecastDays = user.getPreferences().getForecastDays();
                }
                unit = user.getPreferences().getTemperatureUnit();
            }
        }

        Map<String, Object> forecastData = weatherService.getForecast(latitude, longitude, forecastDays, unit);
        return ResponseEntity.ok(forecastData);
    }

    @GetMapping("/hourly")
    public ResponseEntity<Map<String, Object>> getHourlyForecast(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Long locationId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine coordinates (similar logic as above)
        double latitude;
        double longitude;

        if (locationId != null) {
            SavedLocation location = locationService.getLocationById(locationId);
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        } else if (lat != null && lon != null) {
            latitude = lat;
            longitude = lon;
        } else {
            if (userDetails != null) {
                User user = userService.getUserByUsername(userDetails.getUsername());
                SavedLocation defaultLocation = locationService.getDefaultLocation(user);
                latitude = defaultLocation.getLatitude();
                longitude = defaultLocation.getLongitude();
            } else {
                latitude = 40.7128;
                longitude = -74.0060;
            }
        }

        // Determine temperature unit
        TemperatureUnit unit = TemperatureUnit.CELSIUS;
        if (userDetails != null) {
            User user = userService.getUserByUsername(userDetails.getUsername());
            unit = user.getPreferences() != null ? user.getPreferences().getTemperatureUnit() : TemperatureUnit.CELSIUS;
        }

        Map<String, Object> hourlyData = weatherService.getHourlyForecast(latitude, longitude, unit);
        return ResponseEntity.ok(hourlyData);
    }

    @GetMapping("/air-quality")
    public ResponseEntity<Map<String, Object>> getAirQuality(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Long locationId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine coordinates (similar logic as above)
        double latitude;
        double longitude;

        if (locationId != null) {
            SavedLocation location = locationService.getLocationById(locationId);
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        } else if (lat != null && lon != null) {
            latitude = lat;
            longitude = lon;
        } else {
            if (userDetails != null) {
                User user = userService.getUserByUsername(userDetails.getUsername());
                SavedLocation defaultLocation = locationService.getDefaultLocation(user);
                latitude = defaultLocation.getLatitude();
                longitude = defaultLocation.getLongitude();
            } else {
                latitude = 40.7128;
                longitude = -74.0060;
            }
        }

        Map<String, Object> airQualityData = weatherService.getAirQuality(latitude, longitude);
        return ResponseEntity.ok(airQualityData);
    }

    @GetMapping("/uv-index")
    public ResponseEntity<Map<String, Object>> getUVIndex(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Long locationId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine coordinates (similar logic as above)
        double latitude;
        double longitude;

        if (locationId != null) {
            SavedLocation location = locationService.getLocationById(locationId);
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        } else if (lat != null && lon != null) {
            latitude = lat;
            longitude = lon;
        } else {
            if (userDetails != null) {
                User user = userService.getUserByUsername(userDetails.getUsername());
                SavedLocation defaultLocation = locationService.getDefaultLocation(user);
                latitude = defaultLocation.getLatitude();
                longitude = defaultLocation.getLongitude();
            } else {
                latitude = 40.7128;
                longitude = -74.0060;
            }
        }

        Map<String, Object> uvData = weatherService.getUVIndex(latitude, longitude);
        return ResponseEntity.ok(uvData);
    }

    @GetMapping("/historical")
    public ResponseEntity<Map<String, Object>> getHistoricalWeather(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Long locationId,
            @RequestParam String date,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine coordinates (similar logic as above)
        double latitude;
        double longitude;

        if (locationId != null) {
            SavedLocation location = locationService.getLocationById(locationId);
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        } else if (lat != null && lon != null) {
            latitude = lat;
            longitude = lon;
        } else {
            if (userDetails != null) {
                User user = userService.getUserByUsername(userDetails.getUsername());
                SavedLocation defaultLocation = locationService.getDefaultLocation(user);
                latitude = defaultLocation.getLatitude();
                longitude = defaultLocation.getLongitude();
            } else {
                latitude = 40.7128;
                longitude = -74.0060;
            }
        }

        // Parse date and determine temperature unit
        LocalDate historicalDate = LocalDate.parse(date);
        TemperatureUnit unit = TemperatureUnit.CELSIUS;

        if (userDetails != null) {
            User user = userService.getUserByUsername(userDetails.getUsername());
            unit = user.getPreferences() != null ? user.getPreferences().getTemperatureUnit() : TemperatureUnit.CELSIUS;
        }

        Map<String, Object> historicalData = weatherService.getHistoricalWeather(latitude, longitude, historicalDate, unit);
        return ResponseEntity.ok(historicalData);
    }

    @GetMapping("/location/search")
    public ResponseEntity<Map<String, Object>> searchLocation(@RequestParam String query) {
        Map<String, Object> locations = weatherService.geocodeLocation(query);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/location/reverse")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @RequestParam Double lat,
            @RequestParam Double lon) {
        Map<String, Object> location = weatherService.reverseGeocode(lat, lon);
        return ResponseEntity.ok(location);
    }
}