package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtendedWeatherData {
    // Basic weather info
    private String locationName;
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;
    private String timezone;

    // Current conditions
    private double temperature;
    private double feelsLike;
    private int humidity;
    private double pressure;
    private double windSpeed;
    private double windDirection;
    private double visibility;
    private String description;
    private String icon;

    // Extended data
    private double uvIndex;
    private String uvDescription;
    private double dewPoint;
    private int cloudCover;
    private double rainProbability;
    private double rainVolume;
    private double snowVolume;

    // Air quality
    private int aqi;
    private String aqiDescription;
    private AirQualityComponents airQuality;

    // Sunrise/sunset
    private LocalDateTime sunrise;
    private LocalDateTime sunset;
    private LocalDateTime moonrise;
    private LocalDateTime moonset;
    private String moonPhase;

    // Forecasts
    private List<HourlyWeatherData> hourlyForecast;
    private List<DailyWeatherData> dailyForecast;

    // Recommendations
    private List<ActivityRecommendation> activityRecommendations;
    private ClothingRecommendation clothingRecommendation;
}