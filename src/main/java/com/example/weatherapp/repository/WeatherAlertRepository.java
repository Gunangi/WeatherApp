package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherAlertRepository extends MongoRepository<WeatherAlert, String> {

    /**
     * Find active alerts for a specific location
     */
    @Query("{'location': ?0, 'isActive': true}")
    List<WeatherAlert> findActiveAlertsByLocation(String location);

    /**
     * Find all active alerts
     */
    List<WeatherAlert> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);

    /**
     * Find alerts for a specific user
     */
    List<WeatherAlert> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Find active alerts for a user
     */
    List<WeatherAlert> findByUserIdAndIsActiveOrderByCreatedAtDesc(String userId, Boolean isActive);

    /**
     * Find alerts by severity level
     */
    List<WeatherAlert> findBySeverityOrderByCreatedAtDesc(String severity);

    /**
     * Find high priority alerts (Critical, Severe)
     */
    @Query("{'severity': {$in: ['CRITICAL', 'SEVERE']}, 'isActive': true}")
    List<WeatherAlert> findHighPriorityActiveAlerts();

    /**
     * Find alerts by alert type
     */
    List<WeatherAlert> findByAlertTypeOrderByCreatedAtDesc(String alertType);

    /**
     * Find alerts for coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    List<WeatherAlert> findByCoordinatesOrderByCreatedAtDesc(Double latitude, Double longitude);

    /**
     * Find active alerts by coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1, 'isActive': true}")
    List<WeatherAlert> findActiveAlertsByCoordinates(Double latitude, Double longitude);

    /**
     * Find alerts within a time range
     */
    List<WeatherAlert> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    /**
     * Find alerts that are still valid (not expired)
     */
    @Query("{'expiresAt': {$gt: ?0}, 'isActive': true}")
    List<WeatherAlert> findValidAlerts(LocalDateTime currentTime);

    /**
     * Find expired alerts that are still marked as active
     */
    @Query("{'expiresAt': {$lt: ?0}, 'isActive': true}")
    List<WeatherAlert> findExpiredActiveAlerts(LocalDateTime currentTime);

    /**
     * Find alerts by location and alert type
     */
    List<WeatherAlert> findByLocationAndAlertTypeOrderByCreatedAtDesc(String location, String alertType);

    /**
     * Find alerts for multiple locations
     */
    List<WeatherAlert> findByLocationInOrderByCreatedAtDesc(List<String> locations);

    /**
     * Find unread alerts for a user
     */
    List<WeatherAlert> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, Boolean isRead);

    /**
     * Find alerts by notification status
     */
    List<WeatherAlert> findByUserIdAndNotificationSentOrderByCreatedAtDesc(String userId, Boolean notificationSent);

    /**
     * Find recent alerts (last N hours)
     */
    @Query("{'createdAt': {$gte: ?0}}")
    List<WeatherAlert> findRecentAlerts(LocalDateTime sinceTime);

    /**
     * Find alerts by weather condition
     */
    @Query("{'weatherCondition': {$regex: ?0, $options: 'i'}}")
    List<WeatherAlert> findByWeatherCondition(String condition);

    /**
     * Find temperature-based alerts
     */
    @Query("{'alertType': {$in: ['EXTREME_HEAT', 'EXTREME_COLD', 'TEMPERATURE_THRESHOLD']}}")
    List<WeatherAlert> findTemperatureAlerts();

    /**
     * Find wind-based alerts
     */
    @Query("{'alertType': {$in: ['HIGH_WIND', 'WIND_ADVISORY', 'STORM']}}")
    List<WeatherAlert> findWindAlerts();

    /**
     * Find precipitation-based alerts
     */
    @Query("{'alertType': {$in: ['HEAVY_RAIN', 'SNOW_ADVISORY', 'FLOOD_WARNING']}}")
    List<WeatherAlert> findPrecipitationAlerts();

    /**
     * Find air quality alerts
     */
    @Query("{'alertType': {$in: ['AIR_QUALITY', 'POLLUTION_ALERT']}}")
    List<WeatherAlert> findAirQualityAlerts();

    /**
     * Count active alerts for a location
     */
    long countByLocationAndIsActive(String location, Boolean isActive);

    /**
     * Count unread alerts for a user
     */
    long countByUserIdAndIsRead(String userId, Boolean isRead);

    /**
     * Find alerts needing notification
     */
    @Query("{'isActive': true, 'notificationSent': false, 'userId': {$exists: true}}")
    List<WeatherAlert> findAlertsNeedingNotification();

    /**
     * Find duplicate alerts (same type, location, and time window)
     */
    @Query("{'location': ?0, 'alertType': ?1, 'createdAt': {$gte: ?2}}")
    List<WeatherAlert> findPotentialDuplicates(String location, String alertType, LocalDateTime timeWindow);

    /**
     * Delete old alerts
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);

    /**
     * Delete expired inactive alerts
     */
    @Query(value = "{'expiresAt': {$lt: ?0}, 'isActive': false}", delete = true)
    void deleteExpiredInactiveAlerts(LocalDateTime currentTime);

    /**
     * Find alerts by custom threshold values
     */
    @Query("{'thresholdValue': {$gte: ?0}, 'thresholdType': ?1}")
    List<WeatherAlert> findByThreshold(Double thresholdValue, String thresholdType);

    /**
     * Find alerts with specific tags
     */
    @Query("{'tags': {$in: [?0]}}")
    List<WeatherAlert> findByTag(String tag);

    /**
     * Update notification status for multiple alerts
     */
    @Query("{'_id': {$in: ?0}}")
    List<WeatherAlert> findAlertsForNotificationUpdate(List<String> alertIds);

    /**
     * Find alerts that should be automatically dismissed
     */
    @Query("{'isActive': true, 'autoDismiss': true, 'expiresAt': {$lt: ?0}}")
    List<WeatherAlert> findAlertsForAutoDismissal(LocalDateTime currentTime);
}
