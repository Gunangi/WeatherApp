package com.example.weatherapp.service;

import com.example.weatherapp.model.*;
import com.example.weatherapp.repository.HealthWeatherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Slf4j
public class HealthWeatherService {

    @Autowired
    private HealthWeatherRepository healthWeatherRepository;

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private NotificationService notificationService;

    public UVIndexData getUVIndex(Location location) {
        try {
            log.info("Fetching UV Index for: {}", location.getCity());

            WeatherData weather = weatherService.getCurrentWeather(location);
            UVIndexData uvData = calculateUVIndex(weather, location);

            // Save UV data
            healthWeatherRepository.saveUVIndex(uvData);

            // Send UV alerts if necessary
            checkUVAlerts(uvData, location);

            return uvData;
        } catch (Exception e) {
            log.error("Error fetching UV Index: {}", e.getMessage());
            return null;
        }
    }

    public PollenData getPollenCount(Location location) {
        try {
            log.info("Fetching pollen count for: {}", location.getCity());

            PollenData pollenData = fetchPollenData(location);
            pollenData.setTimestamp(LocalDateTime.now());

            // Save pollen data
            healthWeatherRepository.savePollenData(pollenData);

            // Send pollen alerts
            checkPollenAlerts(pollenData, location);

            return pollenData;
        } catch (Exception e) {
            log.error("Error fetching pollen data: {}", e.getMessage());
            return null;
        }
    }

    public ClothingRecommendation getClothingRecommendation(Location location) {
        try {
            log.info("Generating clothing recommendation for: {}", location.getCity());

            WeatherData weather = weatherService.getCurrentWeather(location);
            ClothingRecommendation recommendation = generateClothingRecommendation(weather);

            return recommendation;
        } catch (Exception e) {
            log.error("Error generating clothing recommendation: {}", e.getMessage());
            return null;
        }
    }

    public List<ActivityRecommendation> getActivityRecommendations(Location location) {
        try {
            log.info("Generating activity recommendations for: {}", location.getCity());

            WeatherData weather = weatherService.getCurrentWeather(location);
            AirQualityData airQuality = weatherService.getAirQuality(location);
            UVIndexData uvIndex = getUVIndex(location);

            return generateActivityRecommendations(weather, airQuality, uvIndex);
        } catch (Exception e) {
            log.error("Error generating activity recommendations: {}", e.getMessage());
            return List.of();
        }
    }

    public HealthImpactAssessment getHealthImpact(Location location, String userHealthProfile) {
        try {
            log.info("Assessing health impact for: {}", location.getCity());

            WeatherData weather = weatherService.getCurrentWeather(location);
            AirQualityData airQuality = weatherService.getAirQuality(location);
            PollenData pollen = getPollenCount(location);
            UVIndexData uvIndex = getUVIndex(location);

            return assessHealthImpact(weather, airQuality, pollen, uvIndex, userHealthProfile);
        } catch (Exception e) {
            log.error("Error assessing health impact: {}", e.getMessage());
            return null;
        }
    }

