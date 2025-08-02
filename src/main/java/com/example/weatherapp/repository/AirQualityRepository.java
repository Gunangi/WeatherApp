package com.example.weatherapp.repository;

import com.example.weatherapp.model.AirQualityData;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AirQualityRepository extends MongoRepository<AirQualityData, String> {
    Optional<AirQualityData> findByCityIgnoreCase(String city);
}