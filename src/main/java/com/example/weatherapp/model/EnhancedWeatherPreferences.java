package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnhancedWeatherPreferences {
    // Basic preferences
    private String temperatureUnit = "celsius";
    private String windSpeedUnit = "ms"; // ms, kmh, mph
    private String pressureUnit = "hPa"; // hPa, inHg, mmHg
    private String visibilityUnit = "km"; // km, miles
    private String timeFormat = "24h";
    private String theme = "light";

    // Dashboard preferences
    private int forecastDays = 5;
    private int hourlyForecastHours = 24;
    private boolean showHourlyForecast = true;
    private boolean showAirQuality = true;
    private boolean showUVIndex = true;
    private boolean showMoonPhase = true;
    private boolean showSunriseSunset = true;

    // Location preferences
    private Location defaultLocation;
    private boolean enableGPSDetection = true;
    private boolean saveLocationHistory = true;
    private int maxLocationHistory = 10;
    private List<String> favoriteLocationIds;

    // Notification preferences
    private UserNotificationPreferences notificationPreferences;

    // Widget preferences
    private List<String> enabledWidgets;
    private String dashboardLayout = "grid"; // grid, list, compact

    // Feature preferences
    private boolean enableMLPredictions = true;
    private boolean enableActivityRecommendations = true;
    private boolean enableClothingRecommendations = true;
    private boolean showWeatherComparison = true;
    private boolean enableWeatherJournal = true;
    private boolean enableWeatherSharing = true;

    // Privacy preferences
    private boolean shareJournalEntries = false;
    private boolean allowLocationTracking = true;
    private boolean anonymousUsageData = true;

    // Advanced preferences
    private String preferredWeatherSource = "openweathermap";
    private boolean enableWeatherRadar = true;
    private boolean enableSatelliteImagery = true;
    private int cacheExpirationMinutes = 15;
}