// src/main/java/com/example/weatherapp/dto/WidgetDataDto.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
public class WidgetDataDto {
    private String widgetId;
    private String widgetType;
    private String title;
    private String city;
    private Map<String, Object> data;
    private Instant lastUpdated;
    private String status; // SUCCESS, ERROR, LOADING
    private String errorMessage;
}