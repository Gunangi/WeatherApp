package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "weather_alerts")
public class WeatherAlert {
    @Id
    private String id;
    private String userId;
    private String locationId;
    private AlertType alertType;
    private AlertCondition condition;
    private double threshold;
    private String message;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastTriggered;
    private LocalDateTime nextCheck;
    private int triggerCount;
}