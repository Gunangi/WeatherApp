// UserSettingsDto.java
package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;
import javax.validation.constraints.Max;
import javax.validation.constraints.Pattern;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSettingsDto {

    @NotNull(message = "User ID is required")
    private String userId;

    // Theme settings
    @Pattern(regexp = "^(light|dark|auto)$", message = "Theme must be light, dark, or auto")
    private String theme;

    @Pattern(regexp = "^(blue|green|purple|orange|red|pink|indigo|teal)$",
            message = "Invalid color scheme")
    private String colorScheme;

    // Unit preferences
    @Pattern(regexp = "^(celsius|fahrenheit)$", message = "Temperature unit must be celsius or fahrenheit")
    private String temperatureUnit;

    @Pattern(regexp = "^(ms|kmh|mph)$", message = "Wind speed unit must be ms, kmh, or mph")
    private String windSpeedUnit;

    @Pattern(regexp = "^(hpa|mmhg|inhg)$", message = "Pressure unit must be hpa, mmhg, or inhg")
    private String pressureUnit;

    @Pattern(regexp = "^(km|miles)$", message = "Visibility unit must be km or miles")
    private String visibilityUnit;

    @Pattern(regexp = "^(mm|inches)$", message = "Precipitation unit must be mm or inches")
    private String precipitationUnit;

    // Notification settings
    private Boolean notificationsEnabled;
    private Boolean weatherAlertsEnabled;
    private Boolean rainAlertsEnabled;
    private Boolean temperatureAlertsEnabled;
    private Boolean uvIndexAlertsEnabled;
    private Boolean airQualityAlertsEnabled;

    // Alert thresholds
    @Min(value = -50, message = "Minimum temperature alert must be at least -50°C")
    @Max(value = 50, message = "Minimum temperature alert must be at most 50°C")
    private Double minTemperatureAlert;

    @Min(value = -50, message = "Maximum temperature alert must be at least -50°C")
    @Max(value = 70, message = "Maximum temperature alert must be at most 70°C")
    private Double maxTemperatureAlert;

    @Min(value = 0, message = "AQI alert threshold must be at least 0")
    @Max(value = 500, message = "AQI alert threshold must be at most 500")
    private Integer aqiAlertThreshold;

    @Min(value = 0, message = "UV index alert threshold must be at least 0")
    @Max(value = 15, message = "UV index alert threshold must be at most 15")
    private Double uvIndexAlertThreshold;

    // Display preferences
    private Boolean showFeelsLike;
    private Boolean showHumidity;
    private Boolean showWindSpeed;
    private Boolean showPressure;
    private Boolean showVisibility;
    private Boolean showUvIndex;
    private Boolean showAirQuality;
    private Boolean show24HourFormat;

    // Dashboard preferences
    private List<String> enabledWidgets;
    private String defaultLocation;
    private List<String> favoriteLocations;
    private Boolean autoLocationDetection;

    // Data refresh settings
    @Min(value = 1, message = "Refresh interval must be at least 1 minute")
    @Max(value = 1440, message = "Refresh interval must be at most 1440 minutes (24 hours)")
    private Integer refreshInterval;

    private Boolean autoRefresh;

    // Language and locale
    @Pattern(regexp = "^[a-z]{2}$", message = "Language must be a valid 2-letter language code")
    private String language;

    private String timezone;

    // Privacy settings
    private Boolean shareLocation;
    private Boolean dataCollection;

    // Constructors
    public UserSettingsDto() {}

    public UserSettingsDto(String userId) {
        this.userId = userId;
    }

    // Getters and Setters
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

    public Boolean getNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

    public Boolean getWeatherAlertsEnabled() { return weatherAlertsEnabled; }
    public void setWeatherAlertsEnabled(Boolean weatherAlertsEnabled) { this.weatherAlertsEnabled = weatherAlertsEnabled; }

    public Boolean getRainAlertsEnabled() { return rainAlertsEnabled; }
    public void setRainAlertsEnabled(Boolean rainAlertsEnabled) { this.rainAlertsEnabled = rainAlertsEnabled; }

    public Boolean getTemperatureAlertsEnabled() { return temperatureAlertsEnabled; }
    public void setTemperatureAlertsEnabled(Boolean temperatureAlertsEnabled) { this.temperatureAlertsEnabled = temperatureAlertsEnabled; }

    public Boolean getUvIndexAlertsEnabled() { return uvIndexAlertsEnabled; }
    public void setUvIndexAlertsEnabled(Boolean uvIndexAlertsEnabled) { this.uvIndexAlertsEnabled = uvIndexAlertsEnabled; }

    public Boolean getAirQualityAlertsEnabled() { return airQualityAlertsEnabled; }
    public void setAirQualityAlertsEnabled(Boolean airQualityAlertsEnabled) { this.airQualityAlertsEnabled = airQualityAlertsEnabled; }

    public Double getMinTemperatureAlert() { return minTemperatureAlert; }
    public void setMinTemperatureAlert(Double minTemperatureAlert) { this.minTemperatureAlert = minTemperatureAlert; }

    public Double getMaxTemperatureAlert() { return maxTemperatureAlert; }
    public void setMaxTemperatureAlert(Double maxTemperatureAlert) { this.maxTemperatureAlert = maxTemperatureAlert; }

    public Integer getAqiAlertThreshold() { return aqiAlertThreshold; }
    public void setAqiAlertThreshold(Integer aqiAlertThreshold) { this.aqiAlertThreshold = aqiAlertThreshold; }

    public Double getUvIndexAlertThreshold() { return uvIndexAlertThreshold; }
    public void setUvIndexAlertThreshold(Double uvIndexAlertThreshold) { this.uvIndexAlertThreshold = uvIndexAlertThreshold; }

    public Boolean getShowFeelsLike() { return showFeelsLike; }
    public void setShowFeelsLike(Boolean showFeelsLike) { this.showFeelsLike = showFeelsLike; }

    public Boolean getShowHumidity() { return showHumidity; }
    public void setShowHumidity(Boolean showHumidity) { this.showHumidity = showHumidity; }

    public Boolean getShowWindSpeed() { return showWindSpeed; }
    public void setShowWindSpeed(Boolean showWindSpeed) { this.showWindSpeed = showWindSpeed; }

    public Boolean getShowPressure() { return showPressure; }
    public void setShowPressure(Boolean showPressure) { this.showPressure = showPressure; }

    public Boolean getShowVisibility() { return showVisibility; }
    public void setShowVisibility(Boolean showVisibility) { this.showVisibility = showVisibility; }

    public Boolean getShowUvIndex() { return showUvIndex; }
    public void setShowUvIndex(Boolean showUvIndex) { this.showUvIndex = showUvIndex; }

    public Boolean getShowAirQuality() { return showAirQuality; }
    public void setShowAirQuality(Boolean showAirQuality) { this.showAirQuality = showAirQuality; }

    public Boolean getShow24HourFormat() { return show24HourFormat; }
    public void setShow24HourFormat(Boolean show24HourFormat) { this.show24HourFormat = show24HourFormat; }

    public List<String> getEnabledWidgets() { return enabledWidgets; }
    public void setEnabledWidgets(List<String> enabledWidgets) { this.enabledWidgets = enabledWidgets; }

    public String getDefaultLocation() { return defaultLocation; }
    public void setDefaultLocation(String defaultLocation) { this.defaultLocation = defaultLocation; }

    public List<String> getFavoriteLocations() { return favoriteLocations; }
    public void setFavoriteLocations(List<String> favoriteLocations) { this.favoriteLocations = favoriteLocations; }

    public Boolean getAutoLocationDetection() { return autoLocationDetection; }
    public void setAutoLocationDetection(Boolean autoLocationDetection) { this.autoLocationDetection = autoLocationDetection; }

    public Integer getRefreshInterval() { return refreshInterval; }
    public void setRefreshInterval(Integer refreshInterval) { this.refreshInterval = refreshInterval; }

    public Boolean getAutoRefresh() { return autoRefresh; }
    public void setAutoRefresh(Boolean autoRefresh) { this.autoRefresh = autoRefresh; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Boolean getShareLocation() { return shareLocation; }
    public void setShareLocation(Boolean shareLocation) { this.shareLocation = shareLocation; }

    public Boolean getDataCollection() { return dataCollection; }
    public void setDataCollection(Boolean dataCollection) { this.dataCollection = dataCollection; }

    // Utility methods for validation
    public boolean isValidTheme() {
        return theme != null && (theme.equals("light") || theme.equals("dark") || theme.equals("auto"));
    }

    public boolean isValidTemperatureUnit() {
        return temperatureUnit != null && (temperatureUnit.equals("celsius") || temperatureUnit.equals("fahrenheit"));
    }

    public boolean hasTemperatureAlerts() {
        return Boolean.TRUE.equals(temperatureAlertsEnabled) &&
                (minTemperatureAlert != null || maxTemperatureAlert != null);
    }

    public boolean hasAirQualityAlert() {
        return Boolean.TRUE.equals(airQualityAlertsEnabled) && aqiAlertThreshold != null;
    }

    public boolean hasUvIndexAlert() {
        return Boolean.TRUE.equals(uvIndexAlertsEnabled) && uvIndexAlertThreshold != null;
    }

    public boolean isLocationBasedFeaturesEnabled() {
        return Boolean.TRUE.equals(shareLocation) && Boolean.TRUE.equals(autoLocationDetection);
    }

    @Override
    public String toString() {
        return "UserSettingsDto{" +
                "userId='" + userId + '\'' +
                ", theme='" + theme + '\'' +
                ", temperatureUnit='" + temperatureUnit + '\'' +
                ", notificationsEnabled=" + notificationsEnabled +
                ", autoLocationDetection=" + autoLocationDetection +
                '}';
    }
}25(double pm25) { this.pm25 = pm25; }

public double getPm10() { return pm10; }
public void setPm10(double pm10) { this.pm10 = pm10; }

public String getHealthRecommendation() { return healthRecommendation; }
public void setHealthRecommendation(String healthRecommendation) { this.healthRecommendation = healthRecommendation; }
    }

