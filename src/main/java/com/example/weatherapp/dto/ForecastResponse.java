// src/main/java/com/weatherapp/dto/ForecastResponse.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class ForecastResponse {
    private String city;
    private List<DailyForecastDto> daily;
    private List<HourlyForecastDto> hourly;
}