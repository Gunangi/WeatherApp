package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "weather_alerts")
public class WeatherAlert {

    @Id
    private String id;
    private String username;
    private String city;
    private String alertType; // TEMPERATURE, WIND, RAIN, SNOW, AIR_QUALITY
    private String condition; // ABOVE, BELOW, EQUALS
    private double threshold;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastTriggeredAt;

    // Constructors
    public WeatherAlert() {
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }

    // Getters and setters
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastTriggeredAt() {
        return lastTriggeredAt;
    }

    public void setLastTriggeredAt(LocalDateTime lastTriggeredAt) {
        this.lastTriggeredAt = lastTriggeredAt;
    }

    // Helper method to create description
    public String getDescription() {
        String conditionText = "";
        switch (condition) {
            case "ABOVE":
                conditionText = "rises above";
                break;
            case "BELOW":
                conditionText = "falls below";
                break;
            case "EQUALS":
                conditionText = "equals";
                break;
        }

        String valueWithUnit = "";
        switch (alertType) {
            case "TEMPERATURE":
                valueWithUnit = threshold + "°C";
                break;
            case "WIND":
                valueWithUnit = threshold + " m/s";
                break;
            case "RAIN":
            case "SNOW":
                valueWithUnit = threshold + " mm";
                break;
            case "AIR_QUALITY":
                valueWithUnit = String.valueOf((int) threshold);
                break;
        }

        return "Alert when " + alertType.toLowerCase().replace('_', ' ') +
                " in " + city + " " + conditionText + " " + valueWithUnit;
    }
}