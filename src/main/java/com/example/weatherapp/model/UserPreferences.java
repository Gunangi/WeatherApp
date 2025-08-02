package com.example.weatherapp.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class UserPreferences {
    private String temperatureUnit; // Celsius or Fahrenheit
    private String theme; // light or dark
    private String colorScheme;
    private String windSpeedUnit; // "ms", "kmh", "mph"
    private String pressureUnit; // "hpa", "mmhg", "inhg"
    private String visibilityUnit; // "km", "miles"
    private String precipitationUnit; // "mm", "inches"
    private boolean notificationsEnabled;
    private boolean weatherAlertsEnabled;
    private boolean rainAlertsEnabled;
    private boolean temperatureAlertsEnabled;
    private boolean uvIndexAlertsEnabled;
    private boolean airQualityAlertsEnabled;
    private boolean showFeelsLike;
    private boolean showHumidity;
    private boolean showWindSpeed;
    private boolean showPressure;
    private boolean showVisibility;
    private boolean showUvIndex;
    private boolean showAirQuality;
    private boolean show24HourFormat;
    private List<String> enabledWidgets;
    private String defaultLocation;
    private List<String> favoriteLocations;
    private boolean autoLocationDetection;
    private String language; // "en", "hi", "es", etc.
    private String timezone;
    private double temperatureThreshold;
    private int refreshInterval; // in minutes
    private boolean autoRefresh;
    private boolean shareLocation;
    private boolean dataCollection;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean rainAlerts = true;

    // Constructors
    public UserPreferences() {
        this.theme = "auto";
        this.colorScheme = "blue";
        this.temperatureUnit = "celsius";
        this.windSpeedUnit = "ms";
        this.pressureUnit = "hpa";
        this.visibilityUnit = "km";
        this.precipitationUnit = "mm";
        this.notificationsEnabled = true;
        this.weatherAlertsEnabled = true;
        this.rainAlertsEnabled = false;
        this.temperatureAlertsEnabled = false;
        this.uvIndexAlertsEnabled = false;
        this.airQualityAlertsEnabled = false;
        this.showFeelsLike = true;
        this.showHumidity = true;
        this.showWindSpeed = true;
        this.showPressure = true;
        this.showVisibility = true;
        this.showUvIndex = true;
        this.showAirQuality = true;
        this.show24HourFormat = true;
        this.enabledWidgets = new ArrayList<>();
        this.favoriteLocations = new ArrayList<>();
        this.autoLocationDetection = true;
        this.refreshInterval = 30;
        this.autoRefresh = true;
        this.language = "en";
        this.shareLocation = true;
        this.dataCollection = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

}