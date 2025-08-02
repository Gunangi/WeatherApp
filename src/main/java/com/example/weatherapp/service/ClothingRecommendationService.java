// src/main/java/com/weatherapp/service/ClothingRecommendationService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.ClothingSuggestionDto;
import com.example.weatherapp.dto.ClothingSet;
import com.example.weatherapp.dto.WeatherResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ClothingRecommendationService {

    public ClothingSuggestionDto getClothingSuggestions(WeatherResponse weather) {
        // FIX: Changed getDescription() to getWeatherDescription()
        String desc = weather.getWeatherDescription().toLowerCase();
        double feelsLike = weather.getFeelsLike();

        ClothingSuggestionDto suggestions = new ClothingSuggestionDto();
        ClothingSet casual = new ClothingSet();
        ClothingSet workwear = new ClothingSet();

        // Initialize lists to prevent null pointer exceptions
        casual.setTopwear(new ArrayList<>());
        casual.setBottomwear(new ArrayList<>());
        casual.setFootwear(new ArrayList<>());
        casual.setOuterwear(new ArrayList<>());
        casual.setAccessories(new ArrayList<>());

        workwear.setTopwear(new ArrayList<>());
        workwear.setBottomwear(new ArrayList<>());
        workwear.setFootwear(new ArrayList<>());
        workwear.setOuterwear(new ArrayList<>());
        workwear.setAccessories(new ArrayList<>());

        // --- Temperature-based Suggestions ---
        if (feelsLike > 28) {
            suggestions.setGeneralAdvice("It's hot. Prioritize light, breathable fabrics.");
            // Casual
            casual.getTopwear().add("T-shirt (cotton, linen)");
            casual.getTopwear().add("Polo shirt");
            casual.getBottomwear().add("Shorts");
            casual.getBottomwear().add("Linen trousers");
            casual.getFootwear().add("Sandals or flip-flops");
            // Workwear
            workwear.getTopwear().add("Lightweight cotton or linen shirt");
            workwear.getBottomwear().add("Chinos or lightweight formal trousers");
            workwear.getFootwear().add("Loafers or leather sandals");

        } else if (feelsLike > 18) {
            suggestions.setGeneralAdvice("Pleasant weather. Layering is a good option.");
            // Casual
            casual.getTopwear().add("Long-sleeve t-shirt or casual shirt");
            casual.getBottomwear().add("Jeans or chinos");
            casual.getOuterwear().add("A light jacket, denim jacket, or hoodie");
            casual.getFootwear().add("Sneakers or casual shoes");
            // Workwear
            workwear.getTopwear().add("Formal shirt");
            workwear.getBottomwear().add("Formal trousers");
            workwear.getOuterwear().add("A blazer or a light formal jacket");
            workwear.getFootwear().add("Formal shoes (Oxfords, Derbys)");

        } else if (feelsLike > 10) {
            suggestions.setGeneralAdvice("It's cool. A warm layer is necessary.");
            // Casual
            casual.getTopwear().add("Sweater or a fleece");
            casual.getBottomwear().add("Thicker jeans or corduroys");
            casual.getOuterwear().add("A medium-weight jacket");
            casual.getFootwear().add("Boots or sturdy sneakers");
            // Workwear
            workwear.getTopwear().add("Formal shirt with a sweater");
            workwear.getBottomwear().add("Wool trousers");
            workwear.getOuterwear().add("A formal overcoat");
            workwear.getFootwear().add("Leather boots or formal shoes");

        } else {
            suggestions.setGeneralAdvice("It's cold. Bundle up with multiple warm layers.");
            // Casual
            casual.getTopwear().add("Thermal innerwear, thick sweater");
            casual.getBottomwear().add("Insulated pants or thick wool trousers");
            casual.getOuterwear().add("A heavy winter coat or parka");
            casual.getFootwear().add("Insulated, waterproof boots");
            casual.getAccessories().add("Scarf, gloves, and a warm hat (beanie)");
            // Workwear
            workwear.getTopwear().add("Thermal shirt, formal shirt, and a wool sweater");
            workwear.getBottomwear().add("Heavy wool trousers");
            workwear.getOuterwear().add("A heavy formal overcoat");
            workwear.getFootwear().add("Insulated leather boots");
            workwear.getAccessories().add("A formal scarf and leather gloves");
        }

        // --- Condition-based Accessories ---
        if (desc.contains("rain") || desc.contains("drizzle")) {
            casual.getOuterwear().add("Waterproof raincoat or windbreaker");
            casual.getAccessories().add("An umbrella is a must!");
            casual.getFootwear().add("Waterproof boots or shoes");
            workwear.getOuterwear().add("A formal trench coat (water-resistant)");
            workwear.getAccessories().add("A sturdy, dark-colored umbrella");
            workwear.getFootwear().add("Waterproof leather shoes or boots");
        }
        if (!desc.contains("cloud") && weather.getUvIndex() > 3) {
            casual.getAccessories().add("Sunglasses");
            casual.getAccessories().add("A cap or sun hat");
            casual.getAccessories().add("Sunscreen is highly recommended");
            workwear.getAccessories().add("Classic sunglasses");
        }
        if (weather.getWindSpeed() > 10) {
            casual.getOuterwear().add("A windbreaker is a good choice");
            workwear.getOuterwear().add("A well-fitted coat that blocks wind");
        }

        suggestions.setSuggestions(Map.of("casual", casual, "workwear", workwear));
        return suggestions;
    }
}