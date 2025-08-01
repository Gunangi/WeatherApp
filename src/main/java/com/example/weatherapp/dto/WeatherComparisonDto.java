package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Data Transfer Object for weather comparison between multiple cities.
 */
public class WeatherComparisonDto {

    private String id;

    @NotEmpty(message = "At least one location must be provided for comparison")
    @Size(min = 2, max = 10, message = "Comparison must include between 2 and 10 cities")
    @Valid
    private List<CityWeatherComparison> locations;

    private ComparisonType comparisonType;
    private LocalDateTime comparedAt;
    private ComparisonSummary summary;
    private List<String> recommendations;
    private String temperatureUnit;
    private String windSpeedUnit;

    public WeatherComparisonDto() {
        this.locations = new ArrayList<>();
        this.recommendations = new ArrayList<>();
        this.comparedAt = LocalDateTime.now();
        this.temperatureUnit = "CELSIUS";
        this.windSpeedUnit = "MS";
        this.comparisonType = ComparisonType.CURRENT;
    }

    // --- Nested DTOs and Enums ---

    public static class LocationDto {
        private String city;
        private String country;
        private double latitude;
        private double longitude;

        public String getDisplayName() {
            return city + ", " + country;
        }
        // Getters and Setters
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
    }

    public static class CityWeatherComparison {
        @NotNull @Valid private LocationDto location;
        private Double temperature;
        private String condition;
        private Integer humidity;
        private Double windSpeed;

        // Getters and Setters
        public LocationDto getLocation() { return location; }
        public void setLocation(LocationDto location) { this.location = location; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }
        public Integer getHumidity() { return humidity; }
        public void setHumidity(Integer humidity) { this.humidity = humidity; }
        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    }

    public static class ComparisonSummary {
        private String hottestCity;
        private String coldestCity;
        private String mostHumidCity;
        private String windiestCity;

        // Getters and Setters
        public String getHottestCity() { return hottestCity; }
        public void setHottestCity(String hottestCity) { this.hottestCity = hottestCity; }
        public String getColdestCity() { return coldestCity; }
        public void setColdestCity(String coldestCity) { this.coldestCity = coldestCity; }
        public String getMostHumidCity() { return mostHumidCity; }
        public void setMostHumidCity(String mostHumidCity) { this.mostHumidCity = mostHumidCity; }
        public String getWindiestCity() { return windiestCity; }
        public void setWindiestCity(String windiestCity) { this.windiestCity = windiestCity; }
    }

    public enum ComparisonType {
        CURRENT, FORECAST, HISTORICAL
    }

    // --- Main Getters and Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<CityWeatherComparison> getLocations() { return locations; }
    public void setLocations(List<CityWeatherComparison> locations) {
        this.locations = locations;
        generateSummary();
    }
    public ComparisonType getComparisonType() { return comparisonType; }
    public void setComparisonType(ComparisonType comparisonType) { this.comparisonType = comparisonType; }
    public LocalDateTime getComparedAt() { return comparedAt; }
    public void setComparedAt(LocalDateTime comparedAt) { this.comparedAt = comparedAt; }
    public ComparisonSummary getSummary() { return summary; }
    public void setSummary(ComparisonSummary summary) { this.summary = summary; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    public String getTemperatureUnit() { return temperatureUnit; }
    public void setTemperatureUnit(String temperatureUnit) { this.temperatureUnit = temperatureUnit; }
    public String getWindSpeedUnit() { return windSpeedUnit; }
    public void setWindSpeedUnit(String windSpeedUnit) { this.windSpeedUnit = windSpeedUnit; }

    // --- Business Logic ---

    private void generateSummary() {
        if (locations == null || locations.isEmpty()) {
            this.summary = null;
            return;
        }

        this.summary = new ComparisonSummary();

        findExtreme(CityWeatherComparison::getTemperature, true).ifPresent(c -> summary.setHottestCity(c.getLocation().getDisplayName()));
        findExtreme(CityWeatherComparison::getTemperature, false).ifPresent(c -> summary.setColdestCity(c.getLocation().getDisplayName()));
        findExtreme(c -> c.getHumidity() != null ? c.getHumidity().doubleValue() : null, true).ifPresent(c -> summary.setMostHumidCity(c.getLocation().getDisplayName()));
        findExtreme(CityWeatherComparison::getWindSpeed, true).ifPresent(c -> summary.setWindiestCity(c.getLocation().getDisplayName()));
    }

    private Optional<CityWeatherComparison> findExtreme(Function<CityWeatherComparison, Double> metricExtractor, boolean findMax) {
        Comparator<CityWeatherComparison> comparator = Comparator.comparing(metricExtractor, Comparator.nullsLast(Double::compareTo));
        if (!findMax) {
            comparator = comparator.reversed();
        }
        return locations.stream().filter(loc -> metricExtractor.apply(loc) != null).max(comparator);
    }
}