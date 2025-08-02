package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WeatherAlertRepository extends MongoRepository<WeatherAlert, String> {
    List<WeatherAlert> findByCityIgnoreCase(String city);
}