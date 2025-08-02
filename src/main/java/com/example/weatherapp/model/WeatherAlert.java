package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "weatherAlerts")
public class WeatherAlert {
    @Id
    private String id;
    private String city;
    private String event;
    private String description;
    private Instant startTime;
    private Instant endTime;
}