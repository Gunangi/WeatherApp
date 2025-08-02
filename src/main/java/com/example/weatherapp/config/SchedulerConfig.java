// src/main/java/com/example/weatherapp/config/SchedulerConfig.java
package com.example.weatherapp.config;

import com.example.weatherapp.service.WeatherAlertService;
import com.example.weatherapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {

    private final WeatherAlertService weatherAlertService;

    // Check for expired alerts every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredAlerts() {
        try {
            weatherAlertService.deactivateExpiredAlerts();
        } catch (Exception e) {
            log.error("Failed to cleanup expired alerts", e);
        }
    }

    // Update weather data for all favorite cities every 30 minutes
    @Scheduled(fixedRate = 1800000)
    public void updateFavoriteCitiesWeather() {
        try {
            log.info("Scheduled task: Updating weather data for favorite cities");
            // This would iterate through all users' favorite cities and refresh data
            // Implementation would depend on your specific requirements
        } catch (Exception e) {
            log.error("Failed to update favorite cities weather", e);
        }
    }

    // Send daily weather summary at 7 AM (adjust timezone as needed)
    @Scheduled(cron = "0 0 7 * * *")
    public void sendDailyWeatherSummary() {
        try {
            log.info("Scheduled task: Sending daily weather summaries");
            // Implementation would send weather summaries to users who opted in
        } catch (Exception e) {
            log.error("Failed to send daily weather summaries", e);
        }
    }

    // Check for severe weather alerts every 15 minutes
    @Scheduled(fixedRate = 900000)
    public void checkSevereWeatherAlerts() {
        try {
            log.info("Scheduled task: Checking for severe weather alerts");
            // This would check for severe weather conditions and create alerts
        } catch (Exception e) {
            log.error("Failed to check severe weather alerts", e);
        }
    }

    // Clean up old weather data every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupOldWeatherData() {
        try {
            log.info("Scheduled task: Cleaning up old weather data");
            // Remove weather data older than retention period
        } catch (Exception e) {
            log.error("Failed to cleanup old weather data", e);
        }
    }
}