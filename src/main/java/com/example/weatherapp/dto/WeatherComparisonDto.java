package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Data Transfer Object for weather comparison between multiple cities
 * Used for displaying comparative weather information across different locations
 */
@Getter
public class WeatherComparisonDto {

    // Main class getters and setters
    @JsonProperty("id")
    private String id;

    @NotEmpty(message = "At least one location must be provided for comparison")
    @Size(min = 2, max = 10, message = "Comparison must include between 2 and 10 cities")
    @Valid
    @JsonProperty("locations")
    private List<CityWeatherComparison> locations;

    @JsonProperty("comparisonType")
    private ComparisonType comparisonType;

    @JsonProperty("comparedAt")
    private LocalDateTime comparedAt;

    @JsonProperty("summary")
    private ComparisonSummary summary;

    @JsonProperty("recommendations")
    private List<String> recommendations;

    @JsonProperty("temperatureUnit")
    private String temperatureUnit;

    @JsonProperty("windSpeedUnit")
    private String windSpeedUnit;

    @JsonProperty("pressureUnit")
    private String pressureUnit;

    // Default constructor
    public WeatherComparisonDto() {
        this.locations = new ArrayList<>();
        this.recommendations = new ArrayList<>();
        this.comparedAt = LocalDateTime.now();
        this.temperatureUnit = "CELSIUS";
        this.windSpeedUnit = "MS";
        this.pressureUnit = "HPA";
        this.comparisonType = ComparisonType.CURRENT;
    }

    // Constructor with locations
    public WeatherComparisonDto(List<CityWeatherComparison> locations) {
        this();
        this.locations = locations != null ? locations : new ArrayList<>();
        generateSummary();
    }

    // Full constructor
    public WeatherComparisonDto(String id, List<CityWeatherComparison> locations,
                                ComparisonType comparisonType, String temperatureUnit,
                                String windSpeedUnit, String pressureUnit) {
        this.id = id;
        this.locations = locations != null ? locations : new ArrayList<>();
        this.comparisonType = comparisonType != null ? comparisonType : ComparisonType.CURRENT;
        this.comparedAt = LocalDateTime.now();
        this.recommendations = new ArrayList<>();
        this.temperatureUnit = temperatureUnit != null ? temperatureUnit : "CELSIUS";
        this.windSpeedUnit = windSpeedUnit != null ? windSpeedUnit : "MS";
        this.pressureUnit = pressureUnit != null ? pressureUnit : "HPA";
        generateSummary();
    }

    // Inner class for individual city weather comparison
    public static class CityWeatherComparison {
        @NotNull(message = "Location cannot be null")
        @Valid
        @JsonProperty("location")
        private LocationDto location;

        @JsonProperty("temperature")
        private Double temperature;

        @JsonProperty("feelsLike")
        private Double feelsLike;

        @JsonProperty("condition")
        private String condition;

        @JsonProperty("conditionCode")
        private String conditionCode;

        @JsonProperty("humidity")
        private Integer humidity;

        @JsonProperty("windSpeed")
        private Double windSpeed;

        @JsonProperty("windDirection")
        private String windDirection;

        @JsonProperty("pressure")
        private Double pressure;

        @JsonProperty("visibility")
        private Double visibility;

        @JsonProperty("uvIndex")
        private Double uvIndex;

        @JsonProperty("cloudCover")
        private Integer cloudCover;

        @JsonProperty("precipitation")
        private Double precipitation;

        @JsonProperty("airQualityIndex")
        private Integer airQualityIndex;

        @JsonProperty("sunrise")
        private LocalDateTime sunrise;

        @JsonProperty("sunset")
        private LocalDateTime sunset;

        @JsonProperty("lastUpdated")
        private LocalDateTime lastUpdated;

        // Default constructor
        public CityWeatherComparison() {}

        // Constructor with essential fields
        public CityWeatherComparison(LocationDto location, Double temperature, String condition) {
            this.location = location;
            this.temperature = temperature;
            this.condition = condition;
            this.lastUpdated = LocalDateTime.now();
        }

        // Getters and Setters
        public LocationDto getLocation() { return location; }
        public void setLocation(LocationDto location) { this.location = location; }

        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }

