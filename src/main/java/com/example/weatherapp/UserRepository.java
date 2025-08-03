package com.example.weatherapp;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<UserPreferences, String> {

    /**
     * Find user preferences by userId
     */
    Optional<UserPreferences> findByUserId(String userId);

    /**
     * Check if user preferences exist for a given userId
     */
    boolean existsByUserId(String userId);

    /**
     * Find all users with a specific theme preference
     */
    List<UserPreferences> findByTheme(String theme);

    /**
     * Find all users with a specific temperature unit preference
     */
    List<UserPreferences> findByTemperatureUnit(String temperatureUnit);

    /**
     * Find all users who have notifications enabled
     */
    List<UserPreferences> findByNotificationsTrue();

    /**
     * Find all users who have weather alerts enabled
     */
    List<UserPreferences> findByWeatherAlertsTrue();

    /**
     * Find all users who have air quality alerts enabled
     */
    List<UserPreferences> findByAirQualityAlertsTrue();

    /**
     * Find users by default city
     */
    List<UserPreferences> findByDefaultCity(String defaultCity);

    /**
     * Find users who have location access enabled
     */
    List<UserPreferences> findByLocationAccessTrue();

    /**
     * Find users with temperature alerts enabled and within temperature thresholds
     */
    @Query("{ 'temperatureAlerts': true, 'temperatureThresholdHigh': { $gte: ?0 }, 'temperatureThresholdLow': { $lte: ?1 } }")
    List<UserPreferences> findUsersForTemperatureAlerts(Double currentTemp, Double currentTemp2);

    /**
     * Find users with favorite locations containing a specific city
     */
    @Query("{ 'favoriteLocations': { $in: [?0] } }")
    List<UserPreferences> findByFavoriteLocationsContaining(String city);

    /**
     * Delete user preferences by userId
     */
    void deleteByUserId(String userId);

    /**
     * Count users by theme preference
     */
    long countByTheme(String theme);

    /**
     * Count users by temperature unit preference
     */
    long countByTemperatureUnit(String temperatureUnit);

    /**
     * Find users with custom settings containing a specific key
     */
    @Query("{ 'customSettings.?0': { $exists: true } }")
    List<UserPreferences> findByCustomSettingsKey(String key);
}