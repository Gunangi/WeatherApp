package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * Model class for weather alerts and notifications
 * Handles severe weather warnings and user-defined alerts
 */
@Document(collection = "weather_alerts")
public class WeatherAlert {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String locationId; // Reference to location
    private String cityName;
    private String country;

    // Alert Information
    private String alertTitle;
    private String alertDescription;
    private AlertType alertType;
    private AlertSeverity severity;
    private AlertSource source; // Government, API, User-defined

    // Timing
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime issuedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime effectiveFrom;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;

    // Status
    private AlertStatus status;
    private boolean isRead;
    private boolean isNotificationSent;

    // Weather conditions that triggered the alert
    private WeatherCondition triggerCondition;

    // Additional metadata
    private List<String> affectedAreas;
    private String instructions; // Safety instructions
    private String headline; // Short headline for notifications

    // User-defined alert settings (for custom alerts)
    private CustomAlertSettings customSettings;

    // Enums
    public enum AlertType {
        SEVERE_WEATHER,
        TEMPERATURE_THRESHOLD,
        RAIN_ALERT,
        SNOW_ALERT,
        WIND_ALERT,
        UV_ALERT,
        AIR_QUALITY_ALERT,
        STORM_WARNING,
        FLOOD_WARNING,
        HEAT_WAVE,
        COLD_WAVE,
        CUSTOM
    }

    public enum AlertSeverity {
        LOW("Low", "#4CAF50"),
        MODERATE("Moderate", "#FF9800"),
        HIGH("High", "#FF5722"),
        SEVERE("Severe", "#F44336"),
        EXTREME("Extreme", "#9C27B0");

        private final String label;
        private final String color;

        AlertSeverity(String label, String color) {
            this.label = label;
            this.color = color;
        }

        public String getLabel() { return label; }
        public String getColor() { return color; }
    }

    public enum AlertSource {
        GOVERNMENT_WEATHER_SERVICE,
        WEATHER_API,
        USER_DEFINED,
        SYSTEM_GENERATED
    }

    public enum AlertStatus {
        ACTIVE,
        EXPIRED,
        CANCELLED,
        UPDATED
    }

    // Nested class for weather conditions
    public static class WeatherCondition {
        private Double temperature;
        private Double humidity;
        private Double windSpeed;
        private Double rainfall;
        private Integer aqi;
        private String weatherDescription;

        // Constructors
        public WeatherCondition() {}

        public WeatherCondition(Double temperature, String weatherDescription) {
            this.temperature = temperature;
            this.weatherDescription = weatherDescription;
        }

        // Getters and Setters
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }

        public Double getHumidity() { return humidity; }
        public void setHumidity(Double humidity) { this.humidity = humidity; }

        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

        public Double getRainfall() { return rainfall; }
        public void setRainfall(Double rainfall) { this.rainfall = rainfall; }

        public Integer getAqi() { return aqi; }
        public void setAqi(Integer aqi) { this.aqi = aqi; }

        public String getWeatherDescription() { return weatherDescription; }
        public void setWeatherDescription(String weatherDescription) { this.weatherDescription = weatherDescription; }
    }

    // Nested class for custom alert settings
    public static class CustomAlertSettings {
        private Double temperatureThreshold;
        private ThresholdType temperatureThresholdType; // ABOVE, BELOW
        private Double rainfallThreshold;
        private Double windSpeedThreshold;
        private Integer aqiThreshold;
        private boolean enabledForLocation;

        public enum ThresholdType {
            ABOVE, BELOW, EQUALS
        }

        // Constructors
        public CustomAlertSettings() {}

        // Getters and Setters
        public Double getTemperatureThreshold() { return temperatureThreshold; }
        public void setTemperatureThreshold(Double temperatureThreshold) { this.temperatureThreshold = temperatureThreshold; }

        public ThresholdType getTemperatureThresholdType() { return temperatureThresholdType; }
        public void setTemperatureThresholdType(ThresholdType temperatureThresholdType) { this.temperatureThresholdType = temperatureThresholdType; }

        public Double getRainfallThreshold() { return rainfallThreshold; }
        public void setRainfallThreshold(Double rainfallThreshold) { this.rainfallThreshold = rainfallThreshold; }

        public Double getWindSpeedThreshold() { return windSpeedThreshold; }
        public void setWindSpeedThreshold(Double windSpeedThreshold) { this.windSpeedThreshold = windSpeedThreshold; }

        public Integer getAqiThreshold() { return aqiThreshold; }
        public void setAqiThreshold(Integer aqiThreshold) { this.aqiThreshold = aqiThreshold; }

        public boolean isEnabledForLocation() { return enabledForLocation; }
        public void setEnabledForLocation(boolean enabledForLocation) { this.enabledForLocation = enabledForLocation; }
    }

    // Constructors
    public WeatherAlert() {
        this.issuedAt = LocalDateTime.now();
        this.status = AlertStatus.ACTIVE;
        this.isRead = false;
        this.isNotificationSent = false;
    }

    public WeatherAlert(String userId, String cityName, String country, AlertType alertType,
                        AlertSeverity severity, String alertTitle, String alertDescription) {
        this();
        this.userId = userId;
        this.cityName = cityName;
        this.country = country;
        this.alertType = alertType;
        this.severity = severity;
        this.alertTitle = alertTitle;
        this.alertDescription = alertDescription;
        this.source = AlertSource.SYSTEM_GENERATED;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getAlertTitle() { return alertTitle; }
    public void setAlertTitle(String alertTitle) { this.alertTitle = alertTitle; }

    public String getAlertDescription() { return alertDescription; }
    public void setAlertDescription(String alertDescription) { this.alertDescription = alertDescription; }

    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }

    public AlertSeverity getSeverity() { return severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }

    public AlertSource getSource() { return source; }
    public void setSource(AlertSource source) { this.source = source; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public boolean isNotificationSent() { return isNotificationSent; }
    public void setNotificationSent(boolean notificationSent) { isNotificationSent = notificationSent; }

    public WeatherCondition getTriggerCondition() { return triggerCondition; }
    public void setTriggerCondition(WeatherCondition triggerCondition) { this.triggerCondition = triggerCondition; }

    public List<String> getAffectedAreas() { return affectedAreas; }
    public void setAffectedAreas(List<String> affectedAreas) { this.affectedAreas = affectedAreas; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public CustomAlertSettings getCustomSettings() { return customSettings; }
    public void setCustomSettings(CustomAlertSettings customSettings) { this.customSettings = customSettings; }

    // Utility methods
    public boolean isActive() {
        return status == AlertStatus.ACTIVE &&
                (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public void markNotificationSent() {
        this.isNotificationSent = true;
    }

    public String getLocationDisplayName() {
        return cityName + ", " + country;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WeatherAlert that = (WeatherAlert) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "WeatherAlert{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", cityName='" + cityName + '\'' +
                ", alertType=" + alertType +
                ", severity=" + severity +
                ", status=" + status +
                ", issuedAt=" + issuedAt +
                '}';
    }
}