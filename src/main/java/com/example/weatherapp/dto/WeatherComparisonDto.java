package com.example.weatherapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class WeatherComparisonDto {
    private List<String> cities;
    private List<WeatherResponse> weatherData;
}