package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.dto.AirQualityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
public class ClothingRecommendationService {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private AirQualityService airQualityService;

    // Clothing categories
    public enum ClothingCategory {
        TOPS, BOTTOMS, OUTERWEAR, FOOTWEAR, ACCESSORIES, SPECIAL_GEAR
    }

    // Temperature ranges
    private static final double VERY_COLD = 0;
    private static final double COLD = 10;
    private static final double COOL = 15;
    private static final double MILD = 20;
    private static final double WARM = 25;
    private static final double HOT = 30;
    private static final double VERY_HOT = 35;

    /**
     * Get comprehensive clothing recommendations
     */
    public Map<String, Object> getClothingRecommendations(String cityName) {
        WeatherResponse weather = weatherService.getCurrentWeather(cityName);
        AirQualityResponse airQuality = null;

        try {
            airQuality = airQualityService.getAirQualityData(cityName);
        } catch (Exception e) {
            System.out.println("Air quality data not available for " + cityName);
        }

        return generateClothingRecommendations(weather, airQuality);
    }

    /**
     * Generate detailed clothing recommendations
     */
    private Map<String, Object> generateClothingRecommendations(WeatherResponse weather, AirQualityResponse airQuality) {
        Map<String, Object> recommendations = new HashMap<>();

        // Basic clothing categories
        recommendations.put("tops", getTopRecommendations(weather));
        recommendations.put("bottoms", getBottomRecommendations(weather));
        recommendations.put("outerwear", getOuterwearRecommendations(weather));
        recommendations.put("footwear", getFootwearRecommendations(weather));
        recommendations.put("accessories", getAccessoryRecommendations(weather, airQuality));
        recommendations.put("specialGear", getSpecialGearRecommendations(weather, airQuality));

        // Layering suggestions
        recommendations.put("layering", getLayeringStrategy(weather));

        // Complete outfit suggestions
        recommendations.put("completeOutfits", getCompleteOutfitSuggestions(weather));

        // Activity-specific recommendations
        recommendations.put("workOutfit", getWorkOutfitRecommendations(weather));
        recommendations.put("casualOutfit", getCasualOutfitRecommendations(weather));
        recommendations.put("exerciseGear", getExerciseGearRecommendations(weather, airQuality));

        // Weather-specific tips
        recommendations.put("weatherTips", getWeatherSpecificTips(weather, airQuality));
        recommendations.put("comfortLevel", calculateComfortLevel(weather));
        recommendations.put("summary", generateClothingSummary(weather));

        return recommendations;
    }

    /**
     * Get top clothing recommendations
     */
    private List<Map<String, Object>> getTopRecommendations(WeatherResponse weather) {
        List<Map<String, Object>> tops = new ArrayList<>();
        double temp = weather.getTemperature();
        double feelsLike = weather.getFeelsLike();

        if (temp >= VERY_HOT) {
            tops.add(createClothingItem("Tank Top", "Lightweight, breathable fabric", 9, "👕"));
            tops.add(createClothingItem("Light Cotton T-Shirt", "Loose-fitting, light colors", 8, "👔"));
            tops.add(createClothingItem("Linen Shirt", "Natural, breathable material", 8, "👗"));
        } else if (temp >= HOT) {
            tops.add(createClothingItem("Short-Sleeve Shirt", "Comfortable and cool", 9, "👕"));
            tops.add(createClothingItem("Cotton T-Shirt", "Breathable cotton fabric", 8, "👔"));
            tops.add(createClothingItem("Polo Shirt", "Smart-casual option", 7, "👔"));
        } else if (temp >= WARM) {
            tops.add(createClothingItem("T-Shirt", "Standard comfortable option", 9, "👕"));
            tops.add(createClothingItem("Light Blouse", "Stylish and comfortable", 8, "👗"));
            tops.add(createClothingItem("Short-Sleeve Button-Up", "Professional casual", 7, "👔"));
        } else if (temp >= MILD) {
            tops.add(createClothingItem("Long-Sleeve Shirt", "Light layer for mild weather", 8, "👔"));
            tops.add(createClothingItem("Light Sweater", "Cozy but not too warm", 8, "🧥"));
            tops.add(createClothingItem("Cardigan", "Easy to remove if it warms up", 7, "🧥"));
        } else if (temp >= COOL) {
            tops.add(createClothingItem("Sweater", "Warm and comfortable", 9, "🧥"));
            tops.add(createClothingItem("Hoodie", "Casual warmth", 8, "👘"));
            tops.add(createClothingItem("Long-Sleeve Thermal", "Base layer for warmth", 7, "👔"));
        } else if (temp >= COLD) {
            tops.add(createClothingItem("Thick Sweater", "Substantial warmth", 9, "🧥"));
            tops.add(createClothingItem("Fleece Top", "Insulating layer", 8, "🧥"));
            tops.add(createClothingItem("Wool Sweater", "Natural insulation", 8, "🧥"));
        } else {
            tops.add(createClothingItem("Thermal Underwear", "Base layer essential", 9, "👔"));
            tops.add(createClothingItem("Heavy Wool Sweater", "Maximum warmth", 9, "🧥"));
            tops.add(createClothingItem("Insulated Top", "Cold weather protection", 8, "🧥"));
        }

        // Wind considerations
        if (weather.getWindSpeed() > 10) {
            tops.forEach(top -> {
                if (top.get("name").toString().contains("Light") || top.get("name").toString().contains("Tank")) {
                    top.put("score", ((Integer) top.get("score")) - 2);
                }
            });
        }

        return tops;
    }

