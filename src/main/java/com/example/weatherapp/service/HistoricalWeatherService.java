package com.example.weatherapp.service;

import com.example.weatherapp.model.HistoricalWeather;
import com.example.weatherapp.repository.HistoricalWeatherRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricalWeatherService {

    private final HistoricalWeatherRepository historicalWeatherRepository;

    public List<HistoricalWeather> getHistoricalWeather(String city, LocalDate startDate, LocalDate endDate) {
        return historicalWeatherRepository.findByCityAndDateBetween(city, startDate, endDate);
    }
}