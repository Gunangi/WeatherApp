// src/main/java/com/example/weatherapp/repository/WeatherAlertRepository.java
package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.Instant;
import java.util.List;

public interface WeatherAlertRepository extends MongoRepository<WeatherAlert, String> {
    List<WeatherAlert> findByCityIgnoreCase(String city);
    List<WeatherAlert> findByCityIgnoreCaseAndActiveTrue(String city);
    List<WeatherAlert> findByCityIgnoreCaseAndEventAndActiveTrue(String city, String event);
    List<WeatherAlert> findByEndTimeBeforeAndActiveTrue(Instant endTime);
    List<WeatherAlert> findBySeverityAndActiveTrue(String severity);
    List<WeatherAlert> findByAlertTypeAndActiveTrue(String alertType);
    void deleteByCityIgnoreCaseAndActiveFalseAndCreatedAtBefore(String city, Instant cutoffDate);
}