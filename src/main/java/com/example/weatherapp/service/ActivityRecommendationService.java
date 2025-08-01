package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.dto.AirQualityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
public class ActivityRecommendationService {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private AirQualityService airQualityService;

    // Activity categories
    public enum ActivityCategory {
        OUTDOOR_SPORTS, INDOOR_SPORTS, RECREATIONAL, CULTURAL, SHOPPING, DINING, WELLNESS, ADVENTURE
    }

    // Weather condition mappings
    private static final Map<String, List<String>> WEATHER_CONDITIONS = Map.of(
            "clear", Arrays.asList("clear sky", "sunny", "clear"),
            "cloudy", Arrays.asList("few clouds", "scattered clouds", "broken clouds", "overcast clouds"),
            "rain", Arrays.asList("light rain", "moderate rain", "heavy rain", "shower rain", "thunderstorm"),
            "snow", Arrays.asList("light snow", "snow", "heavy snow", "sleet"),
            "fog", Arrays.asList("mist", "fog", "haze"),
            "storm", Arrays.asList("thunderstorm", "severe thunderstorm")
    );

    /**
     * Get activity recommendations based on current weather
     */
    public Map<String, Object> getActivityRecommendations(String cityName) {
        WeatherResponse weather = weatherService.getCurrentWeather(cityName);
        AirQualityResponse airQuality = null;

        try {
            airQuality = airQualityService.getAirQualityData(cityName);
        } catch (Exception e) {
            // Air quality data is optional
            System.out.println("Air quality data not available for " + cityName);
        }

        return generateRecommendations(weather, airQuality);
    }

    /**
     * Generate comprehensive activity recommendations
     */
    private Map<String, Object> generateRecommendations(WeatherResponse weather, AirQualityResponse airQuality) {
        Map<String, Object> recommendations = new HashMap<>();

        // Categorize activities
        recommendations.put("outdoor", getOutdoorActivities(weather, airQuality));
        recommendations.put("indoor", getIndoorActivities(weather));
        recommendations.put("sports", getSportsRecommendations(weather, airQuality));
        recommendations.put("recreational", getRecreationalActivities(weather));
        recommendations.put("wellness", getWellnessActivities(weather, airQuality));
        recommendations.put("timeSpecific", getTimeSpecificRecommendations(weather));

        // Overall recommendation score (1-10)
        recommendations.put("overallScore", calculateOverallScore(weather, airQuality));
        recommendations.put("primaryRecommendation", getPrimaryRecommendation(weather, airQuality));
        recommendations.put("weatherSummary", generateWeatherSummary(weather));
        recommendations.put("alerts", generateAlerts(weather, airQuality));

        return recommendations;
    }

    /**
     * Get outdoor activity recommendations
     */
    private List<Map<String, Object>> getOutdoorActivities(WeatherResponse weather, AirQualityResponse airQuality) {
        List<Map<String, Object>> activities = new ArrayList<>();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Clear weather activities
        if ("clear".equals(condition) && weather.getTemperature() >= 15 && weather.getTemperature() <= 30) {
            activities.add(createActivity("Hiking", "Perfect weather for outdoor trails", 9, "🥾"));
            activities.add(createActivity("Cycling", "Great conditions for bike rides", 9, "🚴"));
            activities.add(createActivity("Picnic", "Ideal for outdoor dining", 8, "🧺"));
            activities.add(createActivity("Photography", "Excellent lighting conditions", 8, "📸"));
        }

        // Cloudy but mild weather
        if ("cloudy".equals(condition) && weather.getTemperature() >= 10 && weather.getTemperature() <= 25) {
            activities.add(createActivity("Walking", "Comfortable temperature for strolls", 8, "🚶"));
            activities.add(createActivity("Gardening", "Overcast conditions are perfect", 7, "🌱"));
            activities.add(createActivity("Outdoor Markets", "Pleasant weather for browsing", 7, "🛒"));
        }

        // Light rain activities
        if ("rain".equals(condition) && weather.getWindSpeed() < 5) {
            activities.add(createActivity("Covered Outdoor Dining", "Cozy atmosphere with rain sounds", 6, "☂️"));
            activities.add(createActivity("Mall Walking", "Indoor-outdoor hybrid activity", 6, "🏬"));
        }

        // Hot weather activities
        if (weather.getTemperature() > 30) {
            activities.add(createActivity("Swimming", "Cool off in the water", 9, "🏊"));
            activities.add(createActivity("Water Sports", "Beat the heat with water activities", 8, "🏄"));
            activities.add(createActivity("Early Morning Walks", "Avoid peak heat hours", 7, "🌅"));
        }

        // Cold weather activities
        if (weather.getTemperature() < 10) {
            activities.add(createActivity("Ice Skating", "Perfect cold weather activity", 8, "⛸️"));
            activities.add(createActivity("Winter Sports", "Embrace the cold weather", 7, "⛷️"));
            activities.add(createActivity("Hot Chocolate Walks", "Warm drinks in cool air", 6, "☕"));
        }

        // Filter based on air quality
        if (airQuality != null && airQuality.getAqi() > 150) {
            activities = activities.stream()
                    .peek(activity -> activity.put("score", ((Integer) activity.get("score")) - 2))
                    .filter(activity -> ((Integer) activity.get("score")) > 3)
                    .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
        }

        return activities;
    }

