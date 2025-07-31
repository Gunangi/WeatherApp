package com.example.weatherapp.dto;

import com.example.weatherapp.model.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardData {
    private ExtendedWeatherData currentWeather;
    private List<FavoriteLocation> favoriteLocations;
    private List<WeatherAlert> activeAlerts;
    private List<HourlyWeatherData> hourlyForecast;
    private List<DailyWeatherData> weeklyForecast;
    private List<ActivityRecommendation> todayRecommendations;
    private ClothingRecommendation clothingAdvice;
    private List<WeatherWidget> userWidgets;
    private List<WeatherJournalEntry> recentJournalEntries;
    private AirQualityData airQuality;
    private String moonPhase;
    private List<WeatherReminder> upcomingReminders;
}
