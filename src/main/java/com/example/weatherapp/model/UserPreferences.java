// UserPreferences.java
package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "user_preferences")
public class UserPreferences {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    // Theme settings
    private String theme; // "light", "dark", "auto"
    private String colorScheme; // "blue", "green", "purple", etc.

    // Unit preferences
    private String temperatureUnit; // "celsius", "fahrenheit"
    private String windSpeedUnit; // "ms", "kmh", "mph"
    private String pressureUnit; // "hpa", "mmhg", "inhg"
    private String visibilityUnit; // "km", "miles"
    private String precipitationUnit; // "mm", "inches"

    // Notification settings
    private boolean notificationsEnabled;
    private boolean weatherAlertsEnabled;
    private boolean rainAlertsEnabled;
    private boolean temperatureAlertsEnabled;
    private boolean uvIndexAlertsEnabled;
    private boolean airQualityAlertsEnabled;

    // Temperature alert thresholds
    private Double minTemperatureAlert;
    private Double maxTemperatureAlert;

    // Air quality alert threshold
    private Integer aqiAlertThreshold;

    // UV index alert threshold
    private Double uvIndexAlertThreshold;

    // Display preferences
    private boolean showFeelsLike;
    private boolean showHumidity;
    private boolean showWindSpeed;
    private boolean showPressure;
    private boolean showVisibility;
    private boolean showUvIndex;
    private boolean showAirQuality;
    private boolean show24HourFormat;

    // Dashboard preferences
    private List<String> enabledWidgets;
    private String defaultLocation;
    private List<String> favoriteLocations;
    private boolean autoLocationDetection;

    // Data refresh settings
    private int refreshInterval; // in minutes
    private boolean autoRefresh;

    // Language and locale
    private String language; // "en", "hi", "es", etc.
    private String timezone;

