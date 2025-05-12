package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "weather_preferences")
public class WeatherPreferences {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String temperatureUnit = "celsius";  // celsius or fahrenheit

    private String windSpeedUnit = "m/s";  // m/s, km/h, mph

    private String timeFormat = "24h";  // 12h or 24h

    private String theme = "system";  // light, dark, or system

    private String defaultLocation = "";

    private boolean notificationsEnabled = false;

    private int forecastDays = 5;

    // Additional preferences
    private boolean showAirQuality = true;

    private boolean showUVIndex = true;

    private boolean showHourlyForecast = true;

    private boolean showAlerts = true;

    private boolean showRecommendations = true;

    // Default constructor for MongoDB
    public WeatherPreferences() {
    }

    // Constructor with user ID
    public WeatherPreferences(String userId) {
        this.userId = userId;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public boolean isShowAirQuality() {
        return showAirQuality;
    }

    public void setShowAirQuality(boolean showAirQuality) {
        this.showAirQuality = showAirQuality;
    }

    public boolean isShowUVIndex() {
        return showUVIndex;
    }

    public void setShowUVIndex(boolean showUVIndex) {
        this.showUVIndex = showUVIndex;
    }

    public boolean isShowHourlyForecast() {
        return showHourlyForecast;
    }

    public void setShowHourlyForecast(boolean showHourlyForecast) {
        this.showHourlyForecast = showHourlyForecast;
    }

    public boolean isShowAlerts() {
        return showAlerts;
    }

    public void setShowAlerts(boolean showAlerts) {
        this.showAlerts = showAlerts;
    }

    public boolean isShowRecommendations() {
        return showRecommendations;
    }

    public void setShowRecommendations(boolean showRecommendations) {
        this.showRecommendations = showRecommendations;
    }
}
