package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.repository.WeatherAlertRepository;
import com.example.weatherapp.repository.UserRepository;
import com.example.weatherapp.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSender;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private WeatherAlertRepository weatherAlertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailSender mailSender;

    @Autowired
    private ObjectMapper objectMapper;

    // Severe weather condition codes that trigger alerts
    private static final Map<String, String> SEVERE_WEATHER_CONDITIONS = Map.of(
            "thunderstorm", "Thunderstorm Alert",
            "tornado", "Tornado Warning",
            "hurricane", "Hurricane Warning",
            "blizzard", "Blizzard Warning",
            "ice storm", "Ice Storm Warning",
            "severe wind", "Severe Wind Warning",
            "hail", "Hail Warning",
            "flood", "Flood Warning"
    );

    /**
     * Create and save a weather alert
     */
    public WeatherAlert createWeatherAlert(String userId, String alertType, String title,
                                           String message, String severity, Map<String, Object> metadata) {

        WeatherAlert alert = new WeatherAlert();
        alert.setUserId(userId);
        alert.setAlertType(alertType);
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setSeverity(severity);
        alert.setMetadata(metadata);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setIsRead(false);
        alert.setIsActive(true);

        WeatherAlert savedAlert = weatherAlertRepository.save(alert);

        // Send notification asynchronously
        sendNotificationAsync(userId, savedAlert);

        return savedAlert;
    }

    /**
     * Process weather data and check for alert conditions
     */
    public void processWeatherForAlerts(String userId, WeatherData weatherData) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getPreferences() == null || !user.getPreferences().isNotificationsEnabled()) {
            return;
        }

        // Check for severe weather alerts
        if (user.getPreferences().isSevereWeatherAlerts()) {
            checkSevereWeatherConditions(userId, weatherData);
        }

        // Check for rain alerts
        if (user.getPreferences().isRainAlerts()) {
            checkRainConditions(userId, weatherData);
        }

        // Check for temperature threshold alerts
        if (user.getPreferences().isTemperatureThresholdAlerts()) {
            checkTemperatureThresholds(userId, weatherData, user);
        }

        // Check for air quality alerts
        checkAirQualityConditions(userId, weatherData);
    }

    /**
     * Check for severe weather conditions
     */
    private void checkSevereWeatherConditions(String userId, WeatherData weatherData) {
        String condition = weatherData.getCondition().toLowerCase();
        String description = weatherData.getDescription().toLowerCase();

        for (Map.Entry<String, String> severeCond : SEVERE_WEATHER_CONDITIONS.entrySet()) {
            if (condition.contains(severeCond.getKey()) || description.contains(severeCond.getKey())) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("location", weatherData.getCityName());
                metadata.put("temperature", weatherData.getTemperature());
                metadata.put("condition", weatherData.getCondition());
                metadata.put("windSpeed", weatherData.getWindSpeed());

                createWeatherAlert(
                        userId,
                        "SEVERE_WEATHER",
                        severeCond.getValue(),
                        String.format("Severe weather alert for %s: %s. Temperature: %.1f°C, Wind: %.1f m/s",
                                weatherData.getCityName(), weatherData.getDescription(),
                                weatherData.getTemperature(), weatherData.getWindSpeed()),
                        "HIGH",
                        metadata
                );
                break; // Only send one severe weather alert
            }
        }
    }

    /**
     * Check for rain conditions
     */
    private void checkRainConditions(String userId, WeatherData weatherData) {
        String condition = weatherData.getCondition().toLowerCase();

        if (condition.contains("rain") || condition.contains("drizzle") || condition.contains("shower")) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("location", weatherData.getCityName());
            metadata.put("condition", weatherData.getCondition());
            metadata.put("humidity", weatherData.getHumidity());

            createWeatherAlert(
                    userId,
                    "RAIN_ALERT",
                    "Rain Alert",
                    String.format("Rain expected in %s: %s. Humidity: %d%%",
                            weatherData.getCityName(), weatherData.getDescription(), weatherData.getHumidity()),
                    "MEDIUM",
                    metadata
            );
        }
    }

    /**
     * Check for temperature threshold alerts
     */
    private void checkTemperatureThresholds(String userId, WeatherData weatherData, User user) {
        double temperature = weatherData.getTemperature();
        double minThreshold = user.getPreferences().getMinTemperatureThreshold();
        double maxThreshold = user.getPreferences().getMaxTemperatureThreshold();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("location", weatherData.getCityName());
        metadata.put("temperature", temperature);
        metadata.put("feelsLike", weatherData.getFeelsLike());

        if (temperature <= minThreshold) {
            createWeatherAlert(
                    userId,
                    "TEMPERATURE_ALERT",
                    "Low Temperature Alert",
                    String.format("Temperature in %s has dropped to %.1f°C (feels like %.1f°C), below your threshold of %.1f°C",
                            weatherData.getCityName(), temperature, weatherData.getFeelsLike(), minThreshold),
                    "MEDIUM",
                    metadata
            );
        } else if (temperature >= maxThreshold) {
            createWeatherAlert(
                    userId,
                    "TEMPERATURE_ALERT",
                    "High Temperature Alert",
                    String.format("Temperature in %s has risen to %.1f°C (feels like %.1f°C), above your threshold of %.1f°C",
                            weatherData.getCityName(), temperature, weatherData.getFeelsLike(), maxThreshold),
                    "MEDIUM",
                    metadata
            );
        }
    }

    /**
     * Check for air quality conditions
     */
    private void checkAirQualityConditions(String userId, WeatherData weatherData) {
        // Assuming AQI is stored in weather data or fetched separately
        if (weatherData.getAqi() != null && weatherData.getAqi() > 150) { // Unhealthy level
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("location", weatherData.getCityName());
            metadata.put("aqi", weatherData.getAqi());

            String severity = weatherData.getAqi() > 200 ? "HIGH" : "MEDIUM";
            String alertLevel = weatherData.getAqi() > 200 ? "Very Unhealthy" : "Unhealthy";

            createWeatherAlert(
                    userId,
                    "AIR_QUALITY_ALERT",
                    "Air Quality Alert",
                    String.format("Air quality in %s is %s (AQI: %d). Consider limiting outdoor activities.",
                            weatherData.getCityName(), alertLevel, weatherData.getAqi()),
                    severity,
                    metadata
            );
        }
    }

    /**
     * Send notification asynchronously
     */
    @Async
    public CompletableFuture<Void> sendNotificationAsync(String userId, WeatherAlert alert) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getEmail() != null) {
                sendEmailNotification(user.getEmail(), alert);
            }

            // Here you could also send push notifications, SMS, etc.
            sendPushNotification(userId, alert);

        } catch (Exception e) {
            logger.error("Failed to send notification for alert {}: {}", alert.getId(), e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send email notification
     */
    private void sendEmailNotification(String email, WeatherAlert alert) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Weather Alert: " + alert.getTitle());
            message.setText(alert.getMessage() + "\n\nThis is an automated weather alert from WeatherApp.");

            mailSender.send(message);
            logger.info("Email notification sent for alert: {}", alert.getId());

        } catch (Exception e) {
            logger.error("Failed to send email notification: {}", e.getMessage());
        }
    }

    /**
     * Send push notification (placeholder implementation)
     */
    private void sendPushNotification(String userId, WeatherAlert alert) {
        // Implementation would depend on your push notification service (FCM, APNS, etc.)
        try {
            // Placeholder for push notification logic
            logger.info("Push notification sent to user {} for alert: {}", userId, alert.getId());

        } catch (Exception e) {
            logger.error("Failed to send push notification: {}", e.getMessage());
        }
    }

    /**
     * Get user's weather alerts
     */
    public List<WeatherAlert> getUserAlerts(String userId, boolean includeRead) {
        if (includeRead) {
            return weatherAlertRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            return weatherAlertRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        }
    }

    /**
     * Get active alerts for user
     */
    public List<WeatherAlert> getActiveAlerts(String userId) {
        return weatherAlertRepository.findByUserIdAndIsActiveOrderByCreatedAtDesc(userId, true);
    }

    /**
     * Mark alert as read
     */
    public WeatherAlert markAlertAsRead(String alertId, String userId) {
        WeatherAlert alert = weatherAlertRepository.findById(alertId)
                .orElseThrow(() -> new InvalidRequestException("Alert not found"));

        if (!alert.getUserId().equals(userId)) {
            throw new InvalidRequestException("Unauthorized access to alert");
        }

        alert.setIsRead(true);
        alert.setReadAt(LocalDateTime.now());
        return weatherAlertRepository.save(alert);
    }

    /**
     * Mark multiple alerts as read
     */
    public List<WeatherAlert> markAlertsAsRead(List<String> alertIds, String userId) {
        List<WeatherAlert> alerts = weatherAlertRepository.findAllById(alertIds);

        return alerts.stream()
                .filter(alert -> alert.getUserId().equals(userId))
                .map(alert -> {
                    alert.setIsRead(true);
                    alert.setReadAt(LocalDateTime.now());
                    return weatherAlertRepository.save(alert);
                })
                .collect(Collectors.toList());
    }

    /**
     * Dismiss/deactivate alert
     */
    public WeatherAlert dismissAlert(String alertId, String userId) {
        WeatherAlert alert = weatherAlertRepository.findById(alertId)
                .orElseThrow(() -> new InvalidRequestException("Alert not found"));

        if (!alert.getUserId().equals(userId)) {
            throw new InvalidRequestException("Unauthorized access to alert");
        }

        alert.setIsActive(false);
        alert.setDismissedAt(LocalDateTime.now());
        return weatherAlertRepository.save(alert);
    }

    /**
     * Get alert statistics for user
     */
    public Map<String, Object> getAlertStatistics(String userId) {
        List<WeatherAlert> allAlerts = weatherAlertRepository.findByUserId(userId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAlerts", allAlerts.size());
        stats.put("unreadAlerts", allAlerts.stream().filter(a -> !a.getIsRead()).count());
        stats.put("activeAlerts", allAlerts.stream().filter(a -> a.getIsActive()).count());

        // Group by alert type
        Map<String, Long> alertsByType = allAlerts.stream()
                .collect(Collectors.groupingBy(WeatherAlert::getAlertType, Collectors.counting()));
        stats.put("alertsByType", alertsByType);

        // Group by severity
        Map<String, Long> alertsBySeverity = allAlerts.stream()
                .collect(Collectors.groupingBy(WeatherAlert::getSeverity, Collectors.counting()));
        stats.put("alertsBySeverity", alertsBySeverity);

        return stats;
    }

    /**
     * Clean up old alerts (keep only recent 100 alerts per user)
     */
    public void cleanupOldAlerts(String userId) {
        List<WeatherAlert> userAlerts = weatherAlertRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (userAlerts.size() > 100) {
            List<WeatherAlert> alertsToDelete = userAlerts.subList(100, userAlerts.size());
            weatherAlertRepository.deleteAll(alertsToDelete);
            logger.info("Cleaned up {} old alerts for user {}", alertsToDelete.size(), userId);
        }
    }

    /**
     * Send test notification
     */
    public WeatherAlert sendTestNotification(String userId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("test", true);

        return createWeatherAlert(
                userId,
                "TEST_ALERT",
                "Test Notification",
                "This is a test notification to verify your alert settings are working correctly.",
                "LOW",
                metadata
        );
    }

    /**
     * Check if user has unread alerts
     */
    public boolean hasUnreadAlerts(String userId) {
        return weatherAlertRepository.existsByUserIdAndIsRead(userId, false);
    }

    /**
     * Get unread alert count
     */
    public long getUnreadAlertCount(String userId) {
        return weatherAlertRepository.countByUserIdAndIsRead(userId, false);
    }

    /**
     * Create bulk weather alerts for multiple users
     */
    @Async
    public CompletableFuture<Void> createBulkWeatherAlerts(List<String> userIds, String alertType,
                                                           String title, String message, String severity, Map<String, Object> metadata) {

        try {
            List<WeatherAlert> alerts = userIds.stream()
                    .map(userId -> {
                        WeatherAlert alert = new WeatherAlert();
                        alert.setUserId(userId);
                        alert.setAlertType(alertType);
                        alert.setTitle(title);
                        alert.setMessage(message);
                        alert.setSeverity(severity);
                        alert.setMetadata(metadata);
                        alert.setCreatedAt(LocalDateTime.now());
                        alert.setIsRead(false);
                        alert.setIsActive(true);
                        return alert;
                    })
                    .collect(Collectors.toList());

            List<WeatherAlert> savedAlerts = weatherAlertRepository.saveAll(alerts);

            // Send notifications for all alerts
            for (WeatherAlert alert : savedAlerts) {
                sendNotificationAsync(alert.getUserId(), alert);
            }

            logger.info("Created {} bulk weather alerts", savedAlerts.size());

        } catch (Exception e) {
            logger.error("Failed to create bulk weather alerts: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }
}