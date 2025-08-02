// src/main/java/com/example/weatherapp/dto/WidgetConfigDto.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
public class WidgetConfigDto {
    private String id;
    private String userId;
    private String widgetType; // CURRENT_WEATHER, TEMPERATURE, AIR_QUALITY, FORECAST, UV_INDEX, WIND, HUMIDITY, SUNRISE_SUNSET
    private String title;
    private String city;
    private String size; // SMALL, MEDIUM, LARGE
    private Map<String, Object> position; // x, y coordinates for layout
    private Map<String, Object> settings; // Widget-specific settings
    private int refreshInterval; // in minutes
    private int orderIndex;
    private boolean enabled;
    private Instant createdAt;
    private Instant updatedAt;
}

