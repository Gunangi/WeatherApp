package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherAlertRepository extends MongoRepository<WeatherAlert, String> {
    List<WeatherAlert> findByUserId(String userId);

    // Changed from location to city to match the entity
    List<WeatherAlert> findByCityAndActive(String city, boolean active);
}