    private UVIndexData calculateUVIndex(WeatherData weather, Location location) {
        // Simplified UV calculation based on weather conditions and location
        double baseUV = calculateBaseUV(location.getLatitude(), LocalDateTime.now());
        double cloudFactor = getCloudCoverFactor(weather.getCondition());

        int uvIndex = (int) Math.round(baseUV * cloudFactor);
        uvIndex = Math.max(0, Math.min(11, uvIndex)); // Clamp between 0-11

        return UVIndexData.builder()
                .location(location)
                .uvIndex(uvIndex)
                .riskLevel(getUVRiskLevel(uvIndex))
                .recommendations(getUVRecommendations(uvIndex))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private PollenData fetchPollenData(Location location) {
        // In real implementation, this would call a pollen API
        Map<String, Integer> pollenLevels = new HashMap<>();
        pollenLevels.put("grass", getRandomPollenLevel());
        pollenLevels.put("tree", getRandomPollenLevel());
        pollenLevels.put("weed", getRandomPollenLevel());

        int totalPollen = pollenLevels.values().stream().mapToInt(Integer::intValue).sum() / 3;

        return PollenData.builder()
                .location(location)
                .totalPollenCount(totalPollen)
                .pollenTypes(pollenLevels)
                .riskLevel(getPollenRiskLevel(totalPollen))
                .recommendations(getPollenRecommendations(totalPollen))
                .build();
    }

    private ClothingRecommendation generateClothingRecommendation(WeatherData weather) {
        List<String> recommendations = new java.util.ArrayList<>();

        // Temperature-based recommendations
        if (weather.getTemperature() < 10) {
            recommendations.add("Heavy coat or jacket");
            recommendations.add("Warm layers");
            recommendations.add("Gloves and hat");
        } else if (weather.getTemperature() < 20) {
            recommendations.add("Light jacket or sweater");
            recommendations.add("Long pants");
        } else if (weather.getTemperature() < 30) {
            recommendations.add("T-shirt or light shirt");
            recommendations.add("Light pants or shorts");
        } else {
            recommendations.add("Lightweight, breathable clothing");
            recommendations.add("Shorts and tank top");
            recommendations.add("Sun hat");
        }

        // Weather condition-based recommendations
        if (weather.getCondition().toLowerCase().contains("rain")) {
            recommendations.add("Umbrella or raincoat");
            recommendations.add("Waterproof shoes");
        }

        if (weather.getWindSpeed() > 10) {
            recommendations.add("Windbreaker");
        }

        if (weather.getHumidity() > 70) {
            recommendations.add("Moisture-wicking fabrics");
        }

        return ClothingRecommendation.builder()
                .temperature(weather.getTemperature())
                .condition(weather.getCondition())
                .recommendations(recommendations)
                .comfortLevel(calculateComfortLevel(weather))
                .build();
    }

    private List<ActivityRecommendation> generateActivityRecommendations(
            WeatherData weather, AirQualityData airQuality, UVIndexData uvIndex) {

        List<ActivityRecommendation> recommendations = new java.util.ArrayList<>();

        // Outdoor activities based on weather
        if (weather.getTemperature() >= 15 && weather.getTemperature() <= 30
                && !weather.getCondition().toLowerCase().contains("rain")
                && airQuality.getAqi() < 100) {

            recommendations.add(ActivityRecommendation.builder()
                    .activity("Walking/Jogging")
                    .suitability("Excellent")
                    .notes("Perfect weather for outdoor exercise")
                    .build());

            recommendations.add(ActivityRecommendation.builder()
                    .activity("Cycling")
                    .suitability("Good")
                    .notes("Great cycling conditions")
                    .build());
        }

        // Indoor activities for poor weather
        if (weather.getCondition().toLowerCase().contains("rain") ||
                weather.getTemperature() < 5 || weather.getTemperature() > 35) {

            recommendations.add(ActivityRecommendation.builder()
                    .activity("Indoor Gym")
                    .suitability("Excellent")
                    .notes("Weather not suitable for outdoor activities")
                    .build());

            recommendations.add(ActivityRecommendation.builder()
                    .activity("Shopping Mall")
                    .suitability("Good")
                    .notes("Comfortable indoor environment")
                    .build());
        }

        // UV-based recommendations
        if (uvIndex != null && uvIndex.getUvIndex() > 7) {
            recommendations.add(ActivityRecommendation.builder()
                    .activity("Beach/Pool (with protection)")
                    .suitability("Caution")
                    .notes("High UV - use sunscreen and seek shade")
                    .build());
        }

        return recommendations;
    }

    private HealthImpactAssessment assessHealthImpact(WeatherData weather, AirQualityData airQuality,
                                                      PollenData pollen, UVIndexData uvIndex, String healthProfile) {

        Map<String, String> impacts = new HashMap<>();
        List<String> recommendations = new java.util.ArrayList<>();

        // Air quality impact
        if (airQuality != null && airQuality.getAqi() > 100) {
            impacts.put("Respiratory", "Moderate Risk");
            recommendations.add("Limit outdoor activities if sensitive to air pollution");
        }

        // Pollen impact
        if (pollen != null && pollen.getTotalPollenCount() > 50) {
            impacts.put("Allergies", "High Risk");
            recommendations.add("Take allergy medication if needed");
            recommendations.add("Keep windows closed");
        }

        // UV impact
        if (uvIndex != null && uvIndex.getUvIndex() > 6) {
            impacts.put("Skin", "UV Risk");
            recommendations.add("Use SPF 30+ sunscreen");
            recommendations.add("Wear protective clothing");
        }

        // Temperature impact
        if (weather.getTemperature() > 30) {
            impacts.put("Heat Stress", "Moderate Risk");
            recommendations.add("Stay hydrated");
            recommendations.add("Avoid prolonged sun exposure");
        }

        return HealthImpactAssessment.builder()
                .location(weather.getLocation())
                .healthImpacts(impacts)
                .recommendations(recommendations)
                .overallRisk(calculateOverallRisk(impacts))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private void checkUVAlerts(UVIndexData uvData, Location location) {
        if (uvData.getUvIndex() >= 8) {
            notificationService.sendHealthAlert(location, "High UV Alert",
                    String.format("UV Index is %d - Very High. Use sun protection.", uvData.getUvIndex()));
        }
    }

    private void checkPollenAlerts(PollenData pollenData, Location location) {
        if (pollenData.getTotalPollenCount() > 75) {
            notificationService.sendHealthAlert(location, "High Pollen Alert",
                    "Pollen levels are very high today. Take precautions if you have allergies.");
        }
    }

    // Helper methods
    private double calculateBaseUV(double latitude, LocalDateTime dateTime) {
        // Simplified UV calculation
        return Math.max(0, 10 - Math.abs(latitude) / 9);
    }

    private double getCloudCoverFactor(String condition) {
        if (condition.toLowerCase().contains("clear")) return 1.0;
        if (condition.toLowerCase().contains("cloud")) return 0.7;
        if (condition.toLowerCase().contains("overcast")) return 0.3;
        return 0.8;
    }

    private String getUVRiskLevel(int uvIndex) {
        if (uvIndex <= 2) return "Low";
        if (uvIndex <= 5) return "Moderate";
        if (uvIndex <= 7) return "High";
        if (uvIndex <= 10) return "Very High";
        return "Extreme";
    }

    private List<String> getUVRecommendations(int uvIndex) {
        List<String> recommendations = new java.util.ArrayList<>();
        if (uvIndex >= 3) {
            recommendations.add("Use sunscreen SPF 15+");
        }
        if (uvIndex >= 6) {
            recommendations.add("Seek shade during midday");
            recommendations.add("Wear protective clothing");
        }
        if (uvIndex >= 8) {
            recommendations.add("Avoid outdoor activities 10am-4pm");
            recommendations.add("Use SPF 30+ sunscreen");
        }
        return recommendations;
    }

    private int getRandomPollenLevel() {
        return (int) (Math.random() * 100);
    }

    private String getPollenRiskLevel(int totalPollen) {
        if (totalPollen < 25) return "Low";
        if (totalPollen < 50) return "Moderate";
        if (totalPollen < 75) return "High";
        return "Very High";
    }

    private List<String> getPollenRecommendations(int totalPollen) {
        List<String> recommendations = new java.util.ArrayList<>();
        if (totalPollen > 50) {
            recommendations.add("Keep windows closed");
            recommendations.add("Consider allergy medication");
            recommendations.add("Limit outdoor activities");
        }
        return recommendations;
    }

    private String calculateComfortLevel(WeatherData weather) {
        int score = 50; // Base comfort score

        // Temperature comfort
        if (weather.getTemperature() >= 18 && weather.getTemperature() <= 24) {
            score += 20;
        } else if (weather.getTemperature() >= 15 && weather.getTemperature() <= 28) {
            score += 10;
        } else {
            score -= 20;
        }

        // Humidity comfort
        if (weather.getHumidity() >= 40 && weather.getHumidity() <= 60) {
            score += 15;
        } else if (weather.getHumidity() >= 30 && weather.getHumidity() <= 70) {
            score += 5;
        } else {
            score -= 15;
        }

        // Wind comfort
        if (weather.getWindSpeed() <= 5) {
            score += 10;
        } else if (weather.getWindSpeed() > 15) {
            score -= 15;
        }

        if (score >= 80) return "Very Comfortable";
        if (score >= 60) return "Comfortable";
        if (score >= 40) return "Moderate";
        if (score >= 20) return "Uncomfortable";
        return "Very Uncomfortable";
    }

    private String calculateOverallRisk(Map<String, String> impacts) {
        long highRiskCount = impacts.values().stream()
                .filter(risk -> risk.contains("High") || risk.contains("Very"))
                .count();

        if (highRiskCount >= 2) return "High";
        if (highRiskCount == 1) return "Moderate";
        return "Low";
    }
}