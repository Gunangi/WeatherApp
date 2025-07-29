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
public class WeatherComparison {
    private LocalDate comparisonDate;
    private List<LocationWeatherData> locations;
    private ComparisonAnalysis analysis;
    private String summary;
}

