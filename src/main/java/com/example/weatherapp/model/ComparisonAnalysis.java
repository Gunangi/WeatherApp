package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonAnalysis {
    private LocationWeatherData warmestLocation;
    private LocationWeatherData coldestLocation;
    private LocationWeatherData mostHumidLocation;
    private LocationWeatherData driestLocation;
    private LocationWeatherData windiestLocation;
    private LocationWeatherData bestAirQualityLocation;
    private double temperatureRange;
    private double humidityRange;
    private String recommendation;
}