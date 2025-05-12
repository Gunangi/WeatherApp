package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Represents a weather report submitted by a user in the community.
 * These reports allow users to share their local weather observations
 * and provide additional context beyond automated weather data.
 */
@Document(collection = "weather_reports")
public class WeatherReport {

    @Id
    private String id;

    // The user who submitted the report
    private String userId;
    private String username;

    // Location information
    private String locationName;
    private double latitude;
    private double longitude;

    // Report details
    private String description;
    private Map<String, Object> conditions;
    private String weatherCondition; // e.g., "Sunny", "Rainy", "Cloudy"
    private Double temperature;
    private String temperatureUnit; // "C" or "F"
    private Integer humidity;
    private Double windSpeed;
    private String windSpeedUnit; // "m/s", "km/h", "mph"

    // Media
    private String photoUrl;

    // Timestamps
    private LocalDateTime reportTime;
    private LocalDateTime createdAt;

    // Engagement metrics
    private Integer upvotes;
    private Integer downvotes;
    private Boolean verified;

    // Default constructor
    public WeatherReport() {
        this.createdAt = LocalDateTime.now();
        this.upvotes = 0;
        this.downvotes = 0;
        this.verified = false;
    }

    // Constructor with required fields
    public WeatherReport(String userId, String username, String locationName,
                         double latitude, double longitude, String description,
                         String weatherCondition, LocalDateTime reportTime) {
        this();
        this.userId = userId;
        this.username = username;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.weatherCondition = weatherCondition;
        this.reportTime = reportTime;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<String, Object> getConditions() {
        return conditions;
    }

    public void setConditions(Map<String, Object> conditions) {
        this.conditions = conditions;
    }

    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public String getTemperatureUnit() {
        return temperatureUnit;
    }

    public void setTemperatureUnit(String temperatureUnit) {
        this.temperatureUnit = temperatureUnit;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public String getWindSpeedUnit() {
        return windSpeedUnit;
    }

    public void setWindSpeedUnit(String windSpeedUnit) {
        this.windSpeedUnit = windSpeedUnit;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getReportTime() {
        return reportTime;
    }

    public void setReportTime(LocalDateTime reportTime) {
        this.reportTime = reportTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(Integer upvotes) {
        this.upvotes = upvotes;
    }

    public Integer getDownvotes() {
        return downvotes;
    }

    public void setDownvotes(Integer downvotes) {
        this.downvotes = downvotes;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    // Utility methods
    public void incrementUpvotes() {
        this.upvotes++;
    }

    public void incrementDownvotes() {
        this.downvotes++;
    }

    @Override
    public String toString() {
        return "WeatherReport{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", username='" + username + '\'' +
                ", locationName='" + locationName + '\'' +
                ", weatherCondition='" + weatherCondition + '\'' +
                ", reportTime=" + reportTime +
                ", verified=" + verified +
                '}';
    }
}
