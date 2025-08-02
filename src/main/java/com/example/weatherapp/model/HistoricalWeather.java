package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDate;

@Data
@Document(collection = "historicalWeather")
public class HistoricalWeather {
    @Id
    private String id;
    private String city;
    private LocalDate date;
    private double temperature;
    private double avgTemp;
    private double maxTemp;
    private double minTemp;
    private double feelsLike;
    private double precipitation;
    private int humidity;
    private double windSpeed;
    private double windDirection;
    private double pressure;
    private double visibility;
    private int cloudCover;
    private double uvIndex;
    private String weatherMain;
    private String weatherDescription;
    private String weatherIcon;

    // Precipitation
    private double rainfall;
    private double snowfall;

    // Air quality (if available)
    private Integer aqi;
    private Double co;
    private Double no2;
    private Double o3;
    private Double so2;
    private Double pm25;
    private Double pm10;
}