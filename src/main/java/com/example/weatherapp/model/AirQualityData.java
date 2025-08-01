package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Document(collection = "air_quality_data")
@CompoundIndexes({
        @CompoundIndex(name = "location_timestamp_idx", def = "{'latitude': 1, 'longitude': 1, 'timestamp': -1}"),
        @CompoundIndex(name = "city_timestamp_idx", def = "{'cityName': 1, 'timestamp': -1}"),
        @CompoundIndex(name = "aqi_timestamp_idx", def = "{'overallAqi': 1, 'timestamp': -1}")
})
public class AirQualityData {

    @Id
    private String id;

    // Location information
    @NotNull(message = "City name is required")
    @Indexed
    private String cityName;

    @NotNull(message = "Country is required")
    private String country;

    private String state;
    private String region;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private String timezone;
    private Long timezoneOffset;

    // Overall Air Quality Index
    @NotNull(message = "Overall AQI is required")
    @Min(value = 0, message = "AQI cannot be negative")
    @Max(value = 500, message = "AQI cannot exceed 500")
    @Indexed
    private Integer overallAqi;

    @NotNull(message = "AQI category is required")
    private AirQualityCategory aqiCategory;

    private String aqiStandard; // "US-EPA", "EU", "India", "China", etc.

    // Primary pollutants (in µg/m³ unless specified)
    private PollutantData pm2_5 = new PollutantData(); // Fine particulate matter
    private PollutantData pm10 = new PollutantData();  // Coarse particulate matter
    private PollutantData ozone = new PollutantData(); // Ground-level ozone (O3)
    private PollutantData no2 = new PollutantData();   // Nitrogen dioxide
    private PollutantData so2 = new PollutantData();   // Sulfur dioxide
    private PollutantData co = new PollutantData();    // Carbon monoxide (mg/m³)

    // Additional pollutants
    private PollutantData nh3 = new PollutantData();   // Ammonia
    private PollutantData no = new PollutantData();    // Nitric oxide
    private PollutantData pb = new PollutantData();    // Lead

    // Dominant pollutant (the one contributing most to AQI)
    private String dominantPollutant;

    // Health recommendations
    private HealthRecommendations healthRecommendations = new HealthRecommendations();

    // Weather correlation data
    private Double temperature; // Temperature at time of measurement
    private Double humidity;    // Humidity at time of measurement
    private Double windSpeed;   // Wind speed affecting pollutant dispersal
    private Double windDirection; // Wind direction
    private Double pressure;    // Atmospheric pressure

    // Data quality and source
    private String dataSource; // "EPA", "PurpleAir", "WAQI", etc.
    private String stationId;  // Monitoring station identifier
    private String stationName; // Monitoring station name
    private Double stationDistance; // Distance to monitoring station in km
    private DataQuality dataQuality;
    private String measurementMethod;

    // Timestamps
    @NotNull(message = "Measurement timestamp is required")
    @Indexed
    private LocalDateTime timestamp;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime expiresAt;

    // Additional data
    private Map<String, Object> additionalData = new HashMap<>();

    // Nested classes
    public static class PollutantData {
        private Double concentration; // Concentration in µg/m³ (or mg/m³ for CO)
        private Integer aqi;          // Individual AQI for this pollutant
        private AirQualityCategory category;
        private Double percentageOfLimit; // Percentage of WHO/EPA limit
        private String unit = "µg/m³";   // Measurement unit
        private Double hourlyAverage;    // 1-hour average
        private Double dailyAverage;     // 24-hour average
        private Double weeklyAverage;    // 7-day average
        private Double monthlyAverage;   // 30-day average

        // Getters and Setters
        public Double getConcentration() { return concentration; }
        public void setConcentration(Double concentration) { this.concentration = concentration; }

        public Integer getAqi() { return aqi; }
        public void setAqi(Integer aqi) { this.aqi = aqi; }

        public AirQualityCategory getCategory() { return category; }
        public void setCategory(AirQualityCategory category) { this.category = category; }

        public Double getPercentageOfLimit() { return percentageOfLimit; }
        public void setPercentageOfLimit(Double percentageOfLimit) { this.percentageOfLimit = percentageOfLimit; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public Double getHourlyAverage() { return hourlyAverage; }
        public void setHourlyAverage(Double hourlyAverage) { this.hourlyAverage = hourlyAverage; }

        public Double getDailyAverage() { return dailyAverage; }
        public void setDailyAverage(Double dailyAverage) { this.dailyAverage = dailyAverage; }

        public Double getWeeklyAverage() { return weeklyAverage; }
        public void setWeeklyAverage(Double weeklyAverage) { this.weeklyAverage = weeklyAverage; }

        public Double getMonthlyAverage() { return monthlyAverage; }
        public void setMonthlyAverage(Double monthlyAverage) { this.monthlyAverage = monthlyAverage; }
    }

