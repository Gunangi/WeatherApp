package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Model class for storing user's searched locations history
 * Tracks location searches for quick access and favorites
 */
@Document(collection = "location_history")
public class LocationHistory {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String cityName;
    private String country;
    private String state; // Optional, for cities in countries with states
    private double latitude;
    private double longitude;
    private String timezone;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastSearched;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime firstSearched;

    private int searchCount; // How many times this location was searched
    private boolean isFavorite; // User marked as favorite
    private String displayName; // Formatted display name (e.g., "Delhi, India")

    // Default constructor
    public LocationHistory() {
        this.searchCount = 1;
        this.isFavorite = false;
        this.firstSearched = LocalDateTime.now();
        this.lastSearched = LocalDateTime.now();
    }

    // Constructor with essential fields
    public LocationHistory(String userId, String cityName, String country, double latitude, double longitude) {
        this();
        this.userId = userId;
        this.cityName = cityName;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.displayName = cityName + ", " + country;
    }

    // Full constructor
    public LocationHistory(String userId, String cityName, String country, String state,
                           double latitude, double longitude, String timezone) {
        this(userId, cityName, country, latitude, longitude);
        this.state = state;
        this.timezone = timezone;
        if (state != null && !state.isEmpty()) {
            this.displayName = cityName + ", " + state + ", " + country;
        }
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

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
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

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public LocalDateTime getLastSearched() {
        return lastSearched;
    }

    public void setLastSearched(LocalDateTime lastSearched) {
        this.lastSearched = lastSearched;
    }

    public LocalDateTime getFirstSearched() {
        return firstSearched;
    }

    public void setFirstSearched(LocalDateTime firstSearched) {
        this.firstSearched = firstSearched;
    }

    public int getSearchCount() {
        return searchCount;
    }

    public void setSearchCount(int searchCount) {
        this.searchCount = searchCount;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    // Utility methods
    public void incrementSearchCount() {
        this.searchCount++;
        this.lastSearched = LocalDateTime.now();
    }

    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LocationHistory that = (LocationHistory) o;
        return Double.compare(that.latitude, latitude) == 0 &&
                Double.compare(that.longitude, longitude) == 0 &&
                Objects.equals(userId, that.userId) &&
                Objects.equals(cityName, that.cityName) &&
                Objects.equals(country, that.country);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, cityName, country, latitude, longitude);
    }

    @Override
    public String toString() {
        return "LocationHistory{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", displayName='" + displayName + '\'' +
                ", searchCount=" + searchCount +
                ", isFavorite=" + isFavorite +
                ", lastSearched=" + lastSearched +
                '}';
    }
}