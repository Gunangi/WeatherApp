// src/main/java/com/example/weatherapp/repository/UserRepository.java
package com.example.weatherapp.repository;

import com.example.weatherapp.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Find users who have a specific city in their favorites
    List<User> findByFavoriteCitiesContainingIgnoreCase(String city);

    // Find users with notifications enabled
    @Query("{ 'preferences.notificationsEnabled': true }")
    List<User> findUsersWithNotificationsEnabled();

    // Find users with specific alert preferences enabled
    @Query("{ 'preferences.rainAlertsEnabled': true }")
    List<User> findUsersWithRainAlertsEnabled();

    @Query("{ 'preferences.temperatureAlertsEnabled': true }")
    List<User> findUsersWithTemperatureAlertsEnabled();

    @Query("{ 'preferences.uvIndexAlertsEnabled': true }")
    List<User> findUsersWithUvIndexAlertsEnabled();

    @Query("{ 'preferences.airQualityAlertsEnabled': true }")
    List<User> findUsersWithAirQualityAlertsEnabled();
}