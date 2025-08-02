// src/main/java/com/example/weatherapp/service/NotificationService.java
package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.User;
import com.example.weatherapp.repository.WeatherAlertRepository;
import com.example.weatherapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final WeatherAlertRepository weatherAlertRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@weatherapp.com}")
    private String fromEmail;

    @Value("${weather.app.notifications.enabled:true}")
    private boolean notificationsEnabled;

    public List<WeatherAlert> getAlertsForCity(String city) {
        return weatherAlertRepository.findByCityIgnoreCase(city);
    }

    public void sendWeatherAlert(String city, WeatherAlert alert) {
        if (!notificationsEnabled) {
            log.debug("Notifications are disabled");
            return;
        }

        try {
            // Find users who have this city in their favorites or recent searches
            List<User> interestedUsers = findUsersInterestedInCity(city);

            for (User user : interestedUsers) {
                if (shouldSendAlert(user, alert)) {
                    sendAlertToUser(user, alert);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send weather alert for city {}: {}", city, alert.getEvent(), e);
        }
    }

    public void sendCustomNotification(String userId, String title, String message) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                sendEmailNotification(user.getEmail(), title, message);
                sendPushNotification(userId, title, message);
            }
        } catch (Exception e) {
            log.error("Failed to send custom notification to user {}: {}", userId, message, e);
        }
    }

    public void sendRainAlert(String userId, String city) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getPreferences().isRainAlertsEnabled()) {
            String message = "Rain expected in " + city + " within the next few hours. Don't forget your umbrella!";
            sendCustomNotification(userId, "Rain Alert", message);
        }
    }

    public void sendTemperatureAlert(String userId, String city, double temperature, double threshold) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getPreferences().isTemperatureAlertsEnabled()) {
            String message = String.format("Temperature alert for %s: %.1f°C (threshold: %.1f°C)",
                    city, temperature, threshold);
            sendCustomNotification(userId, "Temperature Alert", message);
        }
    }

    public void sendUvIndexAlert(String userId, String city, double uvIndex) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getPreferences().isUvIndexAlertsEnabled()) {
            String message = String.format("High UV index in %s: %.1f. Use sun protection!", city, uvIndex);
            sendCustomNotification(userId, "UV Index Alert", message);
        }
    }

    public void sendAirQualityAlert(String userId, String city, int aqi, String healthImpact) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getPreferences().isAirQualityAlertsEnabled()) {
            String message = String.format("Air quality alert for %s: AQI %d (%s). Consider limiting outdoor activities.",
                    city, aqi, healthImpact);
            sendCustomNotification(userId, "Air Quality Alert", message);
        }
    }

    private List<User> findUsersInterestedInCity(String city) {
        // Find users who have this city in their favorites
        return userRepository.findByFavoriteCitiesContainingIgnoreCase(city);
    }

    private boolean shouldSendAlert(User user, WeatherAlert alert) {
        if (user.getPreferences() == null || !user.getPreferences().isWeatherAlertsEnabled()) {
            return false;
        }

        // Check alert type preferences
        String alertType = alert.getEvent().toLowerCase();

        if (alertType.contains("rain") && !user.getPreferences().isRainAlertsEnabled()) {
            return false;
        }

        if (alertType.contains("temperature") && !user.getPreferences().isTemperatureAlertsEnabled()) {
            return false;
        }

        if (alertType.contains("uv") && !user.getPreferences().isUvIndexAlertsEnabled()) {
            return false;
        }

        if (alertType.contains("air quality") && !user.getPreferences().isAirQualityAlertsEnabled()) {
            return false;
        }

        return true;
    }

    private void sendAlertToUser(User user, WeatherAlert alert) {
        try {
            // Send email notification
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                sendEmailNotification(user.getEmail(), alert.getEvent(), alert.getDescription());
            }

            // Send push notification
            sendPushNotification(user.getId(), alert.getEvent(), alert.getDescription());

        } catch (Exception e) {
            log.error("Failed to send alert to user {}: {}", user.getId(), alert.getEvent(), e);
        }
    }

    private void sendEmailNotification(String email, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(email);
            mailMessage.setSubject("WeatherApp Alert: " + subject);
            mailMessage.setText(message + "\n\nBest regards,\nWeatherApp Team");
            mailMessage.setSentDate(new java.util.Date());

            mailSender.send(mailMessage);
            log.info("Email notification sent to {}: {}", email, subject);

        } catch (Exception e) {
            log.error("Failed to send email notification to {}: {}", email, subject, e);
        }
    }

    // Push notification implementation (placeholder for FCM integration)
    public void sendPushNotification(String userId, String title, String message) {
        try {
            // TODO: Integrate with Firebase Cloud Messaging (FCM) or other push notification service

            // For now, log the notification
            log.info("Push notification for user {}: {} - {}", userId, title, message);

            // In a real implementation, you would:
            // 1. Get user's FCM token from database
            // 2. Create FCM message
            // 3. Send via FCM SDK

            /*
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent() && userOpt.get().getFcmToken() != null) {
                Message fcmMessage = Message.builder()
                    .setToken(userOpt.get().getFcmToken())
                    .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(message)
                        .build())
                    .build();

                FirebaseMessaging.getInstance().send(fcmMessage);
            }
            */

        } catch (Exception e) {
            log.error("Failed to send push notification to user {}: {}", userId, title, e);
        }
    }

    public void sendBulkNotification(List<String> userIds, String title, String message) {
        for (String userId : userIds) {
            sendCustomNotification(userId, title, message);
        }
    }

    public void scheduleWeatherUpdate(String userId, String city) {
        // This would integrate with a job scheduler to send periodic weather updates
        log.info("Scheduled weather update for user {} in city {}", userId, city);
    }
}