    /**
     * Get bottom clothing recommendations
     */
    private List<Map<String, Object>> getBottomRecommendations(WeatherResponse weather) {
        List<Map<String, Object>> bottoms = new ArrayList<>();
        double temp = weather.getTemperature();

        if (temp >= HOT) {
            bottoms.add(createClothingItem("Shorts", "Cool and comfortable", 9, "🩳"));
            bottoms.add(createClothingItem("Light Skirt", "Breezy and stylish", 8, "👗"));
            bottoms.add(createClothingItem("Capri Pants", "Partial leg coverage", 7, "👖"));
        } else if (temp >= WARM) {
            bottoms.add(createClothingItem("Light Pants", "Comfortable for warm weather", 8, "👖"));
            bottoms.add(createClothingItem("Chinos", "Stylish and breathable", 8, "👖"));
            bottoms.add(createClothingItem("Shorts", "Still comfortable option", 7, "🩳"));
        } else if (temp >= MILD) {
            bottoms.add(createClothingItem("Jeans", "Classic comfortable option", 9, "👖"));
            bottoms.add(createClothingItem("Khakis", "Professional casual", 8, "👖"));
            bottoms.add(createClothingItem("Light Pants", "Comfortable layer", 7, "👖"));
        } else if (temp >= COOL) {
            bottoms.add(createClothingItem("Jeans", "Good for cooler weather", 8, "👖"));
            bottoms.add(createClothingItem("Corduroys", "Warmer fabric option", 7, "👖"));
            bottoms.add(createClothingItem("Leggings", "Close-fitting warmth", 7, "🩱"));
        } else if (temp >= COLD) {
            bottoms.add(createClothingItem("Thermal Leggings", "Insulating base layer", 8, "🩱"));
            bottoms.add(createClothingItem("Thick Jeans", "Denim with warmth", 8, "👖"));
            bottoms.add(createClothingItem("Wool Pants", "Natural insulation", 7, "👖"));
        } else {
            bottoms.add(createClothingItem("Insulated Pants", "Cold weather protection", 9, "👖"));
            bottoms.add(createClothingItem("Snow Pants", "Extreme cold gear", 8, "🧥"));
            bottoms.add(createClothingItem("Thermal Underwear", "Essential base layer", 9, "🩱"));
        }

        return bottoms;
    }

