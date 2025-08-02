package com.example.weatherapp.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class WeatherResponse {
    private double temperature;
    private double feelsLike;
    private int humidity;
    private double windSpeed;
    private double windDirection;
    private String windDirectionText;
    private double pressure;
    private double visibility;
    private int cloudCover;
    private double uvIndex;
    private String uvIndexText;
    private String weatherMain;
    private String weatherDescription;
    private String weatherIcon;
    private double dewPoint;
    private double rainfall;
    private double snowfall;
    private Instant sunrise;
    private Instant sunset;
    private String localTime;
}