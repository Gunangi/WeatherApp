package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationWeatherData {
    private String locationId;
    private String locationName;
    private double latitude;
    private double longitude;
    private ExtendedWeatherData weather;
    private String timezone;
}
