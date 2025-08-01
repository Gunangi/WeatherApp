package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherDataRepository extends MongoRepository<WeatherData, String> {

    /**
     * Find the most recent weather data for a specific location
     */
    Optional<WeatherData> findTopByLocationOrderByTimestampDesc(String location);

    /**
     * Find weather data for a location within a specific time range
     */
    List<WeatherData> findByLocationAndTimestampBetweenOrderByTimestampDesc(
            String location,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    /**
     * Find weather data by coordinates (latitude and longitude)
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    List<WeatherData> findByCoordinates(Double latitude, Double longitude);

    /**
     * Find the most recent weather data by coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    Optional<WeatherData> findTopByCoordinatesOrderByTimestampDesc(Double latitude, Double longitude);

    /**
     * Find weather data for multiple locations
     */
    List<WeatherData> findByLocationInOrderByTimestampDesc(List<String> locations);

    /**
     * Find weather data within temperature range
     */
    List<WeatherData> findByTemperatureBetweenOrderByTimestampDesc(Double minTemp, Double maxTemp);

    /**
     * Find weather data by weather condition
     */
    List<WeatherData> findByWeatherConditionContainingIgnoreCaseOrderByTimestampDesc(String condition);

    /**
     * Delete old weather data before a specific timestamp
     */
    void deleteByTimestampBefore(LocalDateTime timestamp);

    /**
     * Count weather data entries for a location
     */
    long countByLocation(String location);

    /**
     * Find weather data by user ID (for personalized data)
     */
    List<WeatherData> findByUserIdOrderByTimestampDesc(String userId);

    /**
     * Find weather data with high wind speeds (for alerts)
     */
    @Query("{'windSpeed': {$gte: ?0}}")
    List<WeatherData> findByHighWindSpeed(Double windSpeedThreshold);

    /**
     * Find weather data with extreme temperatures
     */
    @Query("{'$or': [{'temperature': {$lte: ?0}}, {'temperature': {$gte: ?1}}]}")
    List<WeatherData> findByExtremeTemperatures(Double lowTemp, Double highTemp);

    /**
     * Find weather data by visibility range
     */
    List<WeatherData> findByVisibilityLessThanOrderByTimestampDesc(Double visibility);

    /**
     * Find recent weather data (last N hours)
     */
    @Query("{'timestamp': {$gte: ?0}}")
    List<WeatherData> findRecentWeatherData(LocalDateTime sinceTime);

    /**
     * Check if weather data exists for location and timestamp
     */
    boolean existsByLocationAndTimestampBetween(String location, LocalDateTime start, LocalDateTime end);
}