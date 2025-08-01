package com.example.weatherapp.repository;

import com.example.weatherapp.model.HistoricalWeather;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricalWeatherRepository extends MongoRepository<HistoricalWeather, String> {

    /**
     * Find historical weather data for a specific location and date
     */
    Optional<HistoricalWeather> findByLocationAndDate(String location, LocalDate date);

    /**
     * Find historical weather data for a location within a date range
     */
    List<HistoricalWeather> findByLocationAndDateBetweenOrderByDateDesc(
            String location,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find historical weather data by coordinates
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1}")
    List<HistoricalWeather> findByCoordinatesOrderByDateDesc(Double latitude, Double longitude);

    /**
     * Find historical weather data by coordinates and date range
     */
    @Query("{'coordinates.latitude': ?0, 'coordinates.longitude': ?1, 'date': {$gte: ?2, $lte: ?3}}")
    List<HistoricalWeather> findByCoordinatesAndDateRange(
            Double latitude,
            Double longitude,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find historical data for the same date in previous years
     */
    @Query("{'location': ?0, '$expr': {'$and': [{'$eq': [{'$dayOfMonth': '$date'}, ?1]}, {'$eq': [{'$month': '$date'}, ?2]}]}}")
    List<HistoricalWeather> findSameDateInPreviousYears(String location, Integer dayOfMonth, Integer month);

    /**
     * Find historical data for a specific month across years
     */
    @Query("{'location': ?0, '$expr': {'$eq': [{'$month': '$date'}, ?1]}}")
    List<HistoricalWeather> findByLocationAndMonth(String location, Integer month);

    /**
     * Find historical data for a specific year
     */
    @Query("{'location': ?0, '$expr': {'$eq': [{'$year': '$date'}, ?1]}}")
    List<HistoricalWeather> findByLocationAndYear(String location, Integer year);

    /**
     * Find extreme temperature records (highest/lowest)
     */
    @Query("{'location': ?0}")
    List<HistoricalWeather> findByLocationOrderByMaxTemperatureDesc(String location);

    /**
     * Find coldest days on record
     */
    @Query("{'location': ?0}")
    List<HistoricalWeather> findByLocationOrderByMinTemperatureAsc(String location);

    /**
     * Find historical data with extreme temperatures
     */
    @Query("{'location': ?0, '$or': [{'maxTemperature': {$gte: ?1}}, {'minTemperature': {$lte: ?2}}]}")
    List<HistoricalWeather> findExtremeTemperatures(String location, Double highTemp, Double lowTemp);

    /**
     * Find historical data with high precipitation
     */
    @Query("{'location': ?0, 'precipitation': {$gte: ?1}}")
    List<HistoricalWeather> findHighPrecipitationDays(String location, Double precipitationThreshold);

    /**
     * Find historical data by weather condition
     */
    List<HistoricalWeather> findByLocationAndWeatherConditionContainingIgnoreCaseOrderByDateDesc(
            String location,
            String condition
    );

    /**
     * Find historical data with high wind speeds
     */
    @Query("{'location': ?0, 'windSpeed': {$gte: ?1}}")
    List<HistoricalWeather> findHighWindDays(String location, Double windSpeedThreshold);

    /**
     * Find historical data for multiple locations
     */
    List<HistoricalWeather> findByLocationInAndDateBetweenOrderByDateDesc(
            List<String> locations,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find records for temperature analysis (monthly averages)
     */
    @Query("{'location': ?0, 'date': {$gte: ?1, $lte: ?2}}")
    List<HistoricalWeather> findForTemperatureAnalysis(String location, LocalDate startDate, LocalDate endDate);

    /**
     * Find historical data by season (spring, summer, fall, winter)
     */
    @Query("{'location': ?0, 'season': ?1}")
    List<HistoricalWeather> findByLocationAndSeason(String location, String season);

    /**
     * Find drought periods (low precipitation over time)
     */
    @Query("{'location': ?0, 'precipitation': {$lte: ?1}, 'date': {$gte: ?2, $lte: ?3}}")
    List<HistoricalWeather> findDroughtPeriods(
            String location,
            Double maxPrecipitation,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find heat wave periods (consecutive high temperature days)
     */
    @Query("{'location': ?0, 'maxTemperature': {$gte: ?1}, 'date': {$gte: ?2, $lte: ?3}}")
    List<HistoricalWeather> findHeatWavePeriods(
            String location,
            Double temperatureThreshold,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find historical data with UV index above threshold
     */
    @Query("{'location': ?0, 'uvIndex': {$gte: ?1}}")
    List<HistoricalWeather> findHighUvDays(String location, Integer uvThreshold);

    /**
     * Find historical data by humidity range
     */
    List<HistoricalWeather> findByLocationAndHumdityBetweenOrderByDateDesc(
            String location,
            Double minHumidity,
            Double maxHumidity
    );

    /**
     * Find historical data by pressure range
     */
    List<HistoricalWeather> findByLocationAndPressureBetweenOrderByDateDesc(
            String location,
            Double minPressure,
            Double maxPressure
    );

    /**
     * Count records for a location
     */
    long countByLocation(String location);

    /**
     * Count records for a location in a specific year
     */
    @Query(value = "{'location': ?0, '$expr': {'$eq': [{'$year': '$date'}, ?1]}}", count = true)
    long countByLocationAndYear(String location, Integer year);

    /**
     * Find oldest record for a location
     */
    Optional<HistoricalWeather> findTopByLocationOrderByDateAsc(String location);

    /**
     * Find newest record for a location
     */
    Optional<HistoricalWeather> findTopByLocationOrderByDateDesc(String location);

    /**
     * Find records with complete data (all fields populated)
     */
    @Query("{'location': ?0, 'maxTemperature': {$exists: true}, 'minTemperature': {$exists: true}, " +
            "'precipitation': {$exists: true}, 'windSpeed': {$exists: true}, 'humidity': {$exists: true}}")
    List<HistoricalWeather> findCompleteRecords(String location);

    /**
     * Find records with missing data
     */
    @Query("{'location': ?0, '$or': [" +
            "{'maxTemperature': {$exists: false}}, " +
            "{'minTemperature': {$exists: false}}, " +
            "{'precipitation': {$exists: false}}" +
            "]}")
    List<HistoricalWeather> findIncompleteRecords(String location);

    /**
     * Delete old historical data before a certain date
     */
    void deleteByDateBefore(LocalDate cutoffDate);

    /**
     * Find records for climate trend analysis
     */
    @Query("{'location': ?0, 'date': {$gte: ?1}}")
    List<HistoricalWeather> findForClimateAnalysis(String location, LocalDate startDate);

    /**
     * Find all unique locations with historical data
     */
    @Query(value = "{}", fields = "{'location': 1}")
    List<HistoricalWeather> findDistinctLocations();

    /**
     * Find temperature records (highest and lowest on record)
     */
    @Query("{'location': ?0}")
    Optional<HistoricalWeather> findHighestTemperatureRecord(String location);

    /**
     * Find precipitation records
     */
    @Query("{'location': ?0}")
    Optional<HistoricalWeather> findHighestPrecipitationRecord(String location);

    /**
     * Check if historical data exists for location and date
     */
    boolean existsByLocationAndDate(String location, LocalDate date);

    /**
     * Find records for weather pattern analysis
     */
    @Query("{'location': ?0, 'date': {$gte: ?1, $lte: ?2}, " +
            "'maxTemperature': {$exists: true}, 'precipitation': {$exists: true}}")
    List<HistoricalWeather> findForPatternAnalysis(String location, LocalDate startDate, LocalDate endDate);

    /**
     * Find anniversary weather (same date in history)
     */
    @Query("{'location': ?0, '$expr': {'$and': [" +
            "{'$eq': [{'$dayOfMonth': '$date'}, {'$dayOfMonth': ?1}]}, " +
            "{'$eq': [{'$month': '$date'}, {'$month': ?1}]}" +
            "]}}")
    List<HistoricalWeather> findAnniversaryWeather(String location, LocalDate referenceDate);
}