    /**
     * Get indoor activity recommendations
     */
    private List<Map<String, Object>> getIndoorActivities(WeatherResponse weather) {
        List<Map<String, Object>> activities = new ArrayList<>();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Bad weather indoor activities
        if ("rain".equals(condition) || "storm".equals(condition) || weather.getWindSpeed() > 10) {
            activities.add(createActivity("Museums", "Perfect weather for cultural exploration", 9, "🏛️"));
            activities.add(createActivity("Movie Theaters", "Cozy indoor entertainment", 8, "🎬"));
            activities.add(createActivity("Shopping Malls", "Climate-controlled comfort", 8, "🛍️"));
            activities.add(createActivity("Indoor Gaming", "Enjoy video games or board games", 7, "🎮"));
            activities.add(createActivity("Cooking", "Try new recipes at home", 7, "👨‍🍳"));
            activities.add(createActivity("Reading", "Perfect day for books", 7, "📚"));
        }

        // Hot weather indoor activities
        if (weather.getTemperature() > 32) {
            activities.add(createActivity("Air-Conditioned Cafes", "Cool and comfortable", 8, "❄️"));
            activities.add(createActivity("Indoor Pools", "Swimming without sun exposure", 8, "🏊‍♀️"));
            activities.add(createActivity("Ice Skating Rinks", "Beat the heat on ice", 7, "⛸️"));
        }

        // Cold weather indoor activities
        if (weather.getTemperature() < 5) {
            activities.add(createActivity("Cozy Cafes", "Warm up with hot beverages", 9, "☕"));
            activities.add(createActivity("Indoor Markets", "Stay warm while shopping", 8, "🏪"));
            activities.add(createActivity("Spa Activities", "Relaxing indoor wellness", 8, "🧘"));
        }

        // General indoor activities
        activities.add(createActivity("Gyms and Fitness", "Weather-independent exercise", 7, "💪"));
        activities.add(createActivity("Art Galleries", "Cultural indoor experience", 7, "🎨"));
        activities.add(createActivity("Libraries", "Quiet indoor activities", 6, "📖"));

        return activities;
    }

