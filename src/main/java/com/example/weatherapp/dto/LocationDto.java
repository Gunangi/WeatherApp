package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Data Transfer Object for location information
 * Used for transferring location data between client and server
 */
public class LocationDto {

    @JsonProperty("id")
    private String id;

    @NotBlank(message = "City name cannot be blank")
    @Size(min = 1, max = 100, message = "City name must be between 1 and 100 characters")
    @JsonProperty("city")
    private String city;

    @Size(max = 100, message = "State name cannot exceed 100 characters")
    @JsonProperty("state")
    private String state;

    @NotBlank(message = "Country cannot be blank")
    @Size(min = 2, max = 100, message = "Country must be between 2 and 100 characters")
    @JsonProperty("country")
    private String country;

    @Size(max = 10, message = "Country code cannot exceed 10 characters")
    @JsonProperty("countryCode")
    private String countryCode;

    @NotNull(message = "Latitude cannot be null")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @JsonProperty("latitude")
    private Double latitude;

    @NotNull(message = "Longitude cannot be null")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("timezone")
    private String timezone;

    @JsonProperty("population")
    private Long population;

    @JsonProperty("elevation")
    private Double elevation;

    @JsonProperty("isCapital")
    private Boolean isCapital;

    @JsonProperty("localTime")
    private LocalDateTime localTime;

    @JsonProperty("searchCount")
    private Integer searchCount;

    @JsonProperty("isFavorite")
    private Boolean isFavorite;

    @JsonProperty("lastSearched")
    private LocalDateTime lastSearched;

    @JsonProperty("displayName")
    private String displayName;

    // Default constructor
    public LocationDto() {
        this.searchCount = 0;
        this.isFavorite = false;
        this.isCapital = false;
    }

    // Constructor with essential fields
    public LocationDto(String city, String country, Double latitude, Double longitude) {
        this();
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Full constructor
    public LocationDto(String id, String city, String state, String country, String countryCode,
                       Double latitude, Double longitude, String timezone, Long population,
                       Double elevation, Boolean isCapital, LocalDateTime localTime,
                       Integer searchCount, Boolean isFavorite, LocalDateTime lastSearched) {
        this.id = id;
        this.city = city;
        this.state = state;
        this.country = country;
        this.countryCode = countryCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
        this.population = population;
        this.elevation = elevation;
        this.isCapital = isCapital != null ? isCapital : false;
        this.localTime = localTime;
        this.searchCount = searchCount != null ? searchCount : 0;
        this.isFavorite = isFavorite != null ? isFavorite : false;
        this.lastSearched = lastSearched;
        this.displayName = generateDisplayName();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
        this.displayName = generateDisplayName();
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
        this.displayName = generateDisplayName();
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
        this.displayName = generateDisplayName();
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Long getPopulation() {
        return population;
    }

    public void setPopulation(Long population) {
        this.population = population;
    }

    public Double getElevation() {
        return elevation;
    }

    public void setElevation(Double elevation) {
        this.elevation = elevation;
    }

    public Boolean getIsCapital() {
        return isCapital;
    }

    public void setIsCapital(Boolean isCapital) {
        this.isCapital = isCapital;
    }

    public LocalDateTime getLocalTime() {
        return localTime;
    }

    public void setLocalTime(LocalDateTime localTime) {
        this.localTime = localTime;
    }

    public Integer getSearchCount() {
        return searchCount;
    }

    public void setSearchCount(Integer searchCount) {
        this.searchCount = searchCount;
    }

    public Boolean getIsFavorite() {
        return isFavorite;
    }

    public void setIsFavorite(Boolean isFavorite) {
        this.isFavorite = isFavorite;
    }

    public LocalDateTime getLastSearched() {
        return lastSearched;
    }

    public void setLastSearched(LocalDateTime lastSearched) {
        this.lastSearched = lastSearched;
    }

    public String getDisplayName() {
        return displayName != null ? displayName : generateDisplayName();
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    // Utility methods
    private String generateDisplayName() {
        StringBuilder sb = new StringBuilder();
        if (city != null) {
            sb.append(city);
        }
        if (state != null && !state.isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(state);
        }
        if (country != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(country);
        }
        return sb.toString();
    }

    public double distanceTo(LocationDto other) {
        if (other == null || this.latitude == null || this.longitude == null ||
                other.latitude == null || other.longitude == null) {
            return -1;
        }

        // Haversine formula for distance calculation
        double R = 6371; // Earth's radius in kilometers
        double dLat = Math.toRadians(other.latitude - this.latitude);
        double dLon = Math.toRadians(other.longitude - this.longitude);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(this.latitude)) * Math.cos(Math.toRadians(other.latitude)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    public boolean isValidCoordinates() {
        return latitude != null && longitude != null &&
                latitude >= -90 && latitude <= 90 &&
                longitude >= -180 && longitude <= 180;
    }

    public void incrementSearchCount() {
        this.searchCount = (this.searchCount != null ? this.searchCount : 0) + 1;
        this.lastSearched = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LocationDto that = (LocationDto) o;
        return Objects.equals(city, that.city) &&
                Objects.equals(state, that.state) &&
                Objects.equals(country, that.country) &&
                Objects.equals(latitude, that.latitude) &&
                Objects.equals(longitude, that.longitude);
    }

    @Override
    public int hashCode() {
        return Objects.hash(city, state, country, latitude, longitude);
    }

    @Override
    public String toString() {
        return "LocationDto{" +
                "id='" + id + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", country='" + country + '\'' +
                ", countryCode='" + countryCode + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", timezone='" + timezone + '\'' +
                ", population=" + population +
                ", elevation=" + elevation +
                ", isCapital=" + isCapital +
                ", localTime=" + localTime +
                ", searchCount=" + searchCount +
                ", isFavorite=" + isFavorite +
                ", lastSearched=" + lastSearched +
                ", displayName='" + displayName + '\'' +
                '}';
    }
}