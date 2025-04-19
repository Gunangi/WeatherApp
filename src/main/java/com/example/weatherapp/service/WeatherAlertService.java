package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.repository.WeatherAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class WeatherAlertService {

    private final WeatherAlertRepository alertRepository;
    private final WeatherService weatherService;

    // Cache of the last alert check time per city to avoid too frequent checks
    private final Map<String, LocalDateTime> lastCheckTimeMap = new ConcurrentHashMap<>();

    @Autowired
    public WeatherAlertService(WeatherAlertRepository alertRepository, WeatherService weatherService) {
        this.alertRepository = alertRepository;
        this.weatherService = weatherService;
    }

    public WeatherAlert createAlert(WeatherAlert alert) {
        alert.setCreatedAt(LocalDateTime.now());
        alert.setActive(true);
        return alertRepository.save(alert);
    }

    public List<WeatherAlert> getUserAlerts(String username) {
        return alertRepository.findByUsernameAndIsActiveTrue(username);
    }

    public boolean deleteAlert(String alertId, String username) {
        return alertRepository.findById(alertId)
                .filter(alert -> alert.getUsername().equals(username))
                .map(alert -> {
                    alertRepository.deleteById(alertId);
                    return true;
                })
                .orElse(false);
    }

    public WeatherAlert toggleAlertStatus(String alertId, String username, boolean isActive) {
        return alertRepository.findById(alertId)
                .filter(alert -> alert.getUsername().equals(username))
                .map(alert -> {
                    alert.setActive(isActive);
                    return alertRepository.save(alert);
                })
                .orElse(null);
    }

    public List<WeatherAlert> checkAlertsForCity(String city) {
        // Avoid checking too frequently (no more than once per 10 minutes)
        LocalDateTime now = LocalDateTime.now();
        if (lastCheckTimeMap.containsKey(city)) {
            LocalDateTime lastCheck = lastCheckTimeMap.get(city);
            if (lastCheck.plusMinutes(10).isAfter(now)) {
                return List.of(); // Skip check if less than 10 minutes
            }
        }

        // Update last check time
        lastCheckTimeMap.put(city, now);

        // Get current weather for city
        WeatherData currentWeather = weatherService.getWeather(city);

        // Get all alerts for this city
        List<WeatherAlert> cityAlerts = alertRepository.findByCity(city);

        // Filter for triggered alerts and update them
        return cityAlerts.stream()
                .filter(alert -> alert.isActive() && isAlertTriggered(alert, currentWeather))
                .map(alert -> {
                    alert.setLastTriggeredAt(now);
                    return alertRepository.save(alert);
                })
                .collect(Collectors.toList());
    }

    private boolean isAlertTriggered(WeatherAlert alert, WeatherData weather) {
        double actualValue = switch (alert.getAlertType()) {
            case "TEMPERATURE" -> weather.getTemperature();
            case "WIND" -> weather.getWindSpeed();
            // Add other types as needed
            default -> 0.0;
        };

        return switch (alert.getCondition()) {
            case "ABOVE" -> actualValue > alert.getThreshold();
            case "BELOW" -> actualValue < alert.getThreshold();
            case "EQUALS" -> Math.abs(actualValue - alert.getThreshold()) < 0.1;
            default -> false;
        };
    }
}