    /**
     * Get sports recommendations
     */
    private List<Map<String, Object>> getSportsRecommendations(WeatherResponse weather, AirQualityResponse airQuality) {
        List<Map<String, Object>> activities = new ArrayList<>();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Outdoor sports
        if ("clear".equals(condition) && weather.getTemperature() >= 10 && weather.getTemperature() <= 30 && weather.getWindSpeed() < 8) {
            activities.add(createActivity("Tennis", "Perfect conditions for outdoor tennis", 9, "🎾"));
            activities.add(createActivity("Football/Soccer", "Great weather for team sports", 9, "⚽"));
            activities.add(createActivity("Basketball", "Ideal outdoor court conditions", 8, "🏀"));
            activities.add(createActivity("Running", "Excellent running weather", 8, "🏃"));
            activities.add(createActivity("Golf", "Perfect golfing conditions", 8, "⛳"));
        }

        // Windy conditions
        if (weather.getWindSpeed() > 8 && weather.getWindSpeed() < 15) {
            activities.add(createActivity("Kite Flying", "Great wind conditions", 8, "🪁"));
            activities.add(createActivity("Sailing", "Good wind for water sports", 7, "⛵"));
            activities.add(createActivity("Windsurfing", "Perfect wind conditions", 8, "🏄‍♂️"));
        }

        // Indoor sports for bad weather
        if ("rain".equals(condition) || "storm".equals(condition) || weather.getTemperature() < 5 || weather.getTemperature() > 35) {
            activities.add(createActivity("Indoor Rock Climbing", "Weather-independent adventure", 8, "🧗"));
            activities.add(createActivity("Bowling", "Classic indoor sport", 7, "🎳"));
            activities.add(createActivity("Indoor Swimming", "Year-round water sport", 8, "🏊"));
            activities.add(createActivity("Gym Workouts", "Controlled environment exercise", 7, "🏋️"));
        }

        // Air quality considerations
        if (airQuality != null && airQuality.getAqi() > 100) {
            activities.removeIf(activity ->
                    activity.get("name").toString().contains("Running") ||
                            activity.get("name").toString().contains("Cycling")
            );
        }

        return activities;
    }

    /**
     * Get recreational activities
     */
    private List<Map<String, Object>> getRecreationalActivities(WeatherResponse weather) {
        List<Map<String, Object>> activities = new ArrayList<>();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Pleasant weather recreational activities
        if (weather.getTemperature() >= 15 && weather.getTemperature() <= 28 && !condition.equals("rain")) {
            activities.add(createActivity("Outdoor Concerts", "Perfect weather for live music", 9, "🎵"));
            activities.add(createActivity("Farmers Markets", "Great for outdoor browsing", 8, "🥕"));
            activities.add(createActivity("Street Food Tours", "Comfortable weather for walking tours", 8, "🍜"));
            activities.add(createActivity("Outdoor Art Fairs", "Pleasant conditions for cultural events", 7, "🎨"));
        }

        // Cozy weather activities
        if ("cloudy".equals(condition) || "rain".equals(condition)) {
            activities.add(createActivity("Board Game Cafes", "Perfect atmosphere for games", 8, "🎲"));
            activities.add(createActivity("Book Clubs", "Cozy weather for reading discussions", 7, "📚"));
            activities.add(createActivity("Craft Workshops", "Indoor creative activities", 7, "✂️"));
        }

        // Evening activities based on weather
        activities.add(createActivity("Night Markets", "Weather-dependent evening fun",
                getEveningActivityScore(weather), "🌃"));
        activities.add(createActivity("Stargazing", "Clear sky dependent activity",
                "clear".equals(condition) ? 9 : 3, "⭐"));

        return activities;
    }

    /**
     * Get wellness activities
     */
    private List<Map<String, Object>> getWellnessActivities(WeatherResponse weather, AirQualityResponse airQuality) {
        List<Map<String, Object>> activities = new ArrayList<>();

        // Outdoor wellness
        if (weather.getTemperature() >= 15 && weather.getTemperature() <= 25 &&
                (airQuality == null || airQuality.getAqi() < 100)) {
            activities.add(createActivity("Outdoor Yoga", "Perfect conditions for outdoor practice", 9, "🧘‍♀️"));
            activities.add(createActivity("Nature Meditation", "Peaceful outdoor mindfulness", 8, "🌿"));
            activities.add(createActivity("Beach Walks", "Relaxing coastal activities", 8, "🏖️"));
        }

        // Indoor wellness
        activities.add(createActivity("Spa Treatments", "Weather-independent relaxation", 8, "💆"));
        activities.add(createActivity("Hot Yoga", "Warm indoor practice",
                weather.getTemperature() < 15 ? 9 : 6, "🔥"));
        activities.add(createActivity("Massage Therapy", "Perfect for any weather", 7, "💆‍♂️"));

        // Weather-specific wellness
        if (weather.getHumidity() > 70) {
            activities.add(createActivity("Sauna", "Complement high humidity with dry heat", 6, "🏠"));
        }

        return activities;
    }

