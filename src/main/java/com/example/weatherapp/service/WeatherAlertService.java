// src/main/java/com/example/weatherapp/service/WeatherAlertService.java
package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.AlertType;
import com.example.weatherapp.model.AlertCondition;
import com.example.weatherapp.model.ExtendedWeatherData;
import com.example.weatherapp.repository.WeatherAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WeatherAlertService {

    @Autowired
    private WeatherAlertRepository alertRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EnhancedWeatherService weatherService;

    public List<WeatherAlert> getUserAlerts(String userId) {
        return alertRepository.findByUserIdAndIsActiveTrue(userId);
    }

    public List<WeatherAlert> getActiveUserAlerts(String userId) {
        return alertRepository.findByUserIdAndIsActiveTrue(userId);
    }

    public WeatherAlert createAlert(String userId, WeatherAlert alert) {
        alert.setUserId(userId);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setActive(true);
        alert.setTriggerCount(0);
        alert.setNextCheck(LocalDateTime.now().plusMinutes(15));
        return alertRepository.save(alert);
    }

    public WeatherAlert updateAlert(String alertId, WeatherAlert alertData) {
        Optional<WeatherAlert> existingAlert = alertRepository.findById(alertId);
        if (existingAlert.isPresent()) {
            WeatherAlert alert = existingAlert.get();
            alert.setAlertType(alertData.getAlertType());
            alert.setCondition(alertData.getCondition());
            alert.setThreshold(alertData.getThreshold());
            alert.setMessage(alertData.getMessage());
            alert.setLocationId(alertData.getLocationId());
            return alertRepository.save(alert);
        }
        throw new RuntimeException("Alert not found");
    }

    public void deleteAlert(String alertId) {
        alertRepository.deleteById(alertId);
    }

    public WeatherAlert toggleAlert(String alertId) {
        Optional<WeatherAlert> alertOpt = alertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            WeatherAlert alert = alertOpt.get();
            alert.setActive(!alert.isActive());
            return alertRepository.save(alert);
        }
        throw new RuntimeException("Alert not found");
    }

    @Async
    public void checkAndTriggerAlerts() {
        List<WeatherAlert> alertsToCheck = alertRepository.findByNextCheckBefore(LocalDateTime.now());

        for (WeatherAlert alert : alertsToCheck) {
            try {
                checkSingleAlert(alert);
            } catch (Exception e) {
                // Log error but continue with other alerts
                System.err.println("Error checking alert " + alert.getId() + ": " + e.getMessage());
            }
        }
    }

    private void checkSingleAlert(WeatherAlert alert) {
        try {
            // Get current weather for the alert location
            ExtendedWeatherData weather = getWeatherForAlert(alert);

            if (shouldTriggerAlert(alert, weather)) {
                triggerAlert(alert, weather);
            }

            // Update next check time
            alert.setNextCheck(LocalDateTime.now().plusMinutes(15));
            alertRepository.save(alert);

        } catch (Exception e) {
            throw new RuntimeException("Failed to check alert: " + alert.getId(), e);
        }
    }

    private ExtendedWeatherData getWeatherForAlert(WeatherAlert alert) {
        // If locationId is a city name, use that; otherwise parse coordinates
        String locationId = alert.getLocationId();
        if (locationId.contains(",")) {
            String[] coords = locationId.split(",");
            double lat = Double.parseDouble(coords[0]);
            double lon = Double.parseDouble(coords[1]);
            return weatherService.getWeatherByCoordinates(lat, lon);
        } else {
            return weatherService.getExtendedWeatherData(locationId);
        }
    }

    private boolean shouldTriggerAlert(WeatherAlert alert, ExtendedWeatherData weather) {
        double currentValue = getCurrentValueForAlertType(alert.getAlertType(), weather);

        switch (alert.getCondition()) {
            case GREATER_THAN:
                return currentValue > alert.getThreshold();
            case LESS_THAN:
                return currentValue < alert.getThreshold();
            case EQUALS:
                return Math.abs(currentValue - alert.getThreshold()) < 0.1;
            default:
                return false;
        }
    }

    private double getCurrentValueForAlertType(AlertType alertType, ExtendedWeatherData weather) {
        switch (alertType) {
            case TEMPERATURE_HIGH:
            case TEMPERATURE_LOW:
                return weather.getTemperature();
            case WIND_STRONG:
                return weather.getWindSpeed();
            case UV_HIGH:
                return weather.getUvIndex();
            case AIR_QUALITY_POOR:
                return weather.getAqi();
            case RAIN_EXPECTED:
                return weather.getRainProbability();
            default:
                return 0.0;
        }
    }

    private void triggerAlert(WeatherAlert alert, ExtendedWeatherData weather) {
        alert.setLastTriggered(LocalDateTime.now());
        alert.setTriggerCount(alert.getTriggerCount() + 1);
        alertRepository.save(alert);

        // Send notification
        notificationService.sendWeatherAlert(alert.getUserId(), alert, weather);
    }

    public void testAlert(String alertId) {
        Optional<WeatherAlert> alertOpt = alertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            WeatherAlert alert = alertOpt.get();
            try {
                ExtendedWeatherData weather = getWeatherForAlert(alert);
                notificationService.sendTestAlert(alert.getUserId(), alert, weather);
            } catch (Exception e) {
                throw new RuntimeException("Failed to send test alert", e);
            }
        } else {
            throw new RuntimeException("Alert not found");
        }
    }

    public List<WeatherAlert> getAlertsByType(AlertType alertType) {
        return alertRepository.findByAlertTypeAndIsActiveTrue(alertType);
    }

    public void deleteUserAlerts(String userId, String locationId) {
        alertRepository.deleteByUserIdAndLocationId(userId, locationId);
    }
}