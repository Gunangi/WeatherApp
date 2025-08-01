package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class UserSettingsDto {

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("email")
    @Email(message = "Please provide a valid email address")
    private String email;

    // Temperature and Units Preferences
    @JsonProperty("temperatureUnit")
    @NotNull(message = "Temperature unit cannot be null")
    private TemperatureUnit temperatureUnit = TemperatureUnit.CELSIUS;

    @JsonProperty("windSpeedUnit")
    private WindSpeedUnit windSpeedUnit = WindSpeedUnit.METERS_PER_SECOND;

    @JsonProperty("pressureUnit")
    private PressureUnit pressureUnit = PressureUnit.HPA;

    @JsonProperty("visibilityUnit")
    private VisibilityUnit visibilityUnit = VisibilityUnit.KILOMETERS;

    @JsonProperty("precipitationUnit")
    private PrecipitationUnit precipitationUnit = PrecipitationUnit.MILLIMETERS;

    // Theme and Display Preferences
    @JsonProperty("theme")
    private ThemeMode theme = ThemeMode.AUTO;

    @JsonProperty("language")
    private String language = "en";

    @JsonProperty("timeFormat")
    private TimeFormat timeFormat = TimeFormat.HOUR_24;

    @JsonProperty("dateFormat")
    private String dateFormat = "DD/MM/YYYY";

    // Location Preferences
    @JsonProperty("defaultLocation")
    private LocationDto defaultLocation;

    @JsonProperty("favoriteLocations")
    private List<LocationDto> favoriteLocations;

    @JsonProperty("autoLocationDetection")
    private boolean autoLocationDetection = true;

    @JsonProperty("locationHistoryEnabled")
    private boolean locationHistoryEnabled = true;

    @JsonProperty("maxLocationHistory")
    @Min(5) @Max(50)
    private int maxLocationHistory = 20;

    // Notification Preferences
    @JsonProperty("notificationsEnabled")
    private boolean notificationsEnabled = true;

    @JsonProperty("weatherAlertsEnabled")
    private boolean weatherAlertsEnabled = true;

    @JsonProperty("dailyForecastNotification")
    private boolean dailyForecastNotification = false;

    @JsonProperty("rainAlertEnabled")
    private boolean rainAlertEnabled = true;

    @JsonProperty("temperatureThresholdAlerts")
    private boolean temperatureThresholdAlerts = false;

    @JsonProperty("minTemperatureThreshold")
    private Double minTemperatureThreshold;

    @JsonProperty("maxTemperatureThreshold")
    private Double maxTemperatureThreshold;

    @JsonProperty("airQualityAlerts")
    private boolean airQualityAlerts = true;

    @JsonProperty("uvIndexAlerts")
    private boolean uvIndexAlerts = false;

    @JsonProperty("notificationTime")
    @JsonFormat(pattern = "HH:mm")
    private String notificationTime = "08:00";

    // Widget and Dashboard Preferences
    @JsonProperty("dashboardWidgets")
    private List<String> dashboardWidgets;

    @JsonProperty("widgetLayout")
    private String widgetLayout = "grid";

    @JsonProperty("showFeelsLikeTemperature")
    private boolean showFeelsLikeTemperature = true;

    @JsonProperty("showHumidity")
    private boolean showHumidity = true;

    @JsonProperty("showWindSpeed")
    private boolean showWindSpeed = true;

    @JsonProperty("showPressure")
    private boolean showPressure = true;

    @JsonProperty("showVisibility")
    private boolean showVisibility = false;

    @JsonProperty("showUvIndex")
    private boolean showUvIndex = false;

    @JsonProperty("showAirQuality")
    private boolean showAirQuality = true;

    @JsonProperty("show24HourForecast")
    private boolean show24HourForecast = true;

    @JsonProperty("forecastDays")
    @Min(3) @Max(14)
    private int forecastDays = 5;

    // Activity and Recommendation Preferences
    @JsonProperty("activityRecommendationsEnabled")
    private boolean activityRecommendationsEnabled = true;

    @JsonProperty("clothingRecommendationsEnabled")
    private boolean clothingRecommendationsEnabled = true;

    @JsonProperty("preferredActivities")
    private List<String> preferredActivities;

    @JsonProperty("activityDifficultyLevel")
    private ActivityLevel activityDifficultyLevel = ActivityLevel.MODERATE;

    // Privacy and Data Preferences
    @JsonProperty("shareLocationData")
    private boolean shareLocationData = false;

    @JsonProperty("shareUsageStatistics")
    private boolean shareUsageStatistics = true;

    @JsonProperty("dataRetentionPeriod")
    @Min(30) @Max(365)
    private int dataRetentionPeriod = 90; // days

    // Advanced Features
    @JsonProperty("premiumFeaturesEnabled")
    private boolean premiumFeaturesEnabled = false;

    @JsonProperty("extendedForecastEnabled")
    private boolean extendedForecastEnabled = false;

    @JsonProperty("historicalWeatherEnabled")
    private boolean historicalWeatherEnabled = false;

    @JsonProperty("weatherComparison")
    private boolean weatherComparison = false;

    // Timestamps
    @JsonProperty("createdAt")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonProperty("lastLoginAt")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginAt;

    // Constructors
    public UserSettingsDto() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UserSettingsDto(String userId, String email) {
        this();
        this.userId = userId;
        this.email = email;
    }

    // Enums
    public enum TemperatureUnit {
        CELSIUS, FAHRENHEIT, KELVIN
    }

    public enum WindSpeedUnit {
        METERS_PER_SECOND, KILOMETERS_PER_HOUR, MILES_PER_HOUR, KNOTS
    }

    public enum PressureUnit {
        HPA, MMHG, INHG, KPA, PSI
    }

    public enum VisibilityUnit {
        KILOMETERS, MILES, METERS
    }

    public enum PrecipitationUnit {
        MILLIMETERS, INCHES
    }

    public enum ThemeMode {
        LIGHT, DARK, AUTO
    }

    public enum TimeFormat {
        HOUR_12, HOUR_24
    }

    public enum ActivityLevel {
        BEGINNER, MODERATE, ADVANCED, EXPERT
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public TemperatureUnit getTemperatureUnit() { return temperatureUnit; }
    public void setTemperatureUnit(TemperatureUnit temperatureUnit) { this.temperatureUnit = temperatureUnit; }

    public WindSpeedUnit getWindSpeedUnit() { return windSpeedUnit; }
    public void setWindSpeedUnit(WindSpeedUnit windSpeedUnit) { this.windSpeedUnit = windSpeedUnit; }

    public PressureUnit getPressureUnit() { return pressureUnit; }
    public void setPressureUnit(PressureUnit pressureUnit) { this.pressureUnit = pressureUnit; }

    public VisibilityUnit getVisibilityUnit() { return visibilityUnit; }
    public void setVisibilityUnit(VisibilityUnit visibilityUnit) { this.visibilityUnit = visibilityUnit; }

    public PrecipitationUnit getPrecipitationUnit() { return precipitationUnit; }
    public void setPrecipitationUnit(PrecipitationUnit precipitationUnit) { this.precipitationUnit = precipitationUnit; }

    public ThemeMode getTheme() { return theme; }
    public void setTheme(ThemeMode theme) { this.theme = theme; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public TimeFormat getTimeFormat() { return timeFormat; }
    public void setTimeFormat(TimeFormat timeFormat) { this.timeFormat = timeFormat; }

    public String getDateFormat() { return dateFormat; }
    public void setDateFormat(String dateFormat) { this.dateFormat = dateFormat; }

    public LocationDto getDefaultLocation() { return defaultLocation; }
    public void setDefaultLocation(LocationDto defaultLocation) { this.defaultLocation = defaultLocation; }

    public List<LocationDto> getFavoriteLocations() { return favoriteLocations; }
    public void setFavoriteLocations(List<LocationDto> favoriteLocations) { this.favoriteLocations = favoriteLocations; }

    public boolean isAutoLocationDetection() { return autoLocationDetection; }
    public void setAutoLocationDetection(boolean autoLocationDetection) { this.autoLocationDetection = autoLocationDetection; }

    public boolean isLocationHistoryEnabled() { return locationHistoryEnabled; }
    public void setLocationHistoryEnabled(boolean locationHistoryEnabled) { this.locationHistoryEnabled = locationHistoryEnabled; }

    public int getMaxLocationHistory() { return maxLocationHistory; }
    public void setMaxLocationHistory(int maxLocationHistory) { this.maxLocationHistory = maxLocationHistory; }

    public boolean isNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

    public boolean isWeatherAlertsEnabled() { return weatherAlertsEnabled; }
    public void setWeatherAlertsEnabled(boolean weatherAlertsEnabled) { this.weatherAlertsEnabled = weatherAlertsEnabled; }

    public boolean isDailyForecastNotification() { return dailyForecastNotification; }
    public void setDailyForecastNotification(boolean dailyForecastNotification) { this.dailyForecastNotification = dailyForecastNotification; }

    public boolean isRainAlertEnabled() { return rainAlertEnabled; }
    public void setRainAlertEnabled(boolean rainAlertEnabled) { this.rainAlertEnabled = rainAlertEnabled; }

    public boolean isTemperatureThresholdAlerts() { return temperatureThresholdAlerts; }
    public void setTemperatureThresholdAlerts(boolean temperatureThresholdAlerts) { this.temperatureThresholdAlerts = temperatureThresholdAlerts; }

    public Double getMinTemperatureThreshold() { return minTemperatureThreshold; }
    public void setMinTemperatureThreshold(Double minTemperatureThreshold) { this.minTemperatureThreshold = minTemperatureThreshold; }

    public Double getMaxTemperatureThreshold() { return maxTemperatureThreshold; }
    public void setMaxTemperatureThreshold(Double maxTemperatureThreshold) { this.maxTemperatureThreshold = maxTemperatureThreshold; }

    public boolean isAirQualityAlerts() { return airQualityAlerts; }
    public void setAirQualityAlerts(boolean airQualityAlerts) { this.airQualityAlerts = airQualityAlerts; }

    public boolean isUvIndexAlerts() { return uvIndexAlerts; }
    public void setUvIndexAlerts(boolean uvIndexAlerts) { this.uvIndexAlerts = uvIndexAlerts; }

    public String getNotificationTime() { return notificationTime; }
    public void setNotificationTime(String notificationTime) { this.notificationTime = notificationTime; }

    public List<String> getDashboardWidgets() { return dashboardWidgets; }
    public void setDashboardWidgets(List<String> dashboardWidgets) { this.dashboardWidgets = dashboardWidgets; }

    public String getWidgetLayout() { return widgetLayout; }
    public void setWidgetLayout(String widgetLayout) { this.widgetLayout = widgetLayout; }

    public boolean isShowFeelsLikeTemperature() { return showFeelsLikeTemperature; }
    public void setShowFeelsLikeTemperature(boolean showFeelsLikeTemperature) { this.showFeelsLikeTemperature = showFeelsLikeTemperature; }

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

    public boolean isShow24HourForecast() { return show24HourForecast; }
    public void setShow24HourForecast(boolean show24HourForecast) { this.show24HourForecast = show24HourForecast; }

    public int getForecastDays() { return forecastDays; }
    public void setForecastDays(int forecastDays) { this.forecastDays = forecastDays; }

    public boolean isActivityRecommendationsEnabled() { return activityRecommendationsEnabled; }
    public void setActivityRecommendationsEnabled(boolean activityRecommendationsEnabled) { this.activityRecommendationsEnabled = activityRecommendationsEnabled; }

    public boolean isClothingRecommendationsEnabled() { return clothingRecommendationsEnabled; }
    public void setClothingRecommendationsEnabled(boolean clothingRecommendationsEnabled) { this.clothingRecommendationsEnabled = clothingRecommendationsEnabled; }

    public List<String> getPreferredActivities() { return preferredActivities; }
    public void setPreferredActivities(List<String> preferredActivities) { this.preferredActivities = preferredActivities; }

    public ActivityLevel getActivityDifficultyLevel() { return activityDifficultyLevel; }
    public void setActivityDifficultyLevel(ActivityLevel activityDifficultyLevel) { this.activityDifficultyLevel = activityDifficultyLevel; }

    public boolean isShareLocationData() { return shareLocationData; }
    public void setShareLocationData(boolean shareLocationData) { this.shareLocationData = shareLocationData; }

    public boolean isShareUsageStatistics() { return shareUsageStatistics; }
    public void setShareUsageStatistics(boolean shareUsageStatistics) { this.shareUsageStatistics = shareUsageStatistics; }

    public int getDataRetentionPeriod() { return dataRetentionPeriod; }
    public void setDataRetentionPeriod(int dataRetentionPeriod) { this.dataRetentionPeriod = dataRetentionPeriod; }

    public boolean isPremiumFeaturesEnabled() { return premiumFeaturesEnabled; }
    public void setPremiumFeaturesEnabled(boolean premiumFeaturesEnabled) { this.premiumFeaturesEnabled = premiumFeaturesEnabled; }

    public boolean isExtendedForecastEnabled() { return extendedForecastEnabled; }
    public void setExtendedForecastEnabled(boolean extendedForecastEnabled) { this.extendedForecastEnabled = extendedForecastEnabled; }

    public boolean isHistoricalWeatherEnabled() { return historicalWeatherEnabled; }
    public void setHistoricalWeatherEnabled(boolean historicalWeatherEnabled) { this.historicalWeatherEnabled = historicalWeatherEnabled; }

    public boolean isWeatherComparison() { return weatherComparison; }
    public void setWeatherComparison(boolean weatherComparison) { this.weatherComparison = weatherComparison; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    @Override
    public String toString() {
        return "UserSettingsDto{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", temperatureUnit=" + temperatureUnit +
                ", theme=" + theme +
                ", language='" + language + '\'' +
                ", notificationsEnabled=" + notificationsEnabled +
                ", updatedAt=" + updatedAt +
                '}';
    }
}