package com.example.weatherapp.service;

import com.example.weatherapp.dto.ActivityRecommendationDto;
import com.example.weatherapp.dto.WeatherDataDto;
import com.example.weatherapp.model.ActivityRecommendation;
import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.repository.ActivityRecommendationRepository;
import com.example.weatherapp.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActivityRecommendationService {

    @Autowired
    private ActivityRecommendationRepository activityRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    public List<ActivityRecommendationDto> getActivityRecommendations(String userId, WeatherDataDto weatherData) {
        UserPreferences userPrefs = userPreferencesRepository.findByUserId(userId)
                .orElse(new UserPreferences());

        List<ActivityRecommendationDto> recommendations = new ArrayList<>();

        // Outdoor activities based on weather
        recommendations.addAll(getOutdoorActivities(weatherData, userPrefs));

        // Indoor activities for bad weather
        if (isBadWeather(weatherData)) {
            recommendations.addAll(getIndoorActivities(weatherData, userPrefs));
        }

        // Time-based activities
        recommendations.addAll(getTimeBasedActivities(weatherData, userPrefs));

        // Filter and rank recommendations
        return recommendations.stream()
                .distinct()
                .sorted(Comparator.comparing(ActivityRecommendationDto::getPriority).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<ActivityRecommendationDto> getOutdoorActivities(WeatherDataDto weather, UserPreferences prefs) {
        List<ActivityRecommendationDto> activities = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = weather.getWeatherCondition().toLowerCase();
        double windSpeed = weather.getWindSpeed();
        double humidity = weather.getHumidity();

        if (temp >= 20 && temp <= 30 && !condition.contains("rain") && windSpeed < 15) {
            activities.add(new ActivityRecommendationDto(
                    "Walking or Jogging",
                    "Perfect weather for outdoor exercise",
                    "outdoor", 8, "🚶‍♂️"));

            activities.add(new ActivityRecommendationDto(
                    "Picnic in the Park",
                    "Great weather for outdoor dining",
                    "outdoor", 7, "🧺"));
        }

        if (temp >= 15 && temp <= 25 && !condition.contains("rain")) {
            activities.add(new ActivityRecommendationDto(
                    "Cycling",
                    "Ideal temperature for bike rides",
                    "outdoor", 8, "🚴‍♂️"));
        }

        if (temp >= 25 && condition.contains("sun")) {
            activities.add(new ActivityRecommendationDto(
                    "Swimming",
                    "Hot weather perfect for swimming",
                    "outdoor", 9, "🏊‍♂️"));

            activities.add(new ActivityRecommendationDto(
                    "Beach Activities",
                    "Sunny weather great for beach fun",
                    "outdoor", 8, "🏖️"));
        }

        if (temp >= 10 && temp <= 20 && windSpeed >= 10) {
            activities.add(new ActivityRecommendationDto(
                    "Kite Flying",
                    "Good wind conditions for kites",
                    "outdoor", 6, "🪁"));
        }

        if (condition.contains("snow")) {
            activities.add(new ActivityRecommendationDto(
                    "Snow Activities",
                    "Perfect for snowman building or skiing",
                    "outdoor", 7, "⛄"));
        }

        return activities;
    }

    private List<ActivityRecommendationDto> getIndoorActivities(WeatherDataDto weather, UserPreferences prefs) {
        List<ActivityRecommendationDto> activities = new ArrayList<>();

        activities.add(new ActivityRecommendationDto(
                "Reading",
                "Perfect weather to stay indoors with a good book",
                "indoor", 6, "📚"));

        activities.add(new ActivityRecommendationDto(
                "Cooking or Baking",
                "Great time to try new recipes",
                "indoor", 7, "👨‍🍳"));

        activities.add(new ActivityRecommendationDto(
                "Indoor Workout",
                "Stay fit with home exercises",
                "indoor", 8, "🏋️‍♂️"));

        activities.add(new ActivityRecommendationDto(
                "Movie Marathon",
                "Perfect weather for entertainment",
                "indoor", 6, "🎬"));

        activities.add(new ActivityRecommendationDto(
                "Board Games",
                "Quality time with family and friends",
                "indoor", 7, "🎲"));

        return activities;
    }

    private List<ActivityRecommendationDto> getTimeBasedActivities(WeatherDataDto weather, UserPreferences prefs) {
        List<ActivityRecommendationDto> activities = new ArrayList<>();
        LocalTime currentTime = LocalTime.now();

        if (currentTime.isBefore(LocalTime.of(10, 0)) && weather.getTemperature() > 15) {
            activities.add(new ActivityRecommendationDto(
                    "Morning Walk",
                    "Start your day with fresh air",
                    "morning", 8, "🌅"));
        }

        if (currentTime.isAfter(LocalTime.of(17, 0)) && weather.getTemperature() > 20) {
            activities.add(new ActivityRecommendationDto(
                    "Evening Outdoor Dining",
                    "Perfect evening weather for outdoor meals",
                    "evening", 7, "🍽️"));
        }

        if (currentTime.isAfter(LocalTime.of(20, 0)) && weather.getWeatherCondition().toLowerCase().contains("clear")) {
            activities.add(new ActivityRecommendationDto(
                    "Stargazing",
                    "Clear skies perfect for astronomy",
                    "night", 6, "🌟"));
        }

        return activities;
    }

    public List<ActivityRecommendationDto> getPersonalizedRecommendations(String userId, WeatherDataDto weather) {
        UserPreferences prefs = userPreferencesRepository.findByUserId(userId)
                .orElse(new UserPreferences());

        List<ActivityRecommendationDto> allRecommendations = getActivityRecommendations(userId, weather);

        // Filter based on user preferences
        return allRecommendations.stream()
                .filter(activity -> matchesUserPreferences(activity, prefs))
                .collect(Collectors.toList());
    }

    public ActivityRecommendationDto getTopRecommendation(String userId, WeatherDataDto weather) {
        List<ActivityRecommendationDto> recommendations = getPersonalizedRecommendations(userId, weather);
        return recommendations.isEmpty() ? null : recommendations.get(0);
    }

    public List<ActivityRecommendationDto> getRecommendationsByCategory(
            String userId, String category, WeatherDataDto weather) {
        return getPersonalizedRecommendations(userId, weather).stream()
                .filter(activity -> activity.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    public void saveUserActivityFeedback(String userId, String activityId, boolean liked) {
        // Update user preferences based on feedback
        UserPreferences prefs = userPreferencesRepository.findByUserId(userId)
                .orElse(new UserPreferences(userId));

        if (liked) {
            prefs.addLikedActivity(activityId);
        } else {
            prefs.addDislikedActivity(activityId);
        }

        userPreferencesRepository.save(prefs);
    }

    private boolean isBadWeather(WeatherDataDto weather) {
        String condition = weather.getWeatherCondition().toLowerCase();
        return condition.contains("rain") ||
                condition.contains("storm") ||
                condition.contains("snow") ||
                weather.getTemperature() < 5 ||
                weather.getTemperature() > 40 ||
                weather.getWindSpeed() > 25;
    }

    private boolean matchesUserPreferences(ActivityRecommendationDto activity, UserPreferences prefs) {
        // Check if user has disliked this type of activity
        if (prefs.getDislikedActivities().contains(activity.getName())) {
            return false;
        }

        // Boost priority for liked activities
        if (prefs.getLikedActivities().contains(activity.getName())) {
            activity.setPriority(activity.getPriority() + 2);
        }

        return true;
    }
}
