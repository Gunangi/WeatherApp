package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityRecommendation {
    private String title;
    private String description;
    private ActivityType activityType;
    private int priority; // 1-5, 5 being highest
    private String icon;
    private String category;
    private boolean isWeatherDependent;
    private String reasoning;
}