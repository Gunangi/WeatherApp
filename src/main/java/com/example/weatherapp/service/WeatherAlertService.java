// src/main/java/com/example/weatherapp/service/WeatherAlertService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.repository.WeatherAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherAlertService {

    private final WeatherAlertRepository weatherAlertRepository;
    private final NotificationService notificationService;

    @Value("${weather.alerts.temperature.extreme-cold:-10}")
    private double extremeColdThreshold;

    @Value("${weather.alerts.temperature.very-cold:0}")
    private double veryColdThreshold;

    @Value("${weather.alerts.temperature.cold:10}")
    private double coldThreshold;

    @Value("${weather.alerts.temperature.hot:35}")
    private double hotThreshold;

    @Value("${weather.alerts.temperature.very-hot:40}")
    private double veryHotThreshold;

    @Value("${weather.alerts.temperature.extreme-hot:45}")
    private double extremeHotThreshold;

    @Value("${weather.alerts.wind.moderate:5.5}")
    private double moderateWindThreshold;

    @Value("${weather.alerts.wind.strong:10.8}")
    private double strongWindThreshold;

    @Value("${weather.alerts.wind.gale:17.2}")
    private double galeWindThreshold;

    @Value("${weather.alerts.wind.storm:24.5}")
    private double stormWindThreshold;

    public void checkAndCreateAlerts(String city, WeatherResponse weather) {
        List<WeatherAlert> alerts = new ArrayList<>();

        // Temperature alerts
        alerts.addAll(checkTemperatureAlerts(city, weather.getTemperature()));

        // Wind alerts
        alerts.addAll(checkWindAlerts(city, weather.getWindSpeed()));

        // Weather condition alerts
        alerts.addAll(checkWeatherConditionAlerts(city, weather.getWeatherDescription()));

        // UV Index alerts
        if (weather.getUvIndex() > 0) {
            alerts.addAll(checkUvIndexAlerts(city, weather.getUvIndex()));
        }

        // Visibility alerts
        alerts.addAll(checkVisibilityAlerts(city, weather.getVisibility()));

        // Save alerts and send notifications
        for (WeatherAlert alert : alerts) {
            saveAlert(alert);
            // Send notification for severe alerts
            if (isSevereAlert(alert)) {
                notificationService.sendWeatherAlert(city, alert);
            }
        }
    }

    private List<WeatherAlert> checkTemperatureAlerts(String city, double temperature) {
        List<WeatherAlert> alerts = new ArrayList<>();

        if (temperature <= extremeColdThreshold) {
            alerts.add(createAlert(city, "Extreme Cold Warning",
                    "Extremely cold weather detected. Temperature: " + temperature + "°C. Take necessary precautions.",
                    "EXTREME"));
        } else if (temperature <= veryColdThreshold) {
            alerts.add(createAlert(city, "Very Cold Alert",
                    "Very cold weather. Temperature: " + temperature + "°C. Dress warmly.",
                    "HIGH"));
        } else if (temperature <= coldThreshold) {
            alerts.add(createAlert(city, "Cold Weather",
                    "Cold weather conditions. Temperature: " + temperature + "°C.",
                    "MODERATE"));
        } else if (temperature >= extremeHotThreshold) {
            alerts.add(createAlert(city, "Extreme Heat Warning",
                    "Dangerously hot weather. Temperature: " + temperature + "°C. Avoid outdoor activities.",
                    "EXTREME"));
        } else if (temperature >= veryHotThreshold) {
            alerts.add(createAlert(city, "Very Hot Alert",
                    "Very hot weather. Temperature: " + temperature + "°C. Stay hydrated and seek shade.",
                    "HIGH"));
        } else if (temperature >= hotThreshold) {
            alerts.add(createAlert(city, "Hot Weather",
                    "Hot weather conditions. Temperature: " + temperature + "°C. Stay cool and hydrated.",
                    "MODERATE"));
        }

        return alerts;
    }

    private List<WeatherAlert> checkWindAlerts(String city, double windSpeed) {
        List<WeatherAlert> alerts = new ArrayList<>();

        if (windSpeed >= stormWindThreshold) {
            alerts.add(createAlert(city, "Storm Warning",
                    "Storm force winds detected. Wind speed: " + windSpeed + " m/s. Stay indoors.",
                    "EXTREME"));
        } else if (windSpeed >= galeWindThreshold) {
            alerts.add(createAlert(city, "Gale Warning",
                    "Gale force winds. Wind speed: " + windSpeed + " m/s. Avoid outdoor activities.",
                    "HIGH"));
        } else if (windSpeed >= strongWindThreshold) {
            alerts.add(createAlert(city, "Strong Wind Alert",
                    "Strong winds expected. Wind speed: " + windSpeed + " m/s. Be cautious outdoors.",
                    "MODERATE"));
        } else if (windSpeed >= moderateWindThreshold) {
            alerts.add(createAlert(city, "Moderate Wind",
                    "Moderate winds. Wind speed: " + windSpeed + " m/s.",
                    "LOW"));
        }

        return alerts;
    }

    private List<WeatherAlert> checkWeatherConditionAlerts(String city, String description) {
        List<WeatherAlert> alerts = new ArrayList<>();
        String lowerDesc = description.toLowerCase();

        if (lowerDesc.contains("thunderstorm")) {
            alerts.add(createAlert(city, "Thunderstorm Warning",
                    "Thunderstorm conditions detected. Stay indoors and avoid metal objects.",
                    "HIGH"));
        } else if (lowerDesc.contains("heavy rain") || lowerDesc.contains("torrential")) {
            alerts.add(createAlert(city, "Heavy Rain Alert",
                    "Heavy rainfall expected. Avoid low-lying areas and driving if possible.",
                    "MODERATE"));
        } else if (lowerDesc.contains("snow") || lowerDesc.contains("blizzard")) {
            alerts.add(createAlert(city, "Snow Alert",
                    "Snow conditions detected. Drive carefully and dress warmly.",
                    "MODERATE"));
        } else if (lowerDesc.contains("fog") || lowerDesc.contains("mist")) {
            alerts.add(createAlert(city, "Visibility Alert",
                    "Poor visibility due to fog/mist. Drive with caution.",
                    "LOW"));
        }

        return alerts;
    }

    private List<WeatherAlert> checkUvIndexAlerts(String city, double uvIndex) {
        List<WeatherAlert> alerts = new ArrayList<>();

        if (uvIndex > 10) {
            alerts.add(createAlert(city, "Extreme UV Warning",
                    "Extreme UV levels detected (UV Index: " + uvIndex + "). Avoid sun exposure.",
                    "HIGH"));
        } else if (uvIndex > 7) {
            alerts.add(createAlert(city, "Very High UV Alert",
                    "Very high UV levels (UV Index: " + uvIndex + "). Use strong sun protection.",
                    "MODERATE"));
        } else if (uvIndex > 5) {
            alerts.add(createAlert(city, "High UV Alert",
                    "High UV levels (UV Index: " + uvIndex + "). Use sun protection.",
                    "LOW"));
        }

        return alerts;
    }

    private List<WeatherAlert> checkVisibilityAlerts(String city, double visibility) {
        List<WeatherAlert> alerts = new ArrayList<>();

        if (visibility < 1.0) {
            alerts.add(createAlert(city, "Poor Visibility Warning",
                    "Very poor visibility (" + visibility + " km). Extreme caution while driving.",
                    "HIGH"));
        } else if (visibility < 5.0) {
            alerts.add(createAlert(city, "Reduced Visibility",
                    "Reduced visibility (" + visibility + " km). Drive with caution.",
                    "MODERATE"));
        }

        return alerts;
    }

    private WeatherAlert createAlert(String city, String event, String description, String severity) {
        WeatherAlert alert = new WeatherAlert();
        alert.setCity(city);
        alert.setEvent(event);
        alert.setDescription(description);
        alert.setSeverity(severity);
        alert.setStartTime(Instant.now());
        alert.setEndTime(Instant.now().plus(3, ChronoUnit.HOURS)); // Default 3-hour alert duration
        alert.setActive(true);
        return alert;
    }

    private void saveAlert(WeatherAlert alert) {
        try {
            // Check if similar alert already exists and is active
            List<WeatherAlert> existingAlerts = weatherAlertRepository
                    .findByCityIgnoreCaseAndEventAndActiveTrue(alert.getCity(), alert.getEvent());

            if (existingAlerts.isEmpty()) {
                weatherAlertRepository.save(alert);
                log.info("Created new weather alert for {}: {}", alert.getCity(), alert.getEvent());
            } else {
                log.debug("Similar alert already exists for {}: {}", alert.getCity(), alert.getEvent());
            }
        } catch (Exception e) {
            log.error("Failed to save weather alert for {}: {}", alert.getCity(), alert.getEvent(), e);
        }
    }

    private boolean isSevereAlert(WeatherAlert alert) {
        return "EXTREME".equals(alert.getSeverity()) || "HIGH".equals(alert.getSeverity());
    }

    public List<WeatherAlert> getActiveAlertsForCity(String city) {
        return weatherAlertRepository.findByCityIgnoreCaseAndActiveTrue(city);
    }

    public void deactivateExpiredAlerts() {
        List<WeatherAlert> expiredAlerts = weatherAlertRepository.findByEndTimeBeforeAndActiveTrue(Instant.now());
        for (WeatherAlert alert : expiredAlerts) {
            alert.setActive(false);
            weatherAlertRepository.save(alert);
        }
        if (!expiredAlerts.isEmpty()) {
            log.info("Deactivated {} expired weather alerts", expiredAlerts.size());
        }
    }
}