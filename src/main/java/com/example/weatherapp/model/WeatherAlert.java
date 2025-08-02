// src/main/java/com/example/weatherapp/model/WeatherAlert.java
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
    private String severity; // LOW, MODERATE, HIGH, EXTREME
    private Instant startTime;
    private Instant endTime;
    private boolean active;
    private String alertType; // TEMPERATURE, WIND, PRECIPITATION, UV, AIR_QUALITY, VISIBILITY
    private String source; // SYSTEM, API, MANUAL
    private Instant createdAt;
    private Instant updatedAt;
}