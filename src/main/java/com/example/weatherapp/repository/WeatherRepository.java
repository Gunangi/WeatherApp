package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeatherRepository extends MongoRepository<WeatherData, String> {
}


