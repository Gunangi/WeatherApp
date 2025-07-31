package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Indexed(unique = true)
    private String username;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private boolean isActive = true;
    private boolean isEmailVerified = false;

    // Location preferences
    private String defaultLocation;
    private Double defaultLatitude;
    private Double defaultLongitude;
    private String timezone = "UTC";
    private Set<String> favoriteLocations = new HashSet<>();

    // Weather preferences
    private UserPreferences preferences = new UserPreferences();

    // Notification settings
    private NotificationSettings notificationSettings = new NotificationSettings();

    // Device tokens for push notifications
    private Set<String> deviceTokens = new HashSet<>();

    // Location history
    private List<LocationHistory> locationHistory = new ArrayList<>();

    // Weather widgets configuration
    private List<WeatherWidget> weatherWidgets = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;
    private String lastLoginIp;

    // Constructors
    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Inner classes for nested documents
    public static class UserPreferences {
        private TemperatureUnit temperatureUnit = TemperatureUnit.CELSIUS;
        private WindSpeedUnit windSpeedUnit = WindSpeedUnit.METERS_PER_SECOND;
        private PressureUnit pressureUnit = PressureUnit.HPA;
        private DistanceUnit distanceUnit = DistanceUnit.KILOMETERS;
        private TimeFormat timeFormat = TimeFormat.TWENTY_FOUR_HOUR;
        private Theme theme = Theme.AUTO;
        private String language = "en";
        private boolean showFeelsLike = true;
        private boolean showUvIndex = true;
        private boolean showAirQuality = true;
        private boolean showSunriseSunset = true;
        private boolean showHumidity = true;
        private boolean showPressure = true;
        private boolean showVisibility = true;
        private boolean showWindDetails = true;

        // Getters and Setters
        public TemperatureUnit getTemperatureUnit() { return temperatureUnit; }
        public void setTemperatureUnit(TemperatureUnit temperatureUnit) { this.temperatureUnit = temperatureUnit; }

        public WindSpeedUnit getWindSpeedUnit() { return windSpeedUnit; }
        public void setWindSpeedUnit(WindSpeedUnit windSpeedUnit) { this.windSpeedUnit = windSpeedUnit; }

        public PressureUnit getPressureUnit() { return pressureUnit; }
        public void setPressureUnit(PressureUnit pressureUnit) { this.pressureUnit = pressureUnit; }

        public DistanceUnit getDistanceUnit() { return distanceUnit; }
        public void setDistanceUnit(DistanceUnit distanceUnit) { this.distanceUnit = distanceUnit; }

        public TimeFormat getTimeFormat() { return timeFormat; }
        public void setTimeFormat(TimeFormat timeFormat) { this.timeFormat = timeFormat; }

        public Theme getTheme() { return theme; }
        public void setTheme(Theme theme) { this.theme = theme; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public boolean isShowFeelsLike() { return showFeelsLike; }
        public void setShowFeelsLike(boolean showFeelsLike) { this.showFeelsLike = showFeelsLike; }

        public boolean isShowUvIndex() { return showUvIndex; }
        public void setShowUvIndex(boolean showUvIndex) { this.showUvIndex = showUvIndex; }

        public boolean isShowAirQuality() { return showAirQuality; }
        public void setShowAirQuality(boolean showAirQuality) { this.showAirQuality = showAirQuality; }

        public boolean isShowSunriseSunset() { return showSunriseSunset; }
        public void setShowSunriseSunset(boolean showSunriseSunset) { this.showSunriseSunset = showSunriseSunset; }

        public boolean isShowHumidity() { return showHumidity; }
        public void setShowHumidity(boolean showHumidity) { this.showHumidity = showHumidity; }

        public boolean isShowPressure() { return showPressure; }
        public void setShowPressure(boolean showPressure) { this.showPressure = showPressure; }

        public boolean isShowVisibility() { return showVisibility; }
        public void setShowVisibility(boolean showVisibility) { this.showVisibility = showVisibility; }

        public boolean isShowWindDetails() { return showWindDetails; }
        public void setShowWindDetails(boolean showWindDetails) { this.showWindDetails = showWindDetails; }
    }

    public static class NotificationSettings {
        private boolean pushNotificationsEnabled = true;
        private boolean emailNotificationsEnabled = false;
        private boolean weatherAlertsEnabled = true;
        private boolean rainAlertsEnabled = true;
        private boolean temperatureAlertsEnabled = false;
        private boolean airQualityAlertsEnabled = false;
        private boolean dailySummaryEnabled = false;
        private boolean severeCutoffalerts = true;

        // Temperature thresholds
        private Double highTemperatureThreshold;
        private Double lowTemperatureThreshold;

        // Notification timing
        private String dailySummaryTime = "07:00";
        private Set<String> mutedHours = new HashSet<>(); // Hours when notifications are muted

        // Location-based notifications
        private boolean locationBasedAlerts = true;

        // Getters and Setters
        public boolean isPushNotificationsEnabled() { return pushNotificationsEnabled; }
        public void setPushNotificationsEnabled(boolean pushNotificationsEnabled) { this.pushNotificationsEnabled = pushNotificationsEnabled; }

        public boolean isEmailNotificationsEnabled() { return emailNotificationsEnabled; }
        public void setEmailNotificationsEnabled(boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }

        public boolean isWeatherAlertsEnabled() { return weatherAlertsEnabled; }
        public void setWeatherAlertsEnabled(boolean weatherAlertsEnabled) { this.weatherAlertsEnabled = weatherAlertsEnabled; }

        public boolean isRainAlertsEnabled() { return rainAlertsEnabled; }
        public void setRainAlertsEnabled(boolean rainAlertsEnabled) { this.rainAlertsEnabled = rainAlertsEnabled; }

        public boolean isTemperatureAlertsEnabled() { return temperatureAlertsEnabled; }
        public void setTemperatureAlertsEnabled(boolean temperatureAlertsEnabled) { this.temperatureAlertsEnabled = temperatureAlertsEnabled; }

        public boolean isAirQualityAlertsEnabled() { return airQualityAlertsEnabled; }
        public void setAirQualityAlertsEnabled(boolean airQualityAlertsEnabled) { this.airQualityAlertsEnabled = airQualityAlertsEnabled; }

        public boolean isDailySummaryEnabled() { return dailySummaryEnabled; }
        public void setDailySummaryEnabled(boolean dailySummaryEnabled) { this.dailySummaryEnabled = dailySummaryEnabled; }

        public boolean isSevereCutoffAlerts() { return severeCutoffAlerts; }
        public void setSevereCutoffAlerts(boolean severeCutoffAlerts) { this.severeCutoffAlerts = severeCutoffAlerts; }

        public Double getHighTemperatureThreshold() { return highTemperatureThreshold; }
        public void setHighTemperatureThreshold(Double highTemperatureThreshold) { this.highTemperatureThreshold = highTemperatureThreshold; }

        public Double getLowTemperatureThreshold() { return lowTemperatureThreshold; }
        public void setLowTemperatureThreshold(Double lowTemperatureThreshold) { this.lowTemperatureThreshold = lowTemperatureThreshold; }

        public String getDailySummaryTime() { return dailySummaryTime; }
        public void setDailySummaryTime(String dailySummaryTime) { this.dailySummaryTime = dailySummaryTime; }

        public Set<String> getMutedHours() { return mutedHours; }
        public void setMutedHours(Set<String> mutedHours) { this.mutedHours = mutedHours; }

        public boolean isLocationBasedAlerts() { return locationBasedAlerts; }
        public void setLocationBasedAlerts(boolean locationBasedAlerts) { this.locationBasedAlerts = locationBasedAlerts; }
    }

    public static class LocationHistory {
        private String locationName;
        private Double latitude;
        private Double longitude;
        private LocalDateTime searchedAt;
        private int searchCount = 1;

        public LocationHistory() {}

        public LocationHistory(String locationName, Double latitude, Double longitude) {
            this.locationName = locationName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.searchedAt = LocalDateTime.now();
        }

        // Getters and Setters
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public LocalDateTime getSearchedAt() { return searchedAt; }
        public void setSearchedAt(LocalDateTime searchedAt) { this.searchedAt = searchedAt; }

        public int getSearchCount() { return searchCount; }
        public void setSearchCount(int searchCount) { this.searchCount = searchCount; }
    }

    public static class WeatherWidget {
        private String widgetId;
        private WidgetType type;
        private String locationName;
        private Double latitude;
        private Double longitude;
        private int position;
        private boolean isEnabled = true;

        // Getters and Setters
        public String getWidgetId() { return widgetId; }
        public void setWidgetId(String widgetId) { this.widgetId = widgetId; }

        public WidgetType getType() { return type; }
        public void setType(WidgetType type) { this.type = type; }

        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public int getPosition() { return position; }
        public void setPosition(int position) { this.position = position; }

        public boolean isEnabled() { return isEnabled; }
        public void setEnabled(boolean enabled) { isEnabled = enabled; }
    }

    // Enums
    public enum TemperatureUnit {
        CELSIUS, FAHRENHEIT, KELVIN
    }

    public enum WindSpeedUnit {
        METERS_PER_SECOND, KILOMETERS_PER_HOUR, MILES_PER_HOUR, KNOTS
    }

    public enum PressureUnit {
        HPA, INCHES_HG, MBAR, MMHG
    }

    public enum DistanceUnit {
        KILOMETERS, MILES
    }

    public enum TimeFormat {
        TWELVE_HOUR, TWENTY_FOUR_HOUR
    }

    public enum Theme {
        LIGHT, DARK, AUTO
    }

    public enum WidgetType {
        CURRENT_WEATHER, FORECAST, AIR_QUALITY, UV_INDEX, HUMIDITY, PRESSURE
    }

    // Main getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isEmailVerified() { return isEmailVerified; }
    public void setEmailVerified(boolean emailVerified) { isEmailVerified = emailVerified; }

    public String getDefaultLocation() { return defaultLocation; }
    public void setDefaultLocation(String defaultLocation) { this.defaultLocation = defaultLocation; }

    public Double getDefaultLatitude() { return defaultLatitude; }
    public void setDefaultLatitude(Double defaultLatitude) { this.defaultLatitude = defaultLatitude; }

    public Double getDefaultLongitude() { return defaultLongitude; }
    public void setDefaultLongitude(Double defaultLongitude) { this.defaultLongitude = defaultLongitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Set<String> getFavoriteLocations() { return favoriteLocations; }
    public void setFavoriteLocations(Set<String> favoriteLocations) { this.favoriteLocations = favoriteLocations; }

    public UserPreferences getPreferences() { return preferences; }
    public void setPreferences(UserPreferences preferences) { this.preferences = preferences; }

    public NotificationSettings getNotificationSettings() { return notificationSettings; }
    public void setNotificationSettings(NotificationSettings notificationSettings) { this.notificationSettings = notificationSettings; }

    public Set<String> getDeviceTokens() { return deviceTokens; }
    public void setDeviceTokens(Set<String> deviceTokens) { this.deviceTokens = deviceTokens; }

    public List<LocationHistory> getLocationHistory() { return locationHistory; }
    public void setLocationHistory(List<LocationHistory> locationHistory) { this.locationHistory = locationHistory; }

    public List<WeatherWidget> getWeatherWidgets() { return weatherWidgets; }
    public void setWeatherWidgets(List<WeatherWidget> weatherWidgets) { this.weatherWidgets = weatherWidgets; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public String getLastLoginIp() { return lastLoginIp; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }
}