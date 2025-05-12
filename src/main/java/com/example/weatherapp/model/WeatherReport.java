package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "weather_reports")
public class WeatherReport {
    @Id
    private String id;

    @Field("location")
    private String location;

    @Field("location_coordinates")
    private GeoJsonPoint locationCoordinates;

    @Field("user_id")
    private String userId;

    @Field("username")
    private String username;

    @Field("temperature")
    private double temperature;

    @Field("humidity")
    private int humidity;

    @Field("description")
    private String description;

    @Field("created_at")
    private LocalDateTime createdAt;

    // Constructors
    public WeatherReport() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public GeoJsonPoint getLocationCoordinates() {
        return locationCoordinates;
    }

    public void setLocationCoordinates(GeoJsonPoint locationCoordinates) {
        this.locationCoordinates = locationCoordinates;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public int getHumidity() {
        return humidity;
    }

    public void setHumidity(int humidity) {
        this.humidity = humidity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}