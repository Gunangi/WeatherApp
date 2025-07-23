package com.example.weatherapp.model;

import com.example.weatherapp.model.Location;
import lombok.Data;


@Data // Lombok annotation to generate getters, setters, toString, etc.
public class WeatherPreferences {

    private String temperatureUnit = "celsius"; // Default to Celsius
    private String timeFormat = "24h"; // Default to 24-hour format
    private Location defaultLocation;
    private String theme = "light"; // Default to light theme
    private int forecastDays = 5; // Default to a 5-day forecast

}