public static class SunMoon {
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalDateTime sunrise;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalDateTime sunset;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalDateTime moonrise;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalDateTime moonset;
    private String moonPhase;
    private double moonIllumination;

    // Getters and Setters
    public LocalDateTime getSunrise() { return sunrise; }
    public void setSunrise(LocalDateTime sunrise) { this.sunrise = sunrise; }

    public LocalDateTime getSunset() { return sunset; }
    public void setSunset(LocalDateTime sunset) { this.sunset = sunset; }

    public LocalDateTime getMoonrise() { return moonrise; }
    public void setMoonrise(LocalDateTime moonrise) { this.moonrise = moonrise; }

    public LocalDateTime getMoonset() { return moonset; }
    public void setMoonset(LocalDateTime moonset) { this.moonset = moonset; }

    public String getMoonPhase() { return moonPhase; }
    public void setMoonPhase(String moonPhase) { this.moonPhase = moonPhase; }

    public double getMoonIllumination() { return moonIllumination; }
    public void setMoonIllumination(double moonIllumination) { this.moonIllumination = moonIllumination; }
}

public static class WeatherAlert {
    private String alertId;
    private String title;
    private String description;
    private String severity; // "minor", "moderate", "severe", "extreme"
    private String certainty; // "observed", "likely", "possible"
    private String urgency; // "immediate", "expected", "future"
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    private List<String> areas;
    private String source;

