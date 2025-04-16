package com.example.weatherapp.repository;

import com.example.weatherapp.model.ForecastData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ForecastRepository extends MongoRepository<ForecastData, String> {
    List<ForecastData> findByCity(String city);
    List<ForecastData> findByCityAndDateTimeBetween(String city, LocalDateTime start, LocalDateTime end);
}
