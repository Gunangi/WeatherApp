package com.example.weatherapp.repository;

import com.example.weatherapp.model.ForecastData;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ForecastDataRepository extends MongoRepository<ForecastData, String> {
    Optional<ForecastData> findByCityIgnoreCase(String city);
}