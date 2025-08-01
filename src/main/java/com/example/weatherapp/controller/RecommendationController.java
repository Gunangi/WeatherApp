package com.example.weatherapp.controller;

import com.example.weatherapp.service.ActivityRecommendationService;
import com.example.weatherapp.service.ClothingRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private ActivityRecommendationService activityRecommendationService;

    @Autowired
    private ClothingRecommendationService clothingRecommendationService;

    /**
     * Get activity recommendations based on current weather
     */
    @GetMapping("/activities/current")
    public ResponseEntity<List<Map<String, Object>>> getCurrentActivityRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        try {
            List<Map<String, Object>> recommendations = activityRecommendationService
                    .getCurrentActivityRecommendations(lat, lon, category, difficulty);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity recommendations for forecast period
     */
    @GetMapping("/activities/forecast")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getForecastActivityRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5") int days,
            @RequestParam(required = false) String category) {
        try {
            Map<String, List<Map<String, Object>>> recommendations = activityRecommendationService
                    .getForecastActivityRecommendations(lat, lon, days, category);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get clothing recommendations for current weather
     */
    @GetMapping("/clothing/current")
    public ResponseEntity<Map<String, Object>> getCurrentClothingRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String occasion) {
        try {
            Map<String, Object> recommendations = clothingRecommendationService
                    .getCurrentClothingRecommendations(lat, lon, gender, occasion);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get clothing recommendations for forecast
     */
    @GetMapping("/clothing/forecast")
    public ResponseEntity<Map<String, Map<String, Object>>> getForecastClothingRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(required = false) String gender) {
        try {
            Map<String, Map<String, Object>> recommendations = clothingRecommendationService
                    .getForecastClothingRecommendations(lat, lon, days, gender);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get outdoor activity safety recommendations
     */
    @GetMapping("/activities/safety")
    public ResponseEntity<Map<String, Object>> getOutdoorActivitySafety(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam String activity) {
        try {
            Map<String, Object> safety = activityRecommendationService
                    .getOutdoorActivitySafety(lat, lon, activity);
            return ResponseEntity.ok(safety);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sports recommendations based on weather
     */
    @GetMapping("/sports")
    public ResponseEntity<List<Map<String, Object>>> getSportsRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String sportType,
            @RequestParam(defaultValue = "false") boolean indoorOptions) {
        try {
            List<Map<String, Object>> recommendations = activityRecommendationService
                    .getSportsRecommendations(lat, lon, sportType, indoorOptions);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get gardening recommendations
     */
    @GetMapping("/gardening")
    public ResponseEntity<Map<String, Object>> getGardeningRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String season) {
        try {
            Map<String, Object> recommendations = activityRecommendationService
                    .getGardeningRecommendations(lat, lon, season);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get travel outfit recommendations
     */
    @GetMapping("/clothing/travel")
    public ResponseEntity<Map<String, Object>> getTravelOutfitRecommendations(
            @RequestParam double departureLat,
            @RequestParam double departureLon,
            @RequestParam double destinationLat,
            @RequestParam double destinationLon,
            @RequestParam int travelDays,
            @RequestParam(required = false) String travelType) {
        try {
            Map<String, Object> recommendations = clothingRecommendationService
                    .getTravelOutfitRecommendations(departureLat, departureLon, destinationLat, destinationLon, travelDays, travelType);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get workout recommendations based on weather
     */
    @GetMapping("/fitness")
    public ResponseEntity<List<Map<String, Object>>> getFitnessRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String fitnessLevel,
            @RequestParam(required = false) String preferredLocation) {
        try {
            List<Map<String, Object>> recommendations = activityRecommendationService
                    .getFitnessRecommendations(lat, lon, fitnessLevel, preferredLocation);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get photography recommendations
     */
    @GetMapping("/photography")
    public ResponseEntity<Map<String, Object>> getPhotographyRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String photoType) {
        try {
            Map<String, Object> recommendations = activityRecommendationService
                    .getPhotographyRecommendations(lat, lon, photoType);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get event planning recommendations
     */
    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getEventPlanningRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam String eventType,
            @RequestParam(defaultValue = "7") int planningDays) {
        try {
            Map<String, Object> recommendations = activityRecommendationService
                    .getEventPlanningRecommendations(lat, lon, eventType, planningDays);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get seasonal clothing recommendations
     */
    @GetMapping("/clothing/seasonal")
    public ResponseEntity<Map<String, Object>> getSeasonalClothingRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String season) {
        try {
            Map<String, Object> recommendations = clothingRecommendationService
                    .getSeasonalClothingRecommendations(lat, lon, season);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get personalized recommendations based on user preferences
     */
    @GetMapping("/personalized/{userId}")
    public ResponseEntity<Map<String, Object>> getPersonalizedRecommendations(
            @PathVariable String userId,
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            Map<String, Object> recommendations = activityRecommendationService
                    .getPersonalizedRecommendations(userId, lat, lon);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Save user activity preferences
     */
    @PostMapping("/preferences/activities/{userId}")
    public ResponseEntity<Map<String, String>> saveActivityPreferences(
            @PathVariable String userId,
            @RequestBody Map<String, Object> preferences) {
        try {
            String result = activityRecommendationService.saveActivityPreferences(userId, preferences);
            return ResponseEntity.ok(Map.of("result", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Save user clothing preferences
     */
    @PostMapping("/preferences/clothing/{userId}")
    public ResponseEntity<Map<String, String>> saveClothingPreferences(
            @PathVariable String userId,
            @RequestBody Map<String, Object> preferences) {
        try {
            String result = clothingRecommendationService.saveClothingPreferences(userId, preferences);
            return ResponseEntity.ok(Map.of("result", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user activity preferences
     */
    @GetMapping("/preferences/activities/{userId}")
    public ResponseEntity<Map<String, Object>> getActivityPreferences(@PathVariable String userId) {
        try {
            Map<String, Object> preferences = activityRecommendationService.getActivityPreferences(userId);
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user clothing preferences
     */
    @GetMapping("/preferences/clothing/{userId}")
    public ResponseEntity<Map<String, Object>> getClothingPreferences(@PathVariable String userId) {
        try {
            Map<String, Object> preferences = clothingRecommendationService.getClothingPreferences(userId);
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all available activity categories
     */
    @GetMapping("/activities/categories")
    public ResponseEntity<List<String>> getActivityCategories() {
        try {
            List<String> categories = activityRecommendationService.getActivityCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather-based health recommendations
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealthRecommendations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String healthCondition) {
        try {
            Map<String, Object> recommendations = activityRecommendationService
                    .getHealthRecommendations(lat, lon, healthCondition);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}