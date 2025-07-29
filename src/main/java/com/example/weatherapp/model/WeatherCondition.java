package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherCondition {
    private String parameter; // temperature, humidity, rain_probability, wind_speed, etc.
    private String operator;  // >, <, =, >=, <=
    private double value;
    private String unit;
}