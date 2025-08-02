// src/main/java/com/weatherapp/dto/HourlyForecastDto.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class HourlyForecastDto {
    private Instant dateTime;
    private double temperature;
    private String description;
    private String icon;
}
