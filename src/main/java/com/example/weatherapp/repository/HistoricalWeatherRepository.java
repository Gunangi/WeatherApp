package com.example.weatherapp.repository;

import com.example.weatherapp.model.HistoricalWeather;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricalWeatherRepository extends MongoRepository<HistoricalWeather, String> {

    /**
     * Find historical weather data for a specific location and recorded timestamp.
     */
    Optional<HistoricalWeather> findByLatitudeAndLongitudeAndRecordedAt(double latitude, double longitude, LocalDateTime recordedAt);

    /**
     * Find historical weather data for a location within a date range, ordered by the recorded time.
     */
    List<HistoricalWeather> findByLatitudeAndLongitudeAndRecordedAtBetweenOrderByRecordedAtDesc(
            double latitude,
            double longitude,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );

    /**
     * Find all data for a specific location.
     */
    List<HistoricalWeather> findByLatitudeAndLongitudeOrderByRecordedAtDesc(double latitude, double longitude);


    /**
     * Find the earliest record for a location.
     */
    Optional<HistoricalWeather> findTopByLatitudeAndLongitudeOrderByRecordedAtAsc(double latitude, double longitude);

    /**
     * Find the latest record for a location.
     */
    Optional<HistoricalWeather> findTopByLatitudeAndLongitudeOrderByRecordedAtDesc(double latitude, double longitude);

    /**
     * Delete old historical data before a certain timestamp.
     */
    void deleteByRecordedAtBefore(LocalDateTime cutoffDateTime);

}