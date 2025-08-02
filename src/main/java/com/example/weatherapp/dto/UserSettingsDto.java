package com.example.weatherapp.dto;

import lombok.Data;

@Data
public class UserSettingsDto {
    private String temperatureUnit;
    private String theme;
    private boolean rainAlerts;
    private double temperatureThreshold;
}