    /**
     * Get outerwear recommendations
     */
    private List<Map<String, Object>> getOuterwearRecommendations(WeatherResponse weather) {
        List<Map<String, Object>> outerwear = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Rain gear
        if ("rain".equals(condition) || "storm".equals(condition)) {
            outerwear.add(createClothingItem("Waterproof Jacket", "Essential for rain protection", 9, "🧥"));
            outerwear.add(createClothingItem("Rain Coat", "Full coverage rain protection", 9, "☔"));
            outerwear.add(createClothingItem("Umbrella", "Portable rain shield", 8, "☂️"));
        }

        // Temperature-based outerwear
        if (temp >= WARM) {
            outerwear.add(createClothingItem("Light Cardigan", "Optional light layer", 5, "🧥"));
            outerwear.add(createClothingItem("Denim Jacket", "Stylish light layer", 4, "🧥"));
        } else if (temp >= MILD) {
            outerwear.add(createClothingItem("Light Jacket", "Comfortable outer layer", 7, "🧥"));
            outerwear.add(createClothingItem("Blazer", "Professional option", 6, "🧥"));
            outerwear.add(createClothingItem("Cardigan", "Cozy outer layer", 6, "🧥"));
        } else if (temp >= COOL) {
            outerwear.add(createClothingItem("Jacket", "Standard outer protection", 8, "🧥"));
            outerwear.add(createClothingItem("Windbreaker", "Wind protection", 7, "🧥"));
            outerwear.add(createClothingItem("Fleece Jacket", "Insulating layer", 7, "🧥"));
        } else if (temp >= COLD) {
            outerwear.add(createClothingItem("Warm Coat", "Substantial outer protection", 9, "🧥"));
            outerwear.add(createClothingItem("Wool Coat", "Classic warm option", 8, "🧥"));
            outerwear.add(createClothingItem("Puffer Jacket", "Insulated warmth", 8, "🧥"));
        } else {
            outerwear.add(createClothingItem("Winter Coat", "Heavy insulation needed", 9, "🧥"));
            outerwear.add(createClothingItem("Parka", "Extreme cold protection", 9, "🧥"));
            outerwear.add(createClothingItem("Down Jacket", "Maximum insulation", 8, "🧥"));
        }

        // Wind considerations
        if (weather.getWindSpeed() > 8) {
            outerwear.add(createClothingItem("Windproof Jacket", "Wind protection essential", 9, "💨"));
        }

        return outerwear;
    }

    /**
     * Get footwear recommendations
     */
    private List<Map<String, Object>> getFootwearRecommendations(WeatherResponse weather) {
        List<Map<String, Object>> footwear = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Weather condition specific
        if ("rain".equals(condition) || "storm".equals(condition)) {
            footwear.add(createClothingItem("Waterproof Boots", "Keep feet dry", 9, "🥾"));
            footwear.add(createClothingItem("Rain Boots", "Full water protection", 8, "👢"));
            footwear.add(createClothingItem("Water-Resistant Shoes", "Basic protection", 6, "👟"));
        } else if ("snow".equals(condition)) {
            footwear.add(createClothingItem("Snow Boots", "Insulated and waterproof", 9, "🥾"));
            footwear.add(createClothingItem("Winter Boots", "Cold and snow protection", 8, "👢"));
        }

        // Temperature-based footwear
        if (temp >= HOT) {
            footwear.add(createClothingItem("Sandals", "Maximum ventilation", 9, "👡"));
            footwear.add(createClothingItem("Flip-Flops", "Casual and cool", 7, "🩴"));
            footwear.add(createClothingItem("Canvas Shoes", "Breathable option", 6, "👟"));
        } else if (temp >= WARM) {
            footwear.add(createClothingItem("Sneakers", "Comfortable and versatile", 8, "👟"));
            footwear.add(createClothingItem("Loafers", "Stylish and comfortable", 7, "👞"));
            footwear.add(createClothingItem("Sandals", "Still comfortable", 6, "👡"));
        } else if (temp >= MILD) {
            footwear.add(createClothingItem("Casual Shoes", "Standard comfort", 8, "👞"));
            footwear.add(createClothingItem("Sneakers", "Versatile option", 8, "👟"));
            footwear.add(createClothingItem("Ankle Boots", "Stylish coverage", 7, "👢"));
        } else if (temp >= COOL) {
            footwear.add(createClothingItem("Closed-Toe Shoes", "Foot protection", 8, "👞"));
            footwear.add(createClothingItem("Boots", "Ankle warmth", 7, "👢"));
            footwear.add(createClothingItem("Warm Socks", "Essential foot warmth", 9, "🧦"));
        } else {
            footwear.add(createClothingItem("Insulated Boots", "Cold weather protection", 9, "🥾"));
            footwear.add(createClothingItem("Thermal Socks", "Warm feet essential", 9, "🧦"));
            footwear.add(createClothingItem("Wool Socks", "Natural warmth", 8, "🧦"));
        }

        return footwear;
    }

