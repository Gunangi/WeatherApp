package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherAlertRepository extends MongoRepository<WeatherAlert, String> {

    List<WeatherAlert> findByIsActiveTrue();

    List<WeatherAlert> findByUserIdAndIsActiveTrue(String userId);

    List<WeatherAlert> findByUserIdAndLocationId(String userId, String locationId);

    List<WeatherAlert> findByAlertTypeAndIsActiveTrue(AlertType alertType);

    List<WeatherAlert> findByNextCheckBefore(LocalDateTime dateTime);

    void deleteByUserIdAndLocationId(String userId, String locationId);
}
