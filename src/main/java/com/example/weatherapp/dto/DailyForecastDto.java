// src/main/java/com/weatherapp/dto/DailyForecastDto.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DailyForecastDto {
    private LocalDate date;
    private double tempMin;
    private double tempMax;
    private String description;
    private String icon;
    private String dayOfWeek;
}