    /**
     * Get accessory recommendations
     */
    private List<Map<String, Object>> getAccessoryRecommendations(WeatherResponse weather, AirQualityResponse airQuality) {
        List<Map<String, Object>> accessories = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Sun protection
        if ("clear".equals(condition) && temp > 20) {
            accessories.add(createClothingItem("Sunglasses", "Eye protection from UV", 8, "🕶️"));
            accessories.add(createClothingItem("Sun Hat", "Head and face protection", 7, "👒"));
            accessories.add(createClothingItem("Sunscreen", "Skin protection essential", 9, "🧴"));
        }

        // Cold weather accessories
        if (temp < COOL) {
            accessories.add(createClothingItem("Scarf", "Neck warmth", 8, "🧣"));
            accessories.add(createClothingItem("Gloves", "Hand protection", 8, "🧤"));
            accessories.add(createClothingItem("Hat", "Head warmth", 8, "👒"));
        }

        if (temp < COLD) {
            accessories.add(createClothingItem("Warm Hat", "Essential head coverage", 9, "🎩"));
            accessories.add(createClothingItem("Insulated Gloves", "Hand warmth essential", 9, "🧤"));
            accessories.add(createClothingItem("Neck Warmer", "Additional neck protection", 7, "🧣"));
        }

        // Rain accessories
        if ("rain".equals(condition)) {
            accessories.add(createClothingItem("Umbrella", "Portable rain protection", 9, "☂️"));
            accessories.add(createClothingItem("Rain Hat", "Head protection", 6, "👒"));
        }

        // Air quality accessories
        if (airQuality != null && airQuality.getAqi() > 100) {
            accessories.add(createClothingItem("Face Mask", "Air pollution protection", 8, "😷"));
        }

        // Wind accessories
        if (weather.getWindSpeed() > 10) {
            accessories.add(createClothingItem("Wind-Resistant Hat", "Secure head coverage", 7, "👒"));
            accessories.add(createClothingItem("Hair Ties", "Keep hair secure", 6, "🎀"));
        }

        return accessories;
    }

    /**
     * Get special gear recommendations
     */
    private List<Map<String, Object>> getSpecialGearRecommendations(WeatherResponse weather, AirQualityResponse airQuality) {
        List<Map<String, Object>> specialGear = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Extreme weather gear
        if (temp > VERY_HOT) {
            specialGear.add(createClothingItem("Cooling Towel", "Body temperature regulation", 8, "🧊"));
            specialGear.add(createClothingItem("Portable Fan", "Personal cooling", 7, "💨"));
            specialGear.add(createClothingItem("Hydration Pack", "Stay hydrated", 8, "💧"));
        }

        if (temp < VERY_COLD) {
            specialGear.add(createClothingItem("Hand Warmers", "Instant heat packs", 8, "🔥"));
            specialGear.add(createClothingItem("Thermal Blanket", "Emergency warmth", 7, "🛏️"));
            specialGear.add(createClothingItem("Insulated Water Bottle", "Prevent freezing", 6, "🍶"));
        }

        // Storm gear
        if ("storm".equals(condition)) {
            specialGear.add(createClothingItem("Emergency Kit", "Safety preparation", 8, "🎒"));
            specialGear.add(createClothingItem("Flashlight", "Power outage preparation", 7, "🔦"));
        }

        // High wind gear
        if (weather.getWindSpeed() > 15) {
            specialGear.add(createClothingItem("Wind Goggles", "Eye protection", 7, "🥽"));
            specialGear.add(createClothingItem("Secure Bag", "Prevent items from blowing away", 6, "🎒"));
        }

        return specialGear;
    }

