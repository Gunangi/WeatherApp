package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "forecastData")
public class ForecastData {
    @Id
    private String id;
    private String city;
    private List<DailyForecast> daily;
    private List<HourlyForecast> hourly;
}

@Data
class DailyForecast {
    private LocalDate date;
    private double tempMin;
    private double tempMax;
    private String description;
    private String icon;
}

@Data
class HourlyForecast {
    private Instant dateTime;
    private double temperature;
    private String description;
    private String icon;
}