    // Privacy settings
    private boolean shareLocation;
    private boolean dataCollection;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public UserPreferences() {
        this.theme = "auto";
        this.colorScheme = "blue";
        this.temperatureUnit = "celsius";
        this.windSpeedUnit = "ms";
        this.pressureUnit = "hpa";
        this.visibilityUnit = "km";
        this.precipitationUnit = "mm";
        this.notificationsEnabled = true;
        this.weatherAlertsEnabled = true;
        this.rainAlertsEnabled = false;
        this.temperatureAlertsEnabled = false;
        this.uvIndexAlertsEnabled = false;
        this.airQualityAlertsEnabled = false;
        this.showFeelsLike = true;
        this.showHumidity = true;
        this.showWindSpeed = true;
        this.showPressure = true;
        this.showVisibility = true;
        this.showUvIndex = true;
        this.showAirQuality = true;
        this.show24HourFormat = true;
        this.enabledWidgets = new ArrayList<>();
        this.favoriteLocations = new ArrayList<>();
        this.autoLocationDetection = true;
        this.refreshInterval = 30;
        this.autoRefresh = true;
        this.language = "en";
        this.shareLocation = true;
        this.dataCollection = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UserPreferences(String userId) {
        this();
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getColorScheme() { return colorScheme; }
    public void setColorScheme(String colorScheme) { this.colorScheme = colorScheme; }

    public String getTemperatureUnit() { return temperatureUnit; }
    public void setTemperatureUnit(String temperatureUnit) { this.temperatureUnit = temperatureUnit; }

    public String getWindSpeedUnit() { return windSpeedUnit; }
    public void setWindSpeedUnit(String windSpeedUnit) { this.windSpeedUnit = windSpeedUnit; }

    public String getPressureUnit() { return pressureUnit; }
    public void setPressureUnit(String pressureUnit) { this.pressureUnit = pressureUnit; }

    public String getVisibilityUnit() { return visibilityUnit; }
    public void setVisibilityUnit(String visibilityUnit) { this.visibilityUnit = visibilityUnit; }

    public String getPrecipitationUnit() { return precipitationUnit; }
    public void setPrecipitationUnit(String precipitationUnit) { this.precipitationUnit = precipitationUnit; }

    public boolean isNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

    public boolean isWeatherAlertsEnabled() { return weatherAlertsEnabled; }
    public void setWeatherAlertsEnabled(boolean weatherAlertsEnabled) { this.weatherAlertsEnabled = weatherAlertsEnabled; }

    public boolean isRainAlertsEnabled() { return rainAlertsEnabled; }
    public void setRainAlertsEnabled(boolean rainAlertsEnabled) { this.rainAlertsEnabled = rainAlertsEnabled; }

    public boolean isTemperatureAlertsEnabled() { return temperatureAlertsEnabled; }
    public void setTemperatureAlertsEnabled(boolean temperatureAlertsEnabled) { this.temperatureAlertsEnabled = temperatureAlertsEnabled; }

    public boolean isUvIndexAlertsEnabled() { return uvIndexAlertsEnabled; }
    public void setUvIndexAlertsEnabled(boolean uvIndexAlertsEnabled) { this.uvIndexAlertsEnabled = uvIndexAlertsEnabled; }

    public boolean isAirQualityAlertsEnabled() { return airQualityAlertsEnabled; }
    public void setAirQualityAlertsEnabled(boolean airQualityAlertsEnabled) { this.airQualityAlertsEnabled = airQualityAlertsEnabled; }

    public Double getMinTemperatureAlert() { return minTemperatureAlert; }
    public void setMinTemperatureAlert(Double minTemperatureAlert) { this.minTemperatureAlert = minTemperatureAlert; }

    public Double getMaxTemperatureAlert() { return maxTemperatureAlert; }
    public void setMaxTemperatureAlert(Double maxTemperatureAlert) { this.maxTemperatureAlert = maxTemperatureAlert; }

    public Integer getAqiAlertThreshold() { return aqiAlertThreshold; }
    public void setAqiAlertThreshold(Integer aqiAlertThreshold) { this.aqiAlertThreshold = aqiAlertThreshold; }

    public Double getUvIndexAlertThreshold() { return uvIndexAlertThreshold; }
    public void setUvIndexAlertThreshold(Double uvIndexAlertThreshold) { this.uvIndexAlertThreshold = uvIndexAlertThreshold; }

    public boolean isShowFeelsLike() { return showFeelsLike; }
    public void setShowFeelsLike(boolean showFeelsLike) { this.showFeelsLike = showFeelsLike; }

    public boolean isShowHumidity() { return showHumidity; }
    public void setShowHumidity(boolean showHumidity) { this.showHumidity = showHumidity; }

    public boolean isShowWindSpeed() { return showWindSpeed; }
    public void setShowWindSpeed(boolean showWindSpeed) { this.showWindSpeed = showWindSpeed; }

    public boolean isShowPressure() { return showPressure; }
    public void setShowPressure(boolean showPressure) { this.showPressure = showPressure; }

    public boolean isShowVisibility() { return showVisibility; }
    public void setShowVisibility(boolean showVisibility) { this.showVisibility = showVisibility; }

    public boolean isShowUvIndex() { return showUvIndex; }
    public void setShowUvIndex(boolean showUvIndex) { this.showUvIndex = showUvIndex; }

    public boolean isShowAirQuality() { return showAirQuality; }
    public void setShowAirQuality(boolean showAirQuality) { this.showAirQuality = showAirQuality; }

    public boolean isShow24HourFormat() { return show24HourFormat; }
    public void setShow24HourFormat(boolean show24HourFormat) { this.show24HourFormat = show24HourFormat; }

    public List<String> getEnabledWidgets() { return enabledWidgets; }
    public void setEnabledWidgets(List<String> enabledWidgets) { this.enabledWidgets = enabledWidgets; }

    public String getDefaultLocation() { return defaultLocation; }
    public void setDefaultLocation(String defaultLocation) { this.defaultLocation = defaultLocation; }

    public List<String> getFavoriteLocations() { return favoriteLocations; }
    public void setFavoriteLocations(List<String> favoriteLocations) { this.favoriteLocations = favoriteLocations; }

    public boolean isAutoLocationDetection() { return autoLocationDetection; }
    public void setAutoLocationDetection(boolean autoLocationDetection) { this.autoLocationDetection = autoLocationDetection; }

    public int getRefreshInterval() { return refreshInterval; }
    public void setRefreshInterval(int refreshInterval) { this.refreshInterval = refreshInterval; }

    public boolean isAutoRefresh() { return autoRefresh; }
    public void setAutoRefresh(boolean autoRefresh) { this.autoRefresh = autoRefresh; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public boolean isShareLocation() { return shareLocation; }
    public void setShareLocation(boolean shareLocation) { this.shareLocation = shareLocation; }

    public boolean isDataCollection() { return dataCollection; }
    public void setDataCollection(boolean dataCollection) { this.dataCollection = dataCollection; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}