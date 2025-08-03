package com.example.weatherapp;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "user_preferences")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserPreferences {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String temperatureUnit = "celsius"; // celsius or fahrenheit
    private String theme = "light"; // light, dark, or auto
    private String defaultCity;
    private boolean notifications = true;
    private boolean locationAccess = false;

    // Weather display preferences
    private List<String> visibleMetrics; // humidity, windSpeed, pressure, visibility, etc.
    private String timeFormat = "24"; // 12 or 24 hour format
    private String dateFormat = "dd/MM/yyyy";

    // Notification preferences
    private boolean weatherAlerts = true;
    private boolean airQualityAlerts = true;
    private boolean temperatureAlerts = false;
    private Double temperatureThresholdHigh;
    private Double temperatureThresholdLow;

    // Favorite locations
    private List<String> favoriteLocations;

    // Custom settings
    private Map<String, Object> customSettings;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public UserPreferences() {}

    public UserPreferences(String userId) {
        this.userId = userId;
    }

    // Getters and Setters
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

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getDefaultCity() {
        return defaultCity;
    }

    public void setDefaultCity(String defaultCity) {
        this.defaultCity = defaultCity;
    }

    public boolean isNotifications() {
        return notifications;
    }

    public void setNotifications(boolean notifications) {
        this.notifications = notifications;
    }

    public boolean isLocationAccess() {
        return locationAccess;
    }

    public void setLocationAccess(boolean locationAccess) {
        this.locationAccess = locationAccess;
    }

    public List<String> getVisibleMetrics() {
        return visibleMetrics;
    }

    public void setVisibleMetrics(List<String> visibleMetrics) {
        this.visibleMetrics = visibleMetrics;
    }

    public String getTimeFormat() {
        return timeFormat;
    }

    public void setTimeFormat(String timeFormat) {
        this.timeFormat = timeFormat;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public boolean isWeatherAlerts() {
        return weatherAlerts;
    }

    public void setWeatherAlerts(boolean weatherAlerts) {
        this.weatherAlerts = weatherAlerts;
    }

    public boolean isAirQualityAlerts() {
        return airQualityAlerts;
    }

    public void setAirQualityAlerts(boolean airQualityAlerts) {
        this.airQualityAlerts = airQualityAlerts;
    }

    public boolean isTemperatureAlerts() {
        return temperatureAlerts;
    }

    public void setTemperatureAlerts(boolean temperatureAlerts) {
        this.temperatureAlerts = temperatureAlerts;
    }

    public Double getTemperatureThresholdHigh() {
        return temperatureThresholdHigh;
    }

    public void setTemperatureThresholdHigh(Double temperatureThresholdHigh) {
        this.temperatureThresholdHigh = temperatureThresholdHigh;
    }

    public Double getTemperatureThresholdLow() {
        return temperatureThresholdLow;
    }

    public void setTemperatureThresholdLow(Double temperatureThresholdLow) {
        this.temperatureThresholdLow = temperatureThresholdLow;
    }

    public List<String> getFavoriteLocations() {
        return favoriteLocations;
    }

    public void setFavoriteLocations(List<String> favoriteLocations) {
        this.favoriteLocations = favoriteLocations;
    }

    public Map<String, Object> getCustomSettings() {
        return customSettings;
    }

    public void setCustomSettings(Map<String, Object> customSettings) {
        this.customSettings = customSettings;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public boolean isCelsius() {
        return "celsius".equalsIgnoreCase(temperatureUnit);
    }

    public boolean isFahrenheit() {
        return "fahrenheit".equalsIgnoreCase(temperatureUnit);
    }

    public boolean isDarkTheme() {
        return "dark".equalsIgnoreCase(theme);
    }

    public boolean isLightTheme() {
        return "light".equalsIgnoreCase(theme);
    }

    public boolean isAutoTheme() {
        return "auto".equalsIgnoreCase(theme);
    }

    @Override
    public String toString() {
        return "UserPreferences{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", temperatureUnit='" + temperatureUnit + '\'' +
                ", theme='" + theme + '\'' +
                ", defaultCity='" + defaultCity + '\'' +
                ", notifications=" + notifications +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}