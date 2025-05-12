package com.example.weatherapp.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "weather_alerts")
public class WeatherAlert {

    @Id
    private String id;

    private String userId;

    private String city;

    private double latitude;

    private double longitude;

    private String alertType; // e.g., "SEVERE_WEATHER", "STORM", "HEAVY_RAIN", etc.

    private String alertSource; // e.g., "OPENWEATHERMAP", "SYSTEM", "USER_REPORT"

    private String title;

    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String severity; // e.g., "WARNING", "WATCH", "ADVISORY"

    private boolean active;

    private LocalDateTime createdAt;

    // Added missing fields
    private String weatherCondition;
    private double thresholdValue;

    // Default constructor for MongoDB
    public WeatherAlert() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    // Constructor with main fields
    public WeatherAlert(String userId, String city, double latitude, double longitude,
                        String alertType, String alertSource, String title, String description,
                        LocalDateTime startTime, LocalDateTime endTime, String severity) {
        this.userId = userId;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.alertType = alertType;
        this.alertSource = alertSource;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.severity = severity;
        this.active = true;
        this.createdAt = LocalDateTime.now();
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getAlertSource() {
        return alertSource;
    }

    public void setAlertSource(String alertSource) {
        this.alertSource = alertSource;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Added missing getters and setters
    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    public double getThresholdValue() {
        return thresholdValue;
    }

    public void setThresholdValue(double thresholdValue) {
        this.thresholdValue = thresholdValue;
    }
}