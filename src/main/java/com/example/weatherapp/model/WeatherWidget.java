package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "weather_widgets")
public class WeatherWidget {
    @Id
    private String id;
    private String userId;
    private String widgetType; // current_weather, forecast, alerts, air_quality, etc.
    private String locationId;
    private Map<String, Object> configuration;
    private int position; // for ordering on dashboard
    private boolean isVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String size; // small, medium, large
}