    // Getters and Setters
    public String getAlertId() { return alertId; }
    public void setAlertId(String alertId) { this.alertId = alertId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getCertainty() { return certainty; }
    public void setCertainty(String certainty) { this.certainty = certainty; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public List<String> getAreas() { return areas; }
    public void setAreas(List<String> areas) { this.areas = areas; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}

// Main class getters and setters
public String getCityName() { return cityName; }
public void setCityName(String cityName) { this.cityName = cityName; }

public String getCountryCode() { return countryCode; }
public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

public String getCountryName() { return countryName; }
public void setCountryName(String countryName) { this.countryName = countryName; }

public double getLatitude() { return latitude; }
public void setLatitude(double latitude) { this.latitude = latitude; }

public double getLongitude() { return longitude; }
public void setLongitude(double longitude) { this.longitude = longitude; }

public String getTimezone() { return timezone; }
public void setTimezone(String timezone) { this.timezone = timezone; }

public LocalDateTime getLocalTime() { return localTime; }
public void setLocalTime(LocalDateTime localTime) { this.localTime = localTime; }

public CurrentWeather getCurrent() { return current; }
public void setCurrent(CurrentWeather current) { this.current = current; }

public List<DailyForecast> getDailyForecast() { return dailyForecast; }
public void setDailyForecast(List<DailyForecast> dailyForecast) { this.dailyForecast = dailyForecast; }

public List<HourlyForecast> getHourlyForecast() { return hourlyForecast; }
public void setHourlyForecast(List<HourlyForecast> hourlyForecast) { this.hourlyForecast = hourlyForecast; }

public AirQuality getAirQuality() { return airQuality; }
public void setAirQuality(AirQuality airQuality) { this.airQuality = airQuality; }

public SunMoon getSunMoon() { return sunMoon; }
public void setSunMoon(SunMoon sunMoon) { this.sunMoon = sunMoon; }

public List<WeatherAlert> getAlerts() { return alerts; }
public void setAlerts(List<WeatherAlert> alerts) { this.alerts = alerts; }

public LocalDateTime getLastUpdated() { return lastUpdated; }
public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

public String getDataSource() { return dataSource; }
public void setDataSource(String dataSource) { this.dataSource = dataSource; }

public boolean isCached() { return cached; }
public void setCached(boolean cached) { this.cached = cached; }
}