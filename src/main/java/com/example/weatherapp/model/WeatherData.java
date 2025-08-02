package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "weatherData")
public class WeatherData {
    @Id
    private String id;
    private String city;
    private Instant timestamp;
    private double temperature;
    private String description;
    private double feelsLike;
    private int humidity;
    private double windSpeed;
    private int pressure;
    private double visibility;
    private Instant sunrise;
    private Instant sunset;
}