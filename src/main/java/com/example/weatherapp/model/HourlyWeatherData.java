package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HourlyWeatherData {
    private LocalDateTime dateTime;
    private double temperature;
    private double feelsLike;
    private int humidity;
    private double windSpeed;
    private double windDirection;
    private double pressure;
    private double visibility;
    private String description;
    private String icon;
    private double rainProbability;
    private double rainVolume;
    private double snowVolume;
    private int cloudCover;
    private double uvIndex;
}