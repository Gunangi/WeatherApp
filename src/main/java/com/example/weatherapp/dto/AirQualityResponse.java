// src/main/java/com/weatherapp/dto/AirQualityResponse.java
package com.example.weatherapp.dto;

import lombok.Data;

@Data
public class AirQualityResponse {
    private String city;
    private int aqi;
    private String healthImpact;
    private double co;
    private double no;
    private double no2;
    private double o3;
    private double so2;
    private double pm2_5;
    private double pm10;
    private double nh3;
}