    /**
     * Get layering strategy
     */
    private Map<String, Object> getLayeringStrategy(WeatherResponse weather) {
        Map<String, Object> layering = new HashMap<>();
        double temp = weather.getTemperature();

        if (temp < COOL) {
            layering.put("strategy", "Multiple layers recommended");
            layering.put("baseLayer", "Thermal underwear or moisture-wicking fabric");
            layering.put("middleLayer", "Insulating layer like fleece or wool");
            layering.put("outerLayer", "Wind and water-resistant shell");
            layering.put("importance", 9);
        } else if (temp < MILD) {
            layering.put("strategy", "Light layering");
            layering.put("baseLayer", "Comfortable shirt or blouse");
            layering.put("outerLayer", "Light jacket or cardigan");
            layering.put("importance", 6);
        } else {
            layering.put("strategy", "Minimal layering needed");
            layering.put("tip", "Choose breathable fabrics");
            layering.put("importance", 3);
        }

        return layering;
    }

    /**
     * Helper methods
     */
    private Map<String, Object> createClothingItem(String name, String description, int score, String emoji) {
        Map<String, Object> item = new HashMap<>();
        item.put("name", name);
        item.put("description", description);
        item.put("score", score);
        item.put("emoji", emoji);
        return item;
    }

    private String categorizeWeatherCondition(String description) {
        String lowerDesc = description.toLowerCase();

        if (lowerDesc.contains("clear") || lowerDesc.contains("sunny")) return "clear";
        if (lowerDesc.contains("cloud")) return "cloudy";
        if (lowerDesc.contains("rain") || lowerDesc.contains("drizzle")) return "rain";
        if (lowerDesc.contains("snow")) return "snow";
        if (lowerDesc.contains("storm") || lowerDesc.contains("thunder")) return "storm";
        if (lowerDesc.contains("fog") || lowerDesc.contains("mist")) return "fog";

        return "unknown";
    }

    private List<Map<String, String>> getCompleteOutfitSuggestions(WeatherResponse weather) {
        List<Map<String, String>> outfits = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        if (temp >= HOT) {
            Map<String, String> outfit1 = new HashMap<>();
            outfit1.put("name", "Hot Weather Casual");
            outfit1.put("description", "Tank top, shorts, sandals, sunhat");
            outfit1.put("occasion", "Casual outdoor activities");
            outfits.add(outfit1);
        } else if (temp >= WARM) {
            Map<String, String> outfit1 = new HashMap<>();
            outfit1.put("name", "Warm Weather Comfort");
            outfit1.put("description", "T-shirt, light pants, sneakers");
            outfit1.put("occasion", "Daily activities");
            outfits.add(outfit1);
        } else if (temp < COLD) {
            Map<String, String> outfit1 = new HashMap<>();
            outfit1.put("name", "Cold Weather Bundle");
            outfit1.put("description", "Thermal base, sweater, winter coat, boots, gloves, hat");
            outfit1.put("occasion", "Cold weather protection");
            outfits.add(outfit1);
        }

        if ("rain".equals(condition)) {
            Map<String, String> outfit = new HashMap<>();
            outfit.put("name", "Rainy Day Ready");
            outfit.put("description", "Waterproof jacket, water-resistant shoes, umbrella");
            outfit.put("occasion", "Wet weather protection");
            outfits.add(outfit);
        }

        return outfits;
    }

    private Map<String, Object> getWorkOutfitRecommendations(WeatherResponse weather) {
        Map<String, Object> workOutfit = new HashMap<>();
        double temp = weather.getTemperature();

        if (temp >= WARM) {
            workOutfit.put("suggestion", "Light business attire");
            workOutfit.put("details", "Lightweight blouse/shirt, dress pants/skirt, professional shoes");
        } else if (temp >= COOL) {
            workOutfit.put("suggestion", "Standard business attire");
            workOutfit.put("details", "Button-up shirt, suit/blazer, dress shoes");
        } else {
            workOutfit.put("suggestion", "Warm business attire");
            workOutfit.put("details", "Layered professional clothing, warm coat, closed-toe shoes");
        }

        return workOutfit;
    }

