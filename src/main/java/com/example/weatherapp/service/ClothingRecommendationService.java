package com.example.weatherapp.service;

import com.example.weatherapp.dto.ClothingRecommendationDto;
import com.example.weatherapp.dto.WeatherDataDto;
import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClothingRecommendationService {

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    public ClothingRecommendationDto getClothingRecommendation(String userId, WeatherDataDto weather) {
        UserPreferences prefs = userPreferencesRepository.findByUserId(userId)
                .orElse(new UserPreferences());

        ClothingRecommendationDto recommendation = new ClothingRecommendationDto();

        double temp = weather.getTemperature();
        double feelsLike = weather.getFeelsLike();
        String condition = weather.getWeatherCondition().toLowerCase();
        double windSpeed = weather.getWindSpeed();
        double humidity = weather.getHumidity();
        boolean isRaining = condition.contains("rain") || condition.contains("drizzle");
        boolean isSnowing = condition.contains("snow");

        // Base clothing recommendations
        List<String> clothing = new ArrayList<>();
        List<String> accessories = new ArrayList<>();
        String overallSuggestion = "";
        String colorSuggestion = "";

        // Temperature-based recommendations
        if (feelsLike <= 0) {
            clothing.addAll(Arrays.asList("Heavy winter coat", "Thermal underwear", "Wool sweater", "Thick pants", "Winter boots", "Warm socks"));
            accessories.addAll(Arrays.asList("Winter hat", "Insulated gloves", "Scarf"));
            overallSuggestion = "Dress very warmly in layers. It's freezing outside!";
            colorSuggestion = "Dark colors absorb heat better - consider black, navy, or dark brown";
        } else if (feelsLike <= 10) {
            clothing.addAll(Arrays.asList("Warm jacket", "Long-sleeve shirt", "Jeans or warm pants", "Closed shoes", "Warm socks"));
            accessories.addAll(Arrays.asList("Light gloves", "Beanie or cap"));
            overallSuggestion = "Layer up with warm clothing. A jacket is essential.";
            colorSuggestion = "Medium to dark colors work well in cool weather";
        } else if (feelsLike <= 20) {
            clothing.addAll(Arrays.asList("Light jacket or cardigan", "Long-sleeve shirt or light sweater", "Jeans or pants", "Comfortable shoes"));
            overallSuggestion = "Mild weather - a light layer should be sufficient.";
            colorSuggestion = "Any colors work well, but earth tones are classic for this weather";
        } else if (feelsLike <= 25) {
            clothing.addAll(Arrays.asList("T-shirt or light blouse", "Light pants or skirt", "Comfortable shoes"));
            overallSuggestion = "Pleasant weather! Light, comfortable clothing is perfect.";
            colorSuggestion = "Bright colors like pastels or vibrant hues complement nice weather";
        } else if (feelsLike <= 30) {
            clothing.addAll(Arrays.asList("Light t-shirt", "Shorts or light pants", "Breathable shoes or sandals"));
            overallSuggestion = "Warm weather - keep it light and breathable.";
            colorSuggestion = "Light colors like white, beige, or pale blue help reflect heat";
        } else if (feelsLike <= 35) {
            clothing.addAll(Arrays.asList("Minimal lightweight clothing", "Shorts", "Tank top or light t-shirt", "Sandals", "Breathable fabrics"));
            accessories.addAll(Arrays.asList("Sunhat", "Sunglasses"));
            overallSuggestion = "Hot weather - stay cool with minimal, breathable clothing.";
            colorSuggestion = "Stick to very light colors - white, cream, or light pastels";
        } else {
            clothing.addAll(Arrays.asList("Very light, loose clothing", "Shorts", "Sleeveless top", "Open sandals"));
            accessories.addAll(Arrays.asList("Wide-brimmed hat", "Sunglasses", "Portable fan"));
            overallSuggestion = "Extremely hot! Minimize clothing and stay hydrated.";
            colorSuggestion = "Only the lightest colors - white and very pale shades";
        }

        // Weather condition modifications
        if (isRaining) {
            accessories.addAll(Arrays.asList("Umbrella", "Waterproof jacket or rain coat"));
            clothing.add("Waterproof shoes or boots");
            overallSuggestion += " Don't forget rain protection!";
        }

        if (isSnowing) {
            accessories.addAll(Arrays.asList("Waterproof gloves", "Snow boots", "Weather-resistant outerwear"));
            overallSuggestion += " Snow-appropriate gear is essential.";
        }

        if (windSpeed > 15) {
            accessories.add("Wind-resistant jacket");
            overallSuggestion += " It's windy - secure loose clothing and accessories.";
        }

        if (humidity > 80 && temp > 25) {
            clothing.removeIf(item -> item.contains("heavy") || item.contains("thick"));
            clothing.add("Moisture-wicking fabrics");
            overallSuggestion += " High humidity - choose breathable, moisture-wicking materials.";
        }

        // Time-based adjustments
        LocalTime currentTime = LocalTime.now();
        if (currentTime.isBefore(LocalTime.of(6, 0)) || currentTime.isAfter(LocalTime.of(22, 0))) {
            clothing.add("Extra layer for nighttime coolness");
        }

        // UV protection for sunny days
        if (condition.contains("clear") || condition.contains("sunny")) {
            accessories.addAll(Arrays.asList("Sunscreen", "Sunglasses"));
            if (temp > 25) {
                accessories.add("Sun hat");
            }
        }

        // Build the recommendation
        recommendation.setClothingItems(clothing.stream().distinct().collect(Collectors.toList()));
        recommendation.setAccessories(accessories.stream().distinct().collect(Collectors.toList()));
        recommendation.setOverallSuggestion(overallSuggestion);
        recommendation.setColorSuggestion(colorSuggestion);
        recommendation.setComfortLevel(calculateComfortLevel(weather));
        recommendation.setLayeringAdvice(getLayeringAdvice(feelsLike, condition));
        recommendation.setFabricSuggestions(getFabricSuggestions(weather));

        return recommendation;
    }

    public ClothingRecommendationDto getWorkClothingRecommendation(String userId, WeatherDataDto weather) {
        ClothingRecommendationDto baseRecommendation = getClothingRecommendation(userId, weather);

        // Modify for professional/work environment
        List<String> workClothing = new ArrayList<>();
        double temp = weather.getFeelsLike();

        if (temp <= 10) {
            workClothing.addAll(Arrays.asList("Business coat", "Dress shirt", "Suit or dress pants", "Professional shoes", "Tie or scarf"));
        } else if (temp <= 20) {
            workClothing.addAll(Arrays.asList("Blazer or cardigan", "Dress shirt or blouse", "Trousers or skirt", "Professional shoes"));
        } else if (temp <= 30) {
            workClothing.addAll(Arrays.asList("Light dress shirt or blouse", "Trousers or professional skirt", "Professional shoes"));
        } else {
            workClothing.addAll(Arrays.asList("Lightweight professional attire", "Breathable dress shirt", "Light trousers", "Comfortable professional shoes"));
        }

        baseRecommendation.setClothingItems(workClothing);
        baseRecommendation.setOverallSuggestion("Professional attire suitable for the weather. " + baseRecommendation.getOverallSuggestion());

        return baseRecommendation;
    }

    public ClothingRecommendationDto getOutdoorActivityClothing(String userId, WeatherDataDto weather, String activityType) {
        ClothingRecommendationDto baseRecommendation = getClothingRecommendation(userId, weather);

        List<String> activityClothing = new ArrayList<>(baseRecommendation.getClothingItems());
        List<String> activityAccessories = new ArrayList<>(baseRecommendation.getAccessories());

        switch (activityType.toLowerCase()) {
            case "running":
            case "jogging":
                activityClothing.addAll(Arrays.asList("Moisture-wicking shirt", "Running shorts or leggings", "Running shoes", "Athletic socks"));
                activityAccessories.addAll(Arrays.asList("Fitness tracker", "Water bottle"));
                break;

            case "hiking":
                activityClothing.addAll(Arrays.asList("Hiking boots", "Moisture-wicking layers", "Hiking pants", "Quick-dry shirt"));
                activityAccessories.addAll(Arrays.asList("Backpack", "Hiking poles", "First aid kit"));
                break;

            case "cycling":
                activityClothing.addAll(Arrays.asList("Cycling shorts", "Breathable jersey", "Cycling shoes", "Padded shorts"));
                activityAccessories.addAll(Arrays.asList("Helmet", "Cycling gloves", "Reflective gear"));
                break;

            case "swimming":
                activityClothing.addAll(Arrays.asList("Swimwear", "Quick-dry towel", "Flip-flops"));
                activityAccessories.addAll(Arrays.asList("Swim goggles", "Waterproof sunscreen"));
                break;
        }

        baseRecommendation.setClothingItems(activityClothing.stream().distinct().collect(Collectors.toList()));
        baseRecommendation.setAccessories(activityAccessories.stream().distinct().collect(Collectors.toList()));

        return baseRecommendation;
    }

    private String calculateComfortLevel(WeatherDataDto weather) {
        double temp = weather.getFeelsLike();
        double humidity = weather.getHumidity();
        String condition = weather.getWeatherCondition().toLowerCase();

        if (temp >= 18 && temp <= 26 && humidity < 70 && !condition.contains("rain")) {
            return "Very Comfortable";
        } else if (temp >= 15 && temp <= 30 && humidity < 80) {
            return "Comfortable";
        } else if (temp >= 10 && temp <= 35) {
            return "Moderately Comfortable";
        } else {
            return "Challenging Conditions";
        }
    }

    private String getLayeringAdvice(double feelsLike, String condition) {
        if (feelsLike <= 10) {
            return "Use multiple layers - base layer, insulating layer, and outer shell. Easy to adjust as needed.";
        } else if (feelsLike <= 20) {
            return "Light layering recommended - a base layer with a removable outer layer.";
        } else if (feelsLike <= 30) {
            return "Minimal layering - perhaps just a light outer layer you can remove.";
        } else {
            return "Avoid layering - single lightweight pieces work best.";
        }
    }

    private List<String> getFabricSuggestions(WeatherDataDto weather) {
        List<String> fabrics = new ArrayList<>();
        double temp = weather.getFeelsLike();
        double humidity = weather.getHumidity();

        if (temp <= 10) {
            fabrics.addAll(Arrays.asList("Wool", "Fleece", "Down insulation", "Thermal materials"));
        } else if (temp <= 20) {
            fabrics.addAll(Arrays.asList("Cotton blends", "Light wool", "Denim", "Canvas"));
        } else if (temp <= 30) {
            fabrics.addAll(Arrays.asList("Cotton", "Linen blends", "Lightweight synthetics"));
        } else {
            fabrics.addAll(Arrays.asList("Linen", "Bamboo", "Moisture-wicking synthetics", "Breathable cotton"));
        }

        if (humidity > 70) {
            fabrics.add("Moisture-wicking materials");
            fabrics.add("Quick-dry fabrics");
        }

        return fabrics;
    }

    public Map<String, Object> getDetailedClothingAnalysis(String userId, WeatherDataDto weather) {
        ClothingRecommendationDto recommendation = getClothingRecommendation(userId, weather);

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("recommendation", recommendation);
        analysis.put("weatherSuitability", calculateWeatherSuitability(weather));
        analysis.put("comfortIndex", calculateComfortIndex(weather));
        analysis.put("uvProtectionNeeded", isUVProtectionNeeded(weather));
        analysis.put("thermalRegulation", getThermalRegulationAdvice(weather));

        return analysis;
    }

    private Map<String, Object> calculateWeatherSuitability(WeatherDataDto weather) {
        Map<String, Object> suitability = new HashMap<>();
        double temp = weather.getFeelsLike();

        suitability.put("outdoorActivities", temp >= 15 && temp <= 30);
        suitability.put("lightClothing", temp > 25);
        suitability.put("layeringNeeded", temp < 20);
        suitability.put("waterproofNeeded", weather.getWeatherCondition().toLowerCase().contains("rain"));

        return suitability;
    }

    private int calculateComfortIndex(WeatherDataDto weather) {
        double temp = weather.getFeelsLike();
        double humidity = weather.getHumidity();

        if (temp >= 20 && temp <= 26 && humidity < 60) return 10;
        if (temp >= 18 && temp <= 28 && humidity < 70) return 8;
        if (temp >= 15 && temp <= 30 && humidity < 80) return 6;
        if (temp >= 10 && temp <= 35) return 4;
        return 2;
    }

    private boolean isUVProtectionNeeded(WeatherDataDto weather) {
        String condition = weather.getWeatherCondition().toLowerCase();
        return condition.contains("clear") || condition.contains("sunny") || weather.getTemperature() > 25;
    }

    private String getThermalRegulationAdvice(WeatherDataDto weather) {
        double temp = weather.getFeelsLike();

        if (temp <= 5) return "Focus on heat retention - multiple insulating layers essential";
        if (temp <= 15) return "Moderate insulation needed - removable layers recommended";
        if (temp <= 25) return "Balanced approach - light layers for easy adjustment";
        if (temp <= 30) return "Heat dissipation priority - breathable, loose-fitting clothes";
        return "Maximum cooling needed - minimal, ultra-light clothing only";
    }
}