    public static class HealthRecommendations {
        private String generalPopulation;
        private String sensitiveGroups;
        private String outdoorActivities;
        private String indoorRecommendations;
        private String maskRecommendation;
        private String windowRecommendation;
        private boolean exerciseRestriction;
        private String childrenRecommendation;
        private String elderlyRecommendation;
        private String respiratoryPatientsRecommendation;
        private String heartPatientsRecommendation;

        // Getters and Setters
        public String getGeneralPopulation() { return generalPopulation; }
        public void setGeneralPopulation(String generalPopulation) { this.generalPopulation = generalPopulation; }

        public String getSensitiveGroups() { return sensitiveGroups; }
        public void setSensitiveGroups(String sensitiveGroups) { this.sensitiveGroups = sensitiveGroups; }

        public String getOutdoorActivities() { return outdoorActivities; }
        public void setOutdoorActivities(String outdoorActivities) { this.outdoorActivities = outdoorActivities; }

        public String getIndoorRecommendations() { return indoorRecommendations; }
        public void setIndoorRecommendations(String indoorRecommendations) { this.indoorRecommendations = indoorRecommendations; }

        public String getMaskRecommendation() { return maskRecommendation; }
        public void setMaskRecommendation(String maskRecommendation) { this.maskRecommendation = maskRecommendation; }

        public String getWindowRecommendation() { return windowRecommendation; }
        public void setWindowRecommendation(String windowRecommendation) { this.windowRecommendation = windowRecommendation; }

        public boolean isExerciseRestriction() { return exerciseRestriction; }
        public void setExerciseRestriction(boolean exerciseRestriction) { this.exerciseRestriction = exerciseRestriction; }

        public String getChildrenRecommendation() { return childrenRecommendation; }
        public void setChildrenRecommendation(String childrenRecommendation) { this.childrenRecommendation = childrenRecommendation; }

        public String getElderlyRecommendation() { return elderlyRecommendation; }
        public void setElderlyRecommendation(String elderlyRecommendation) { this.elderlyRecommendation = elderlyRecommendation; }

        public String getRespiratoryPatientsRecommendation() { return respiratoryPatientsRecommendation; }
        public void setRespiratoryPatientsRecommendation(String respiratoryPatientsRecommendation) {
            this.respiratoryPatientsRecommendation = respiratoryPatientsRecommendation;
        }

        public String getHeartPatientsRecommendation() { return heartPatientsRecommendation; }
        public void setHeartPatientsRecommendation(String heartPatientsRecommendation) {
            this.heartPatientsRecommendation = heartPatientsRecommendation;
        }
    }

    // Enums
    public enum AirQualityCategory {
        GOOD(0, 50, "Good", "#00E400"),
        MODERATE(51, 100, "Moderate", "#FFFF00"),
        UNHEALTHY_FOR_SENSITIVE(101, 150, "Unhealthy for Sensitive Groups", "#FF7E00"),
        UNHEALTHY(151, 200, "Unhealthy", "#FF0000"),
        VERY_UNHEALTHY(201, 300, "Very Unhealthy", "#8F3F97"),
        HAZARDOUS(301, 500, "Hazardous", "#7E0023");

        private final int minAqi;
        private final int maxAqi;
        private final String description;
        private final String colorCode;

        AirQualityCategory(int minAqi, int maxAqi, String description, String colorCode) {
            this.minAqi = minAqi;
            this.maxAqi = maxAqi;
            this.description = description;
            this.colorCode = colorCode;
        }

        public int getMinAqi() { return minAqi; }
        public int getMaxAqi() { return maxAqi; }
        public String getDescription() { return description; }
        public String getColorCode() { return colorCode; }

        public static AirQualityCategory fromAqi(int aqi) {
            for (AirQualityCategory category : values()) {
                if (aqi >= category.minAqi && aqi <= category.maxAqi) {
                    return category;
                }
            }
            return HAZARDOUS; // Default for values > 500
        }
    }

    public enum DataQuality {
        EXCELLENT(0.9, 1.0, "Excellent"),
        GOOD(0.75, 0.89, "Good"),
        FAIR(0.5, 0.74, "Fair"),
        POOR(0.25, 0.49, "Poor"),
        VERY_POOR(0.0, 0.24, "Very Poor");

        private final double minScore;
        private final double maxScore;
        private final String description;

        DataQuality(double minScore, double maxScore, String description) {
            this.minScore = minScore;
            this.maxScore = maxScore;
            this.description = description;
        }

        public double getMinScore() { return minScore; }
        public double getMaxScore() { return maxScore; }
        public String getDescription() { return description; }

        public static DataQuality fromScore(double score) {
            for (DataQuality quality : values()) {
                if (score >= quality.minScore && score <= quality.maxScore) {
                    return quality;
                }
            }
            return VERY_POOR;
        }
    }

    // Constructors
    public AirQualityData() {}

    public AirQualityData(String cityName, String country, Double latitude, Double longitude) {
        this.cityName = cityName;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = LocalDateTime.now();
    }