    private Map<String, Object> getCasualOutfitRecommendations(WeatherResponse weather) {
        Map<String, Object> casualOutfit = new HashMap<>();
        double temp = weather.getTemperature();

        if (temp >= HOT) {
            casualOutfit.put("suggestion", "Minimal casual wear");
            casualOutfit.put("details", "Tank top/t-shirt, shorts, comfortable sandals");
        } else if (temp >= WARM) {
            casualOutfit.put("suggestion", "Comfortable casual");
            casualOutfit.put("details", "T-shirt, jeans/casual pants, sneakers");
        } else if (temp >= COOL) {
            casualOutfit.put("suggestion", "Layered casual");
            casualOutfit.put("details", "Long-sleeve shirt, jacket, jeans, closed shoes");
        } else {
            casualOutfit.put("suggestion", "Warm casual layers");
            casualOutfit.put("details", "Sweater, warm pants, boots, winter accessories");
        }

        return casualOutfit;
    }

    private Map<String, Object> getExerciseGearRecommendations(WeatherResponse weather, AirQualityResponse airQuality) {
        Map<String, Object> exerciseGear = new HashMap<>();
        double temp = weather.getTemperature();

        if (temp >= HOT) {
            exerciseGear.put("suggestion", "Minimal, moisture-wicking gear");
            exerciseGear.put("details", "Lightweight shorts, breathable tank top, running shoes");
            exerciseGear.put("warning", "Exercise early morning or evening to avoid heat");
        } else if (temp >= WARM) {
            exerciseGear.put("suggestion", "Standard workout attire");
            exerciseGear.put("details", "Shorts/leggings, moisture-wicking shirt, athletic shoes");
        } else if (temp >= COOL) {
            exerciseGear.put("suggestion", "Layered exercise clothing");
            exerciseGear.put("details", "Long sleeves, running tights, light jacket");
        } else {
            exerciseGear.put("suggestion", "Insulated workout gear");
            exerciseGear.put("details", "Thermal base layers, insulated jacket, warm gloves");
        }

        // Air quality considerations for exercise
        if (airQuality != null && airQuality.getAqi() > 150) {
            exerciseGear.put("airQualityWarning", "Consider indoor exercise due to poor air quality");
            exerciseGear.put("mask", "Wear N95 mask if exercising outdoors");
        }

        return exerciseGear;
    }

    private List<String> getWeatherSpecificTips(WeatherResponse weather, AirQualityResponse airQuality) {
        List<String> tips = new ArrayList<>();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        // Temperature tips
        if (temp > VERY_HOT) {
            tips.add("Choose light colors to reflect heat");
            tips.add("Wear loose-fitting clothes for air circulation");
            tips.add("Consider UV protection clothing for extended outdoor time");
        } else if (temp < VERY_COLD) {
            tips.add("Layer clothing to trap warm air");
            tips.add("Cover extremities (hands, feet, head) to prevent heat loss");
            tips.add("Choose moisture-wicking base layers to stay dry");
        }

        // Weather condition tips
        if ("rain".equals(condition)) {
            tips.add("Waterproof outerwear is essential");
            tips.add("Avoid cotton as it retains moisture");
            tips.add("Carry extra socks in case feet get wet");
        } else if ("storm".equals(condition)) {
            tips.add("Avoid metallic accessories during thunderstorms");
            tips.add("Wear sturdy, closed-toe shoes for safety");
        } else if ("snow".equals(condition)) {
            tips.add("Choose insulated, waterproof footwear");
            tips.add("Wear multiple thin layers rather than one thick layer");
        }

        // Wind tips
        if (weather.getWindSpeed() > 10) {
            tips.add("Secure loose clothing and accessories");
            tips.add("Consider wind-resistant outer layers");
            tips.add("Protect face and eyes from wind");
        }

        // Humidity tips
        if (weather.getHumidity() > 70) {
            tips.add("Choose breathable, moisture-wicking fabrics");
            tips.add("Avoid heavy layering in high humidity");
        } else if (weather.getHumidity() < 30) {
            tips.add("Use moisturizer to prevent dry skin");
            tips.add("Consider fabrics that don't generate static");
        }

        // Air quality tips
        if (airQuality != null && airQuality.getAqi() > 100) {
            tips.add("Consider wearing a face mask outdoors");
            tips.add("Limit outdoor exposure time");
        }

        return tips;
    }

