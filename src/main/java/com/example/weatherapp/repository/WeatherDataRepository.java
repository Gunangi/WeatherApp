package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherData;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface WeatherDataRepository extends MongoRepository<WeatherData, String> {
    Optional<WeatherData> findByCityIgnoreCase(String city);
}