    /**
     * Get time-specific recommendations
     */
    private Map<String, List<Map<String, Object>>> getTimeSpecificRecommendations(WeatherResponse weather) {
        Map<String, List<Map<String, Object>>> timeRecommendations = new HashMap<>();

        // Morning activities
        List<Map<String, Object>> morningActivities = new ArrayList<>();
        if (weather.getTemperature() >= 10) {
            morningActivities.add(createActivity("Morning Jog", "Cool morning temperatures", 8, "🏃‍♀️"));
            morningActivities.add(createActivity("Breakfast Outdoor", "Pleasant morning weather", 7, "🥐"));
        }

        // Afternoon activities
        List<Map<String, Object>> afternoonActivities = new ArrayList<>();
        if (weather.getTemperature() <= 30) {
            afternoonActivities.add(createActivity("Lunch Picnic", "Good afternoon weather", 7, "🥪"));
            afternoonActivities.add(createActivity("Afternoon Sports", "Active afternoon options", 8, "⚽"));
        }

        // Evening activities
        List<Map<String, Object>> eveningActivities = new ArrayList<>();
        eveningActivities.add(createActivity("Evening Stroll", "Relaxing end-of-day activity",
                getEveningActivityScore(weather), "🚶‍♀️"));
        eveningActivities.add(createActivity("Outdoor Dining", "Weather-dependent evening meals",
                getEveningActivityScore(weather), "🍽️"));

        timeRecommendations.put("morning", morningActivities);
        timeRecommendations.put("afternoon", afternoonActivities);
        timeRecommendations.put("evening", eveningActivities);

        return timeRecommendations;
    }