    // Utility methods
    public boolean isDataExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public String getFullLocationName() {
        StringBuilder location = new StringBuilder(cityName);
        if (state != null && !state.isEmpty()) {
            location.append(", ").append(state);
        } else if (region != null && !region.isEmpty()) {
            location.append(", ").append(region);
        }
        location.append(", ").append(country);
        return location.toString();
    }

    public boolean isHealthAlert() {
        return aqiCategory != null && (
                aqiCategory == AirQualityCategory.UNHEALTHY ||
                        aqiCategory == AirQualityCategory.VERY_UNHEALTHY ||
                        aqiCategory == AirQualityCategory.HAZARDOUS
        );
    }

    public boolean isSensitiveGroupAlert() {
        return aqiCategory != null && (
                aqiCategory == AirQualityCategory.UNHEALTHY_FOR_SENSITIVE ||
                        isHealthAlert()
        );
    }

    public String getAqiColorCode() {
        return aqiCategory != null ? aqiCategory.getColorCode() : "#CCCCCC";
    }

    public String getAqiDescription() {
        return aqiCategory != null ? aqiCategory.getDescription() : "Unknown";
    }

    public PollutantData getDominantPollutantData() {
        if (dominantPollutant == null) return null;

        switch (dominantPollutant.toLowerCase()) {
            case "pm2.5": return pm2_5;
            case "pm10": return pm10;
            case "o3": case "ozone": return ozone;
            case "no2": return no2;
            case "so2": return so2;
            case "co": return co;
            case "nh3": return nh3;
            case "no": return no;
            case "pb": return pb;
            default: return null;
        }
    }

    // Main getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Long getTimezoneOffset() { return timezoneOffset; }
    public void setTimezoneOffset(Long timezoneOffset) { this.timezoneOffset = timezoneOffset; }

    public Integer getOverallAqi() { return overallAqi; }
    public void setOverallAqi(Integer overallAqi) {
        this.overallAqi = overallAqi;
        if (overallAqi != null) {
            this.aqiCategory = AirQualityCategory.fromAqi(overallAqi);
        }
    }

    public AirQualityCategory getAqiCategory() { return aqiCategory; }
    public void setAqiCategory(AirQualityCategory aqiCategory) { this.aqiCategory = aqiCategory; }

    public String getAqiStandard() { return aqiStandard; }
    public void setAqiStandard(String aqiStandard) { this.aqiStandard = aqiStandard; }

    public PollutantData getPm2_5() { return pm2_5; }
    public void setPm2_5(PollutantData pm2_5) { this.pm2_5 = pm2_5; }

    public PollutantData getPm10() { return pm10; }
    public void setPm10(PollutantData pm10) { this.pm10 = pm10; }

    public PollutantData getOzone() { return ozone; }
    public void setOzone(PollutantData ozone) { this.ozone = ozone; }

    public PollutantData getNo2() { return no2; }
    public void setNo2(PollutantData no2) { this.no2 = no2; }

    public PollutantData getSo2() { return so2; }
    public void setSo2(PollutantData so2) { this.so2 = so2; }

    public PollutantData getCo() { return co; }
    public void setCo(PollutantData co) { this.co = co; }

    public PollutantData getNh3() { return nh3; }
    public void setNh3(PollutantData nh3) { this.nh3 = nh3; }

    public PollutantData getNo() { return no; }
    public void setNo(PollutantData no) { this.no = no; }

    public PollutantData getPb() { return pb; }
    public void setPb(PollutantData pb) { this.pb = pb; }

    public String getDominantPollutant() { return dominantPollutant; }
    public void setDominantPollutant(String dominantPollutant) { this.dominantPollutant = dominantPollutant; }

    public HealthRecommendations getHealthRecommendations() { return healthRecommendations; }
    public void setHealthRecommendations(HealthRecommendations healthRecommendations) {
        this.healthRecommendations = healthRecommendations;
    }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

    public Double getWindDirection() { return windDirection; }
    public void setWindDirection(Double windDirection) { this.windDirection = windDirection; }

    public Double getPressure() { return pressure; }
    public void setPressure(Double pressure) { this.pressure = pressure; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public Double getStationDistance() { return stationDistance; }
    public void setStationDistance(Double stationDistance) { this.stationDistance = stationDistance; }

    public DataQuality getDataQuality() { return dataQuality; }
    public void setDataQuality(DataQuality dataQuality) { this.dataQuality = dataQuality; }

    public String getMeasurementMethod() { return measurementMethod; }
    public void setMeasurementMethod(String measurementMethod) { this.measurementMethod = measurementMethod; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Map<String, Object> getAdditionalData() { return additionalData; }
    public void setAdditionalData(Map<String, Object> additionalData) { this.additionalData = additionalData; }

    @Override
    public String toString() {
        return "AirQualityData{" +
                "id='" + id + '\'' +
                ", cityName='" + cityName + '\'' +
                ", country='" + country + '\'' +
                ", overallAqi=" + overallAqi +
                ", aqiCategory=" + aqiCategory +
                ", dominantPollutant='" + dominantPollutant + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AirQualityData)) return false;
        AirQualityData that = (AirQualityData) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}