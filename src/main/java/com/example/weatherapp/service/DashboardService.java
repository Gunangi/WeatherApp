// src/main/java/com/example/weatherapp/service/DashboardService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.DashboardData;
import com.example.weatherapp.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EnhancedWeatherService weatherService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private WeatherAlertService alertService;

    @Autowired
    private ActivityRecommendationService activityService;

    @Autowired
    private ClothingRecommendationService clothingService;

    @Autowired
    private WeatherJournalService journalService;

    @Autowired
    private WeatherWidgetService widgetService;

    @Autowired
    private WeatherReminderService reminderService;

    @Autowired
    private UserService userService;

    public DashboardData getCompleteDashboardData(String userId) {
        try {
            // Get user's default location or first favorite
            FavoriteLocation defaultLocation = getDefaultLocation(userId);

            if (defaultLocation == null) {
                return getEmptyDashboard();
            }

            ExtendedWeatherData currentWeather = weatherService.getWeatherByCoordinates(
                    defaultLocation.getLatitude(), defaultLocation.getLongitude());

            return buildDashboardData(userId, currentWeather, defaultLocation.getCityName());

        } catch (Exception e) {
            throw new RuntimeException("Failed to get dashboard data for user: " + userId, e);
        }
    }

    public DashboardData getDashboardDataForLocation(String userId, String locationId) {
        try {
            ExtendedWeatherData currentWeather = weatherService.getExtendedWeatherData(locationId);
            return buildDashboardData(userId, currentWeather, locationId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get dashboard data for location: " + locationId, e);
        }
    }

    public DashboardData getDashboardDataByCoordinates(String userId, double lat, double lon) {
        try {
            ExtendedWeatherData currentWeather = weatherService.getWeatherByCoordinates(lat, lon);
            return buildDashboardData(userId, currentWeather, currentWeather.getLocationName());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get dashboard data for coordinates", e);
        }
    }

    public DashboardData refreshDashboardData(String userId) {
        // Clear cache and get fresh data
        return getCompleteDashboardData(userId);
    }

    public Map<String, Object> getDashboardSummary(String userId) {
        Map<String, Object> summary = new HashMap<>();

        try {
            List<FavoriteLocation> favorites = locationService.getFavoriteLocations(userId);
            List<WeatherAlert> activeAlerts = alertService.getActiveUserAlerts(userId);

            summary.put("favoriteLocationsCount", favorites.size());
            summary.put("activeAlertsCount", activeAlerts.size());
            summary.put("lastUpdated", LocalDateTime.now());

            if (!favorites.isEmpty()) {
                FavoriteLocation defaultLocation = getDefaultLocation(userId);
                if (defaultLocation != null) {
                    ExtendedWeatherData weather = weatherService.getWeatherByCoordinates(
                            defaultLocation.getLatitude(), defaultLocation.getLongitude());
                    summary.put("currentTemperature", weather.getTemperature());
                    summary.put("currentCondition", weather.getDescription());
                    summary.put("defaultLocation", defaultLocation.getCityName());
                }
            }

        } catch (Exception e) {
            summary.put("error", "Failed to get dashboard summary");
        }

        return summary;
    }

    public DashboardData getWidgetData(String userId) {
        try {
            DashboardData dashboardData = getCompleteDashboardData(userId);

            // Filter to only include widget-specific data
            List<WeatherWidget> userWidgets = widgetService.getUserWidgets(userId);
            dashboardData.setUserWidgets(userWidgets);

            return dashboardData;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get widget data", e);
        }
    }

    private DashboardData buildDashboardData(String userId, ExtendedWeatherData currentWeather, String locationName) {
        try {
            return DashboardData.builder()
                    .currentWeather(currentWeather)
                    .favoriteLocations(locationService.getFavoriteLocations(userId))
                    .activeAlerts(alertService.getActiveUserAlerts(userId))
                    .hourlyForecast(currentWeather.getHourlyForecast())
                    .weeklyForecast(currentWeather.getDailyForecast())
                    .todayRecommendations(activityService.getRecommendations(currentWeather))
                    .clothingAdvice(clothingService.getClothingAdvice(currentWeather))
                    .userWidgets(widgetService.getUserWidgets(userId))
                    .recentJournalEntries(journalService.getRecentEntries(userId, 5))
                    .airQuality(currentWeather.getAirQuality())
                    .moonPhase(currentWeather.getMoonPhase())
                    .upcomingReminders(reminderService.getUpcomingReminders(userId))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build dashboard data", e);
        }
    }

    private FavoriteLocation getDefaultLocation(String userId) {
        List<FavoriteLocation> favorites = locationService.getFavoriteLocations(userId);

        // Find default location
        Optional<FavoriteLocation> defaultLocation = favorites.stream()
                .filter(FavoriteLocation::isDefault)
                .findFirst();

        if (defaultLocation.isPresent()) {
            return defaultLocation.get();
        }

        // If no default, return first favorite
        return favorites.isEmpty() ? null : favorites.get(0);
    }

    private DashboardData getEmptyDashboard() {
        return DashboardData.builder()
                .favoriteLocations(new ArrayList<>())
                .activeAlerts(new ArrayList<>())
                .hourlyForecast(new ArrayList<>())
                .weeklyForecast(new ArrayList<>())
                .todayRecommendations(new ArrayList<>())
                .userWidgets(new ArrayList<>())
                .recentJournalEntries(new ArrayList<>())
                .upcomingReminders(new ArrayList<>())
                .build();
    }

    public List<ExtendedWeatherData> getMultiLocationWeather(String userId) {
        List<FavoriteLocation> favorites = locationService.getFavoriteLocations(userId);

        return favorites.stream()
                .map(location -> {
                    try {
                        return weatherService.getWeatherByCoordinates(
                                location.getLatitude(), location.getLongitude());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public void updateDashboardPreferences(String userId, Map<String, Object> preferences) {
        try {
            Optional<EnhancedWeatherPreferences> userPrefs = userService.getUserPreferences(userId);
            if (userPrefs.isPresent()) {
                EnhancedWeatherPreferences prefs = userPrefs.get();

                // Update dashboard-specific preferences
                if (preferences.containsKey("forecastDays")) {
                    prefs.setForecastDays((Integer) preferences.get("forecastDays"));
                }
                if (preferences.containsKey("hourlyForecastHours")) {
                    prefs.setHourlyForecastHours((Integer) preferences.get("hourlyForecastHours"));
                }
                if (preferences.containsKey("dashboardLayout")) {
                    prefs.setDashboardLayout((String) preferences.get("dashboardLayout"));
                }
                if (preferences.containsKey("enabledWidgets")) {
                    prefs.setEnabledWidgets((List<String>) preferences.get("enabledWidgets"));
                }

                userService.updateUserPreferences(userId, prefs);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to update dashboard preferences", e);
        }
    }
}
