package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_preferences")
public class UserPreferences {

    @Id
    private String id;
    private String username;
    private String temperatureUnit; // "celsius" or "fahrenheit"
    private String windSpeedUnit; // "m/s" or "mph" or "km/h"
    private String timeFormat; // "12h" or "24h"
    private String theme; // "light" or "dark" or "system"
    private String defaultLocation;
    private boolean notificationsEnabled;
    private int forecastDays; // 5, 7, or 10

    // Constructors
    public UserPreferences() {
    }

    public UserPreferences(String username) {
        this.username = username;
        this.temperatureUnit = "celsius";
        this.windSpeedUnit = "m/s";
        this.timeFormat = "24h";
        this.theme = "system";
        this.notificationsEnabled = false;
        this.forecastDays = 5;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getTemperatureUnit() {
        return temperatureUnit;
    }

    public void setTemperatureUnit(String temperatureUnit) {
        this.temperatureUnit = temperatureUnit;
    }

    public String getWindSpeedUnit() {
        return windSpeedUnit;
    }

    public void setWindSpeedUnit(String windSpeedUnit) {
        this.windSpeedUnit = windSpeedUnit;
    }

    public String getTimeFormat() {
        return timeFormat;
    }

    public void setTimeFormat(String timeFormat) {
        this.timeFormat = timeFormat;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getDefaultLocation() {
        return defaultLocation;
    }

    public void setDefaultLocation(String defaultLocation) {
        this.defaultLocation = defaultLocation;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public int getForecastDays() {
        return forecastDays;
    }

    public void setForecastDays(int forecastDays) {
        this.forecastDays = forecastDays;
    }
}