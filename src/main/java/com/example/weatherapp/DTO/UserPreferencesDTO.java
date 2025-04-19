package com.example.weatherapp.DTO;

import com.example.weatherapp.model.UserPreferences.TemperatureUnit;
import com.example.weatherapp.model.UserPreferences.TimeFormat;
import com.example.weatherapp.model.UserPreferences.ThemePreference;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UserPreferencesDTO {

    @NotNull
    private TemperatureUnit temperatureUnit;

    @NotNull
    private TimeFormat timeFormat;

    @NotNull
    @Min(5)
    @Max(14)
    private Integer forecastDays;

    @NotNull
    private ThemePreference theme;

    @NotNull
    private Boolean receiveAlerts;

    // Getters and Setters
    public TemperatureUnit getTemperatureUnit() {
        return temperatureUnit;
    }

    public void setTemperatureUnit(TemperatureUnit temperatureUnit) {
        this.temperatureUnit = temperatureUnit;
    }

    public TimeFormat getTimeFormat() {
        return timeFormat;
    }

    public void setTimeFormat(TimeFormat timeFormat) {
        this.timeFormat = timeFormat;
    }

    public Integer getForecastDays() {
        return forecastDays;
    }

    public void setForecastDays(Integer forecastDays) {
        this.forecastDays = forecastDays;
    }

    public ThemePreference getTheme() {
        return theme;
    }

    public void setTheme(ThemePreference theme) {
        this.theme = theme;
    }

    public Boolean getReceiveAlerts() {
        return receiveAlerts;
    }

    public void setReceiveAlerts(Boolean receiveAlerts) {
        this.receiveAlerts = receiveAlerts;
    }
}