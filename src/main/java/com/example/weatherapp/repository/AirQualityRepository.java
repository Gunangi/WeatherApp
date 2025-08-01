package com.example.weatherapp.repository;

import com.example.weatherapp.model.AirQualityData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AirQualityRepository extends MongoRepository<AirQualityData, String> {

    /**
     * Find the most recent air quality data for a location
     */
    Optional<AirQualityData> findTopByLocationOrderByTimestampDesc(String location);

    /**
     * Find air quality data for a location within a time range
     */
    List<AirQualityData> findByLocationAndTimestampBetweenOrderByTimestampDesc(
            String location,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    /**
     * Find air quality data by coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    List<AirQualityData> findByCoordinatesOrderByTimestampDesc(Double latitude, Double longitude);

    /**
     * Find the most recent air quality data by coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    Optional<AirQualityData> findTopByCoordinatesOrderByTimestampDesc(Double latitude, Double longitude);

    /**
     * Find air quality data by AQI level
     */
    List<AirQualityData> findByAqiOrderByTimestampDesc(Integer aqi);

    /**
     * Find air quality data with AQI above threshold (unhealthy levels)
     */
    @Query("{'aqi': {$gte: ?0}}")
    List<AirQualityData> findByHighAqi(Integer aqiThreshold);

    /**
     * Find air quality data with AQI within range
     */
    List<AirQualityData> findByAqiBetweenOrderByTimestampDesc(Integer minAqi, Integer maxAqi);

    /**
     * Find air quality data by quality level (Good, Moderate, Unhealthy, etc.)
     */
    List<AirQualityData> findByQualityLevelOrderByTimestampDesc(String qualityLevel);

    /**
     * Find air quality data for multiple locations
     */
    List<AirQualityData> findByLocationInOrderByTimestampDesc(List<String> locations);

    /**
     * Find air quality data with high CO levels
     */
    @Query("{'pollutants.co': {$gte: ?0}}")
    List<AirQualityData> findByHighCarbonMonoxide(Double coThreshold);

    /**
     * Find air quality data with high NO2 levels
     */
    @Query("{'pollutants.no2': {$gte: ?0}}")
    List<AirQualityData> findByHighNitrogenDioxide(Double no2Threshold);

    /**
     * Find air quality data with high O3 levels
     */
    @Query("{'pollutants.o3': {$gte: ?0}}")
    List<AirQualityData> findByHighOzone(Double o3Threshold);

    /**
     * Find air quality data with high SO2 levels
     */
    @Query("{'pollutants.so2': {$gte: ?0}}")
    List<AirQualityData> findByHighSulfurDioxide(Double so2Threshold);

    /**
     * Find air quality data with high PM2.5 levels
     */
    @Query("{'pollutants.pm25': {$gte: ?0}}")
    List<AirQualityData> findByHighPm25(Double pm25Threshold);

    /**
     * Find air quality data with high PM10 levels
     */
    @Query("{'pollutants.pm10': {$gte: ?0}}")
    List<AirQualityData> findByHighPm10(Double pm10Threshold);

    /**
     * Find air quality data by user ID
     */
    List<AirQualityData> findByUserIdOrderByTimestampDesc(String userId);

    /**
     * Find air quality data with any pollutant above dangerous levels
     */
    @Query("{'$or': [" +
            "{'pollutants.co': {$gte: ?0}}, " +
            "{'pollutants.no2': {$gte: ?1}}, " +
            "{'pollutants.o3': {$gte: ?2}}, " +
            "{'pollutants.so2': {$gte: ?3}}, " +
            "{'pollutants.pm25': {$gte: ?4}}, " +
            "{'pollutants.pm10': {$gte: ?5}}" +
            "]}")
    List<AirQualityData> findByDangerousPollutantLevels(
            Double coThreshold,
            Double no2Threshold,
            Double o3Threshold,
            Double so2Threshold,
            Double pm25Threshold,
            Double pm10Threshold
    );

    /**
     * Find recent air quality data (last N hours)
     */
    @Query("{'timestamp': {$gte: ?0}}")
    List<AirQualityData> findRecentAirQualityData(LocalDateTime sinceTime);

    /**
     * Delete old air quality data before a specific timestamp
     */
    void deleteByTimestampBefore(LocalDateTime timestamp);

    /**
     * Count air quality entries for a location
     */
    long countByLocation(String location);

    /**
     * Find air quality data with health recommendations
     */
    @Query("{'healthRecommendation': {$exists: true, $ne: null}}")
    List<AirQualityData> findWithHealthRecommendations();

    /**
     * Find air quality data by dominant pollutant
     */
    List<AirQualityData> findByDominantPollutantOrderByTimestampDesc(String dominantPollutant);

    /**
     * Check if air quality data exists for location and timestamp
     */
    boolean existsByLocationAndTimestampBetween(String location, LocalDateTime start, LocalDateTime end);

    /**
     * Find average AQI for a location over time period
     */
    @Query(value = "{'location': ?0, 'timestamp': {$gte: ?1, $lte: ?2}}",
            fields = "{'aqi': 1}")
    List<AirQualityData> findAqiDataForAverage(String location, LocalDateTime start, LocalDateTime end);
}