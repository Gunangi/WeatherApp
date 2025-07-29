package com.example.weatherapp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherShareData {
    private String locationName;
    private double temperature;
    private String description;
    private String icon;
    private LocalDateTime timestamp;
    private String shareText;
    private String imageUrl;
    private String shareUrl;
}