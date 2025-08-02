// src/main/java/com/weatherapp/service/WeatherComparisonService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherComparisonDto;
import com.example.weatherapp.dto.WeatherResponse;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherComparisonService {

    private final WeatherService weatherService;

    public WeatherComparisonDto compareWeather(List<String> cities) {
        // FIX: Changed the method reference to a lambda expression
        // to pass null for the userId argument.
        List<WeatherResponse> weatherData = cities.stream()
                .map(city -> weatherService.getWeatherForCity(city, null))
                .collect(Collectors.toList());

        WeatherComparisonDto comparisonDto = new WeatherComparisonDto();
        comparisonDto.setCities(cities);
        comparisonDto.setWeatherData(weatherData);
        return comparisonDto;
    }
}
