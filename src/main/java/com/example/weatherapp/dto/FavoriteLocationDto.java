// src/main/java/com/example/weatherapp/dto/FavoriteLocationDto.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class FavoriteLocationDto {
    private String id;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private String timezone;
    private String nickname;
    private int orderIndex;
    private Instant createdAt;
    private Instant updatedAt;
    private WeatherResponse currentWeather; // Only populated when requested
}