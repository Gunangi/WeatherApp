package com.example.weatherapp.repository;

import com.example.weatherapp.model.ForecastData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ForecastDataRepository extends MongoRepository<ForecastData, String> {

    /**
     * Find forecast data for a specific location
     */
    List<ForecastData> findByLocationOrderByForecastDateTimeDesc(String location);

    /**
     * Find forecast data for a location within a date range
     */
    List<ForecastData> findByLocationAndForecastDateTimeBetweenOrderByForecastDateTime(
            String location,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find 5-day forecast for a location
     */
    @Query("{'location': ?0, 'forecastDateTime': {$gte: ?1, $lte: ?2}}")
    List<ForecastData> findFiveDayForecast(String location, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find hourly forecast for next 24 hours
     */
    @Query("{'location': ?0, 'forecastType': 'HOURLY', 'forecastDateTime': {$gte: ?1, $lte: ?2}}")
    List<ForecastData> findHourlyForecast(String location, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Find daily forecast
     */
    @Query("{'location': ?0, 'forecastType': 'DAILY'}")
    List<ForecastData> findDailyForecast(String location);

    /**
     * Find forecast by coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    List<ForecastData> findByCoordinatesOrderByForecastDateTime(Double latitude, Double longitude);

    /**
     * Find forecast data by forecast type
     */
    List<ForecastData> findByForecastTypeAndLocationOrderByForecastDateTime(String forecastType, String location);

    /**
     * Find the most recent forecast data for a location
     */
    Optional<ForecastData> findTopByLocationOrderByCreatedAtDesc(String location);

    /**
     * Find forecast data for multiple locations
     */
    List<ForecastData> findByLocationInOrderByForecastDateTime(List<String> locations);

    /**
     * Find forecast data with rain probability above threshold
     */
    @Query("{'rainProbability': {$gte: ?0}}")
    List<ForecastData> findByHighRainProbability(Double threshold);

    /**
     * Find forecast data with extreme temperatures
     */
    @Query("{'$or': [{'minTemperature': {$lte: ?0}}, {'maxTemperature': {$gte: ?1}}]}")
    List<ForecastData> findByExtremeTemperatureForecast(Double lowTemp, Double highTemp);

    /**
     * Find forecast data by weather condition
     */
    List<ForecastData> findByWeatherConditionContainingIgnoreCaseOrderByForecastDateTime(String condition);

    /**
     * Find forecast data by user ID
     */
    List<ForecastData> findByUserIdOrderByForecastDateTime(String userId);

    /**
     * Delete old forecast data
     */
    void deleteByCreatedAtBefore(LocalDateTime timestamp);

    /**
     * Delete expired forecast data (past forecasts)
     */
    void deleteByForecastDateTimeBefore(LocalDateTime timestamp);

    /**
     * Find forecast data with high wind speeds
     */
    @Query("{'windSpeed': {$gte: ?0}}")
    List<ForecastData> findByHighWindSpeedForecast(Double windSpeedThreshold);

    /**
     * Find forecast data for specific day of week (0-6, Sunday-Saturday)
     */
    @Query("{'dayOfWeek': ?0}")
    List<ForecastData> findByDayOfWeek(Integer dayOfWeek);

    /**
     * Count forecast entries for a location
     */
    long countByLocation(String location);

    /**
     * Check if forecast exists for location and date range
     */
    boolean existsByLocationAndForecastDateTimeBetween(String location, LocalDateTime start, LocalDateTime end);

    /**
     * Find latest forecast data created after a specific time
     */
    @Query("{'createdAt': {$gte: ?0}}")
    List<ForecastData> findRecentForecastData(LocalDateTime sinceTime);

    /**
     * Find forecast data with UV index above threshold
     */
    @Query("{'uvIndex': {$gte: ?0}}")
    List<ForecastData> findByHighUvIndex(Integer uvThreshold);
}