    private int calculateComfortLevel(WeatherResponse weather) {
        int comfort = 5; // Base comfort level
        double temp = weather.getTemperature();

        // Temperature comfort scoring
        if (temp >= 18 && temp <= 24) {
            comfort += 3; // Ideal temperature range
        } else if (temp >= 15 && temp <= 28) {
            comfort += 1; // Comfortable range
        } else if (temp < 5 || temp > 35) {
            comfort -= 3; // Extreme temperatures
        } else {
            comfort -= 1; // Less comfortable but manageable
        }

        // Weather condition impact
        String condition = categorizeWeatherCondition(weather.getDescription());
        switch (condition) {
            case "clear":
                comfort += 2;
                break;
            case "cloudy":
                comfort += 1;
                break;
            case "rain":
                comfort -= 2;
                break;
            case "storm":
                comfort -= 3;
                break;
            case "snow":
                comfort -= 1;
                break;
        }

        // Wind impact
        if (weather.getWindSpeed() > 15) {
            comfort -= 2;
        } else if (weather.getWindSpeed() > 8) {
            comfort -= 1;
        }

        // Humidity impact
        if (weather.getHumidity() > 80 || weather.getHumidity() < 20) {
            comfort -= 1;
        }

        return Math.max(1, Math.min(10, comfort));
    }

    private String generateClothingSummary(WeatherResponse weather) {
        StringBuilder summary = new StringBuilder();
        double temp = weather.getTemperature();
        String condition = categorizeWeatherCondition(weather.getDescription());

        summary.append("For today's weather (").append(String.format("%.1f°C, %s", temp, weather.getDescription())).append("), ");

        if (temp >= HOT) {
            summary.append("dress light and cool. ");
        } else if (temp >= WARM) {
            summary.append("comfortable casual wear is ideal. ");
        } else if (temp >= COOL) {
            summary.append("layer up for comfort. ");
        } else {
            summary.append("bundle up warm. ");
        }

        if ("rain".equals(condition)) {
            summary.append("Don't forget waterproof gear! ");
        } else if ("storm".equals(condition)) {
            summary.append("Stay safe with sturdy, weather-appropriate clothing. ");
        } else if ("clear".equals(condition) && temp > 25) {
            summary.append("Sun protection recommended. ");
        }

        if (weather.getWindSpeed() > 10) {
            summary.append("Secure loose items due to wind. ");
        }

        return summary.toString();
    }

    /**
     * Get clothing recommendations for specific occasion
     */
    public Map<String, Object> getClothingRecommendationsForOccasion(String cityName, String occasion) {
        WeatherResponse weather = weatherService.getCurrentWeather(cityName);
        Map<String, Object> recommendations = new HashMap<>();

        switch (occasion.toLowerCase()) {
            case "work":
            case "business":
                recommendations = getWorkOutfitRecommendations(weather);
                break;
            case "exercise":
            case "workout":
            case "gym":
                AirQualityResponse airQuality = null;
                try {
                    airQuality = airQualityService.getAirQualityData(cityName);
                } catch (Exception e) {
                    // Air quality optional for exercise recommendations
                }
                recommendations = getExerciseGearRecommendations(weather, airQuality);
                break;
            case "casual":
            case "everyday":
                recommendations = getCasualOutfitRecommendations(weather);
                break;
            default:
                recommendations = generateClothingRecommendations(weather, null);
        }

        return recommendations;
    }
}