package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelDestination {
    private String cityName;
    private double latitude;
    private double longitude;
    private String country;
    private LocalDate arrivalDate;
    private LocalDate departureDate;
    private List<DailyWeatherData> weatherForecast;
    private List<String> packingRecommendations;
    private List<ActivityRecommendation> activitySuggestions;
}