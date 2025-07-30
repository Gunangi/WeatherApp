package com.example.weatherapp.service;

import com.example.weatherapp.model.*;
import com.example.weatherapp.repository.NotificationRepository;
import com.example.weatherapp.config.FirebaseConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FirebaseConfig firebaseConfig;

    @Async
    public CompletableFuture<Void> sendWeatherAlert(Location location, String title, String message) {
        try {
            log.info("Sending weather alert for {}: {}", location.getCity(), title);

            WeatherNotification notification = WeatherNotification.builder()
                    .location(location)
                    .title(title)
                    .message(message)
                    .type(NotificationType.WEATHER_ALERT)
                    .priority(NotificationPriority.HIGH)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            // Save notification to database
            notificationRepository.save(notification);

            // Send push notification
            sendPushNotification(notification);

            // Send email notification if configured
            sendEmailNotification(notification);

            log.info("Weather alert sent successfully for: {}", location.getCity());

        } catch (Exception e) {
            log.error("Error sending weather alert: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendHealthAlert(Location location, String title, String message) {
        try {
            log.info("Sending health alert for {}: {}", location.getCity(), title);

            WeatherNotification notification = WeatherNotification.builder()
                    .location(location)
                    .title(title)
                    .message(message)
                    .type(NotificationType.HEALTH_ALERT)
                    .priority(NotificationPriority.MEDIUM)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            sendPushNotification(notification);

            log.info("Health alert sent successfully for: {}", location.getCity());

        } catch (Exception e) {
            log.error("Error sending health alert: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendDailyWeatherSummary(String userId, Location location, WeatherData weather) {
        try {
            log.info("Sending daily weather summary for user: {} at {}", userId, location.getCity());

            String message = buildDailyWeatherMessage(weather);

            WeatherNotification notification = WeatherNotification.builder()
                    .userId(userId)
                    .location(location)
                    .title("Daily Weather Summary")
                    .message(message)
                    .type(NotificationType.DAILY_SUMMARY)
                    .priority(NotificationPriority.LOW)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            sendPushNotification(notification);

        } catch (Exception e) {
            log.error("Error sending daily weather summary: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendCustomReminder(String userId, Location location, String reminderType, String message) {
        try {
            log.info("Sending custom reminder for user: {} - Type: {}", userId, reminderType);

            WeatherNotification notification = WeatherNotification.builder()
                    .userId(userId)
                    .location(location)
                    .title(getCustomReminderTitle(reminderType))
                    .message(message)
                    .type(NotificationType.CUSTOM_REMINDER)
                    .priority(NotificationPriority.MEDIUM)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            sendPushNotification(notification);

        } catch (Exception e) {
            log.error("Error sending custom reminder: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    public List<WeatherNotification> getUserNotifications(String userId, int limit) {
        try {
            log.info("Fetching notifications for user: {}", userId);
            return notificationRepository.findByUserIdOrderByTimestampDesc(userId, limit);
        } catch (Exception e) {
            log.error("Error fetching user notifications: {}", e.getMessage());
            return List.of();
        }
    }

    public List<WeatherNotification> getUnreadNotifications(String userId) {
        try {
            return notificationRepository.findByUserIdAndIsReadFalse(userId);
        } catch (Exception e) {
            log.error("Error fetching unread notifications: {}", e.getMessage());
            return List.of();
        }
    }

    public void markNotificationAsRead(String notificationId) {
        try {
            notificationRepository.markAsRead(notificationId);
            log.info("Notification marked as read: {}", notificationId);
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", e.getMessage());
        }
    }

    public void markAllNotificationsAsRead(String userId) {
        try {
            notificationRepository.markAllAsReadForUser(userId);
            log.info("All notifications marked as read for user: {}", userId);
        } catch (Exception e) {
            log.error("Error marking all notifications as read: {}", e.getMessage());
        }
    }

    public NotificationSettings getUserNotificationSettings(String userId) {
        try {
            return notificationRepository.findNotificationSettingsByUserId(userId);
        } catch (Exception e) {
            log.error("Error fetching notification settings: {}", e.getMessage());
            return getDefaultNotificationSettings();
        }
    }

    public void updateNotificationSettings(String userId, NotificationSettings settings) {
        try {
            settings.setUserId(userId);
            settings.setUpdatedAt(LocalDateTime.now());
            notificationRepository.saveNotificationSettings(settings);
            log.info("Notification settings updated for user: {}", userId);
        } catch (Exception e) {
            log.error("Error updating notification settings: {}", e.getMessage());
        }
    }

    public void deleteNotification(String notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
            log.info("Notification deleted: {}", notificationId);
        } catch (Exception e) {
            log.error("Error deleting notification: {}", e.getMessage());
        }
    }

    public void clearOldNotifications(int daysToKeep) {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
            int deletedCount = notificationRepository.deleteOlderThan(cutoffDate);
            log.info("Cleared {} old notifications older than {} days", deletedCount, daysToKeep);
        } catch (Exception e) {
            log.error("Error clearing old notifications: {}", e.getMessage());
        }
    }

    private void sendPushNotification(WeatherNotification notification) {
        try {
            if (shouldSendPushNotification(notification)) {
                Map<String, String> data = new HashMap<>();
                data.put("title", notification.getTitle());
                data.put("message", notification.getMessage());
                data.put("type", notification.getType().toString());
                data.put("location", notification.getLocation().getCity());
                data.put("timestamp", notification.getTimestamp().toString());

                // Use Firebase Cloud Messaging to send push notification
                firebaseConfig.sendPushNotification(notification.getUserId(), data);

                log.info("Push notification sent for: {}", notification.getTitle());
            }
        } catch (Exception e) {
            log.error("Error sending push notification: {}", e.getMessage());
        }
    }

    private void sendEmailNotification(WeatherNotification notification) {
        try {
            if (shouldSendEmailNotification(notification)) {
                // Email sending logic would go here
                // This could integrate with SendGrid, AWS SES, or similar service
                log.info("Email notification would be sent for: {}", notification.getTitle());
            }
        } catch (Exception e) {
            log.error("Error sending email notification: {}", e.getMessage());
        }
    }

    private boolean shouldSendPushNotification(WeatherNotification notification) {
        if (notification.getUserId() == null) return false;

        NotificationSettings settings = getUserNotificationSettings(notification.getUserId());

        switch (notification.getType()) {
            case WEATHER_ALERT:
                return settings.isWeatherAlertsEnabled();
            case HEALTH_ALERT:
                return settings.isHealthAlertsEnabled();
            case DAILY_SUMMARY:
                return settings.isDailySummaryEnabled();
            case CUSTOM_REMINDER:
                return settings.isCustomRemindersEnabled();
            default:
                return true;
        }
    }

    private boolean shouldSendEmailNotification(WeatherNotification notification) {
        if (notification.getUserId() == null) return false;

        NotificationSettings settings = getUserNotificationSettings(notification.getUserId());
        return settings.isEmailNotificationsEnabled() &&
                notification.getPriority() == NotificationPriority.HIGH;
    }

    private String buildDailyWeatherMessage(WeatherData weather) {
        StringBuilder message = new StringBuilder();
        message.append(String.format("Good morning! Today in %s: ", weather.getLocation().getCity()));
        message.append(String.format("%s°C, %s. ", weather.getTemperature(), weather.getCondition()));
        message.append(String.format("Feels like %s°C. ", weather.getFeelsLike()));

        if (weather.getCondition().toLowerCase().contains("rain")) {
            message.append("Don't forget your umbrella! ");
        }

        if (weather.getTemperature() < 10) {
            message.append("Bundle up, it's cold today! ");
        } else if (weather.getTemperature() > 30) {
            message.append("Stay hydrated, it's going to be hot! ");
        }

        return message.toString();
    }

    private String getCustomReminderTitle(String reminderType) {
        switch (reminderType.toLowerCase()) {
            case "umbrella":
                return "☔ Don't Forget Your Umbrella!";
            case "sunscreen":
                return "☀️ UV Alert - Apply Sunscreen";
            case "jacket":
                return "🧥 It's Cold - Wear a Jacket";
            case "hydration":
                return "💧 Stay Hydrated Today";
            case "allergy":
                return "🤧 High Pollen Alert";
            default:
                return "🌤️ Weather Reminder";
        }
    }

    private NotificationSettings getDefaultNotificationSettings() {
        return NotificationSettings.builder()
                .weatherAlertsEnabled(true)
                .healthAlertsEnabled(true)
                .dailySummaryEnabled(false)
                .customRemindersEnabled(true)
                .emailNotificationsEnabled(false)
                .pushNotificationsEnabled(true)
                .quietHoursStart(22) // 10 PM
                .quietHoursEnd(7)    // 7 AM
                .build();
    }

    public void scheduleWeatherAlerts(String userId, Location location, List<String> alertTypes) {
        try {
            log.info("Scheduling weather alerts for user: {} at {}", userId, location.getCity());

            // Save user's alert preferences
            UserAlertPreferences preferences = UserAlertPreferences.builder()
                    .userId(userId)
                    .location(location)
                    .alertTypes(alertTypes)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.saveUserAlertPreferences(preferences);

        } catch (Exception e) {
            log.error("Error scheduling weather alerts: {}", e.getMessage());
        }
    }

    public void cancelWeatherAlerts(String userId, Location location) {
        try {
            log.info("Cancelling weather alerts for user: {} at {}", userId, location.getCity());
            notificationRepository.deactivateUserAlertPreferences(userId, location);
        } catch (Exception e) {
            log.error("Error cancelling weather alerts: {}", e.getMessage());
        }
    }

    @Async
    public CompletableFuture<Void> sendBulkNotifications(List<WeatherNotification> notifications) {
        try {
            log.info("Sending {} bulk notifications", notifications.size());

            for (WeatherNotification notification : notifications) {
                notificationRepository.save(notification);
                sendPushNotification(notification);
            }

            log.info("Bulk notifications sent successfully");

        } catch (Exception e) {
            log.error("Error sending bulk notifications: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    public NotificationStats getNotificationStats(String userId) {
        try {
            return notificationRepository.getNotificationStats(userId);
        } catch (Exception e) {
            log.error("Error fetching notification stats: {}", e.getMessage());
            return NotificationStats.builder()
                    .totalSent(0)
                    .totalRead(0)
                    .totalUnread(0)
                    .build();
        }
    }