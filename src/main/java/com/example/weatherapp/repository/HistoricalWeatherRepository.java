package com.example.weatherapp.repository;

import com.example.weatherapp.model.HistoricalWeather;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface HistoricalWeatherRepository extends MongoRepository<HistoricalWeather, String> {
    List<HistoricalWeather> findByCityAndDateBetween(String city, LocalDate startDate, LocalDate endDate);
}