        public Double getFeelsLike() { return feelsLike; }
        public void setFeelsLike(Double feelsLike) { this.feelsLike = feelsLike; }

        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }

        public String getConditionCode() { return conditionCode; }
        public void setConditionCode(String conditionCode) { this.conditionCode = conditionCode; }

        public Integer getHumidity() { return humidity; }
        public void setHumidity(Integer humidity) { this.humidity = humidity; }

        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

        public String getWindDirection() { return windDirection; }
        public void setWindDirection(String windDirection) { this.windDirection = windDirection; }

        public Double getPressure() { return pressure; }
        public void setPressure(Double pressure) { this.pressure = pressure; }

        public Double getVisibility() { return visibility; }
        public void setVisibility(Double visibility) { this.visibility = visibility; }

        public Double getUvIndex() { return uvIndex; }
        public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }

        public Integer getCloudCover() { return cloudCover; }
        public void setCloudCover(Integer cloudCover) { this.cloudCover = cloudCover; }

        public Double getPrecipitation() { return precipitation; }
        public void setPrecipitation(Double precipitation) { this.precipitation = precipitation; }

        public Integer getAirQualityIndex() { return airQualityIndex; }
        public void setAirQualityIndex(Integer airQualityIndex) { this.airQualityIndex = airQualityIndex; }

        public LocalDateTime getSunrise() { return sunrise; }
        public void setSunrise(LocalDateTime sunrise) { this.sunrise = sunrise; }

        public LocalDateTime getSunset() { return sunset; }
        public void setSunset(LocalDateTime sunset) { this.sunset = sunset; }

        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    }

    // Inner class for comparison summary
    public static class ComparisonSummary {
        @JsonProperty("hottestCity")
        private String hottestCity;

        @JsonProperty("coldestCity")
        private String coldestCity;

        @JsonProperty("mostHumidCity")
        private String mostHumidCity;

        @JsonProperty("windiestCity")
        private String windiestCity;

        @JsonProperty("bestAirQualityCity")
        private String bestAirQualityCity;

        @JsonProperty("worstAirQualityCity")
        private String worstAirQualityCity;

        @JsonProperty("averageTemperature")
        private Double averageTemperature;

        @JsonProperty("temperatureRange")
        private Double temperatureRange;

        @JsonProperty("commonCondition")
        private String commonCondition;

        @JsonProperty("rainyCount")
        private Integer rainyCount;

        @JsonProperty("sunnyCount")
        private Integer sunnyCount;

        @JsonProperty("cloudyCount")
        private Integer cloudyCount;

        // Getters and Setters
        public String getHottestCity() { return hottestCity; }
        public void setHottestCity(String hottestCity) { this.hottestCity = hottestCity; }

        public String getColdestCity() { return coldestCity; }
        public void setColdestCity(String coldestCity) { this.coldestCity = coldestCity; }

        public String getMostHumidCity() { return mostHumidCity; }
        public void setMostHumidCity(String mostHumidCity) { this.mostHumidCity = mostHumidCity; }

        public String getWindiestCity() { return windiestCity; }
        public void setWindiestCity(String windiestCity) { this.windiestCity = windiestCity; }

        public String getBestAirQualityCity() { return bestAirQualityCity; }
        public void setBestAirQualityCity(String bestAirQualityCity) { this.bestAirQualityCity = bestAirQualityCity; }

        public String getWorstAirQualityCity() { return worstAirQualityCity; }
        public void setWorstAirQualityCity(String worstAirQualityCity) { this.worstAirQualityCity = worstAirQualityCity; }

        public Double getAverageTemperature() { return averageTemperature; }
        public void setAverageTemperature(Double averageTemperature) { this.averageTemperature = averageTemperature; }

        public Double getTemperatureRange() { return temperatureRange; }
        public void setTemperatureRange(Double temperatureRange) { this.temperatureRange = temperatureRange; }

        public String getCommonCondition() { return commonCondition; }
        public void setCommonCondition(String commonCondition) { this.commonCondition = commonCondition; }

        public Integer getRainyCount() { return rainyCount; }
        public void setRainyCount(Integer rainyCount) { this.rainyCount = rainyCount; }

        public Integer getSunnyCount() { return sunnyCount; }
        public void setSunnyCount(Integer sunnyCount) { this.sunnyCount = sunnyCount; }

        public Integer getCloudyCount() { return cloudyCount; }
        public void setCloudyCount(Integer cloudyCount) { this.cloudyCount = cloudyCount; }
    }

    // Enum for comparison types
    public enum ComparisonType {
        CURRENT, FORECAST, HISTORICAL
    }

    public void setId(String id) { this.id = id; }

    public void setLocations(List<CityWeatherComparison> locations) {
        this.locations = locations;
        generateSummary();
    }

    public void setComparisonType(ComparisonType comparisonType) { this.comparisonType = comparisonType; }

    public void setComparedAt(LocalDateTime comparedAt) { this.comparedAt = comparedAt; }

    public void setSummary(ComparisonSummary summary) { this.summary = summary; }

    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public void setTemperatureUnit(String temperatureUnit) { this.temperatureUnit = temperatureUnit; }

    public void setWindSpeedUnit(String windSpeedUnit) { this.windSpeedUnit = windSpeedUnit; }

    public void setPressureUnit(String pressureUnit) { this.pressureUnit = pressureUnit; }

    // Utility methods
    public void addLocation(CityWeatherComparison cityWeather) {
        if (this.locations == null) {
            this.locations = new ArrayList<>();
        }
        this.locations.add(cityWeather);
        generateSummary();
    }

    public void removeLocation(String cityName) {
        if (this.locations != null) {
            this.locations = this.locations.stream()
                    .filter(loc -> !loc.getLocation().getCity().equalsIgnoreCase(cityName))
                    .collect(Collectors.toList());
            generateSummary();
        }
    }

    private void generateSummary() {
        if (locations == null || locations.isEmpty()) {
            return;
        }

        this.summary = new ComparisonSummary();

        // Find extremes
        CityWeatherComparison hottest = locations.stream()
                .filter(loc -> loc.getTemperature() != null)
                .max((a, b) -> Double.compare(a.getTemperature(), b.getTemperature()))
                .orElse(null);

        CityWeatherComparison coldest = locations.stream()
                .filter(loc -> loc.getTemperature() != null)
                .min((a, b) -> Double.compare(a.getTemperature(), b.getTemperature()))
                .orElse(null);

        CityWeatherComparison mostHumid = locations.stream()
                .filter(loc -> loc.getHumidity() != null)
                .max((a, b) -> Integer.compare(a.getHumidity(), b.getHumidity()))
                .orElse(null);

        CityWeatherComparison windiest = locations.stream()
                .filter(loc -> loc.getWindSpeed() != null)
                .max((a, b) -> Double.compare(a.getWindSpeed(), b.getWindSpeed()))
                .orElse(null);

        if (hottest != null) summary.setHottestCity(hottest.getLocation().getDisplayName());
        if (coldest != null) summary.setColdestCity(coldest.getLocation().getDisplayName());
        if (mostHumid != null) summary.setMostHumidCity(mostHumid.getLocation().getDisplayName());
        if (windiest != null) summary.setWindiestCity(windiest.getLocation().getDisplayName());

        // Calculate averages
        double avgTemp = locations.stream()
                .filter(loc -> loc.getTemperature() != null)
                .mapToDouble(CityWeatherComparison::getTemperature)
                .average()
                .orElse(0.0);
        summary.setAverageTemperature(avgTemp);

        if (hottest != null && coldest != null) {
            summary.setTemperatureRange(hottest.getTemperature() - coldest.getTemperature());
        }

        // Generate recommendations
        generateRecommendations();
    }

    private void generateRecommendations() {
        this.recommendations = new ArrayList<>();

        if (summary == null || locations == null || locations.isEmpty()) {
            return;
        }

        // Temperature-based recommendations
        if (summary.getTemperatureRange() != null && summary.getTemperatureRange() > 15) {
            recommendations.add("Significant temperature variation between cities - pack layers for travel");
        }

        // Weather condition recommendations
        long rainyCount = locations.stream()
                .filter(loc -> loc.getCondition() != null &&
                        loc.getCondition().toLowerCase().contains("rain"))
                .count();

        if (rainyCount > 0) {
            recommendations.add("Rain expected in " + rainyCount + " location(s) - carry umbrella");
        }

        // Air quality recommendations
        long poorAirQuality = locations.stream()
                .filter(loc -> loc.getAirQualityIndex() != null && loc.getAirQualityIndex() > 100)
                .count();

        if (poorAirQuality > 0) {
            recommendations.add("Poor air quality in " + poorAirQuality + " location(s) - consider masks");
        }

        // Best city recommendation
        if (summary.getHottestCity() != null && summary.getColdestCity() != null) {
            recommendations.add("Best weather conditions appear to be in " +
                    findBestWeatherCity());
        }
    }

    private String findBestWeatherCity() {
        // Simple algorithm to find "best" weather based on temperature, humidity, and air quality
        CityWeatherComparison best = locations.stream()
                .filter(loc -> loc.getTemperature() != null)
                .min((a, b) -> {
                    double scoreA = calculateWeatherScore(a);
                    double scoreB = calculateWeatherScore(b);
                    return Double.compare(scoreA, scoreB);
                })
                .orElse(null);

        return best != null ? best.getLocation().getDisplayName() : "Unknown";
    }

    private double calculateWeatherScore(CityWeatherComparison city) {
        double score = 0;

        // Temperature score (ideal around 22°C)
        if (city.getTemperature() != null) {
            score += Math.abs(city.getTemperature() - 22) * 0.3;
        }

        // Humidity score (ideal around 50%)
        if (city.getHumidity() != null) {
            score += Math.abs(city.getHumidity() - 50) * 0.2;
        }

        // Air quality score
        if (city.getAirQualityIndex() != null) {
            score += city.getAirQualityIndex() * 0.1;
        }

        // Precipitation penalty
        if (city.getPrecipitation() != null && city.getPrecipitation() > 0) {
            score += city.getPrecipitation() * 10;
        }

        return score;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WeatherComparisonDto that = (WeatherComparisonDto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(locations, that.locations) &&
                comparisonType == that.comparisonType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, locations, comparisonType);
    }

    @Override
    public String toString() {
        return "WeatherComparisonDto{" +
                "id='" + id + '\'' +
                ", locationsCount=" + (locations != null ? locations.size() : 0) +
                ", comparisonType=" + comparisonType +
                ", comparedAt=" + comparedAt +
                ", temperatureUnit='" + temperatureUnit + '\'' +
                ", windSpeedUnit='" + windSpeedUnit + '\'' +
                ", pressureUnit='" + pressureUnit + '\'' +
                '}';
    }
}
