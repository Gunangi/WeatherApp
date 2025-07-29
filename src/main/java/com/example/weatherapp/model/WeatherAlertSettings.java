package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherAlertSettings {
    private boolean enableRainAlert;
    private boolean enableTemperatureAlert;
    private boolean enableWindAlert;
    private boolean enableSevereWeatherAlert;

    private double minTemperatureThreshold;
    private double maxTemperatureThreshold;
    private double windSpeedThreshold;
    private double rainProbabilityThreshold;

    private List<String> alertTimes; // e.g., ["08:00", "18:00"]
    private boolean enablePushNotifications;
    private boolean enableEmailNotifications;
}