    /**
     * Helper methods
     */
    private Map<String, Object> createActivity(String name, String description, int score, String emoji) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("name", name);
        activity.put("description", description);
        activity.put("score", score);
        activity.put("emoji", emoji);
        return activity;
    }

    private String categorizeWeatherCondition(String description) {
        String lowerDesc = description.toLowerCase();

        for (Map.Entry<String, List<String>> entry : WEATHER_CONDITIONS.entrySet()) {
            for (String condition : entry.getValue()) {
                if (lowerDesc.contains(condition)) {
                    return entry.getKey();
                }
            }
        }
        return "unknown";
    }

    private int calculateOverallScore(WeatherResponse weather, AirQualityResponse airQuality) {
        int score = 5; // Base score

        // Temperature scoring
        if (weather.getTemperature() >= 18 && weather.getTemperature() <= 26) {
            score += 3;
        } else if (weather.getTemperature() >= 10 && weather.getTemperature() <= 32) {
            score += 1;
        } else {
            score -= 1;
        }

        // Weather condition scoring
        String condition = categorizeWeatherCondition(weather.getDescription());
        switch (condition) {
            case "clear": score += 2; break;
            case "cloudy": score += 1; break;
            case "rain": score -= 2; break;
            case "storm": score -= 3; break;
        }

        // Wind scoring
        if (weather.getWindSpeed() < 5) {
            score += 1;
        } else if (weather.getWindSpeed() > 10) {
            score -= 1;
        }

        // Air quality scoring
        if (airQuality != null) {
            if (airQuality.getAqi() <= 50) score += 1;
            else if (airQuality.getAqi() > 150) score -= 2;
        }

        return Math.max(1, Math.min(10, score));
    }

    private String getPrimaryRecommendation(WeatherResponse weather, AirQualityResponse airQuality) {
        int score = calculateOverallScore(weather, airQuality);
        String condition = categorizeWeatherCondition(weather.getDescription());

        if (score >= 8) {
            return "Excellent weather for outdoor activities! Perfect day to spend time outside.";
        } else if (score >= 6) {
            return "Good weather conditions. Most outdoor activities are suitable with proper preparation.";
        } else if (score >= 4) {
            return "Mixed weather conditions. Consider indoor activities or wait for better weather.";
        } else {
            return "Poor weather conditions. Indoor activities are recommended for today.";
        }
    }

    private String generateWeatherSummary(WeatherResponse weather) {
        StringBuilder summary = new StringBuilder();
        summary.append(String.format("Current temperature: %.1f°C (feels like %.1f°C). ",
                weather.getTemperature(), weather.getFeelsLike()));
        summary.append(String.format("Weather: %s. ", weather.getDescription()));
        summary.append(String.format("Humidity: %.0f%%, Wind: %.1f m/s. ",
                weather.getHumidity(), weather.getWindSpeed()));

        return summary.toString();
    }

    private List<String> generateAlerts(WeatherResponse weather, AirQualityResponse airQuality) {
        List<String> alerts = new ArrayList<>();

        // Temperature alerts
        if (weather.getTemperature() > 35) {
            alerts.add("🌡️ Extreme heat warning! Stay hydrated and avoid prolonged sun exposure.");
        } else if (weather.getTemperature() < 0) {
            alerts.add("🥶 Freezing temperatures! Dress warmly and be cautious of icy conditions.");
        }

        // Wind alerts
        if (weather.getWindSpeed() > 15) {
            alerts.add("💨 High wind speeds! Avoid outdoor activities and secure loose objects.");
        }

        // Weather condition alerts
        String condition = categorizeWeatherCondition(weather.getDescription());
        if ("storm".equals(condition)) {
            alerts.add("⛈️ Thunderstorm warning! Stay indoors and avoid outdoor activities.");
        } else if ("rain".equals(condition) && weather.getWindSpeed() > 8) {
            alerts.add("🌧️ Heavy rain and wind! Drive carefully and avoid outdoor activities.");
        }

        // Air quality alerts
        if (airQuality != null) {
            if (airQuality.getAqi() > 200) {
                alerts.add("🚨 Very unhealthy air quality! Avoid all outdoor activities.");
            } else if (airQuality.getAqi() > 150) {
                alerts.add("⚠️ Unhealthy air quality! Limit outdoor exposure, especially exercise.");
            } else if (airQuality.getAqi() > 100) {
                alerts.add("⚡ Moderate air quality concern! Sensitive individuals should limit outdoor activities.");
            }
        }

        // UV and sun alerts
        if (weather.getTemperature() > 25 && categorizeWeatherCondition(weather.getDescription()).equals("clear")) {
            alerts.add("☀️ High UV exposure likely! Use sunscreen and wear protective clothing.");
        }

        return alerts;
    }

    private int getEveningActivityScore(WeatherResponse weather) {
        if (weather.getTemperature() >= 15 && weather.getTemperature() <= 25 &&
                !categorizeWeatherCondition(weather.getDescription()).equals("rain")) {
            return 8;
        } else if (weather.getTemperature() >= 10 && weather.getTemperature() <= 30) {
            return 6;
        } else {
            return 4;
        }
    }

    /**
     * Get activity recommendations for specific activity type
     */
    public List<Map<String, Object>> getActivityRecommendationsByType(String cityName, ActivityCategory category) {
        WeatherResponse weather = weatherService.getCurrentWeather(cityName);
        AirQualityResponse airQuality = null;

        try {
            airQuality = airQualityService.getAirQualityData(cityName);
        } catch (Exception e) {
            System.out.println("Air quality data not available for " + cityName);
        }

        switch (category) {
            case OUTDOOR_SPORTS:
                return getOutdoorActivities(weather, airQuality).stream()
                        .filter(activity -> activity.get("name").toString().contains("Sports") ||
                                activity.get("name").toString().contains("Running") ||
                                activity.get("name").toString().contains("Cycling"))
                        .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
            case INDOOR_SPORTS:
                return getSportsRecommendations(weather, airQuality).stream()
                        .filter(activity -> activity.get("name").toString().contains("Indoor"))
                        .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
            case RECREATIONAL:
                return getRecreationalActivities(weather);
            case WELLNESS:
                return getWellnessActivities(weather, airQuality);
            default:
                return new ArrayList<>();
        }
    }
}