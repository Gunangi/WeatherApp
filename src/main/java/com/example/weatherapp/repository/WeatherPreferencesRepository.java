package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeatherPreferencesRepository extends MongoRepository<WeatherPreferences, String> {
    Optional<WeatherPreferences> findByUserId(String userId);
}