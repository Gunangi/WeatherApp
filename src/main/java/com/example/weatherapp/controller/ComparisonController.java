package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WeatherComparisonDto;
import com.example.weatherapp.service.WeatherComparisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comparison")
@CrossOrigin(origins = "*")
public class ComparisonController {

    @Autowired
    private WeatherComparisonService weatherComparisonService;

    /**
     * Compare current weather between multiple cities
     */
    @PostMapping("/current")
    public ResponseEntity<WeatherComparisonDto> compareCurrentWeather(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            WeatherComparisonDto comparison = weatherComparisonService.compareCurrentWeather(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare weather forecasts between multiple cities
     */
    @PostMapping("/forecast")
    public ResponseEntity<WeatherComparisonDto> compareForecast(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam(defaultValue = "5") int days) {
        try {
            WeatherComparisonDto comparison = weatherComparisonService.compareForecast(locations, days);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare two specific cities in detail
     */
    @GetMapping("/cities")
    public ResponseEntity<Map<String, Object>> compareTwoCities(
            @RequestParam double lat1,
            @RequestParam double lon1,
            @RequestParam String city1,
            @RequestParam double lat2,
            @RequestParam double lon2,
            @RequestParam String city2) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareTwoCities(
                    lat1, lon1, city1, lat2, lon2, city2);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare air quality between cities
     */
    @PostMapping("/air-quality")
    public ResponseEntity<Map<String, Object>> compareAirQuality(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareAirQuality(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get best/worst weather conditions among cities
     */
    @PostMapping("/best-worst")
    public ResponseEntity<Map<String, Object>> getBestWorstConditions(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam(defaultValue = "temperature") String criteria) {
        try {
            Map<String, Object> result = weatherComparisonService.getBestWorstConditions(locations, criteria);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare cities for specific activities
     */
    @PostMapping("/activity-suitability")
    public ResponseEntity<Map<String, Object>> compareForActivity(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam String activity) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareForActivity(locations, activity);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare temperature trends over time
     */
    @PostMapping("/temperature-trends")
    public ResponseEntity<Map<String, Object>> compareTemperatureTrends(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam(defaultValue = "7") int days) {
        try {
            Map<String, Object> trends = weatherComparisonService.compareTemperatureTrends(locations, days);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare weather metrics side by side
     */
    @PostMapping("/metrics")
    public ResponseEntity<Map<String, Object>> compareWeatherMetrics(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam(required = false) List<String> metrics) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareWeatherMetrics(locations, metrics);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare UV index between cities
     */
    @PostMapping("/uv-index")
    public ResponseEntity<Map<String, Object>> compareUVIndex(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareUVIndex(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare sunrise/sunset times
     */
    @PostMapping("/sun-times")
    public ResponseEntity<Map<String, Object>> compareSunTimes(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareSunTimes(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Find similar weather conditions in different cities
     */
    @GetMapping("/similar-conditions")
    public ResponseEntity<List<Map<String, Object>>> findSimilarConditions(
            @RequestParam double refLat,
            @RequestParam double refLon,
            @RequestParam(defaultValue = "5.0") double tolerance) {
        try {
            List<Map<String, Object>> similarCities = weatherComparisonService.findSimilarConditions(refLat, refLon, tolerance);
            return ResponseEntity.ok(similarCities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather ranking for multiple cities
     */
    @PostMapping("/ranking")
    public ResponseEntity<List<Map<String, Object>>> rankCitiesByWeather(
            @Valid @RequestBody List<Map<String, Double>> locations,
            @RequestParam(defaultValue = "temperature") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        try {
            List<Map<String, Object>> ranking = weatherComparisonService.rankCitiesByWeather(locations, sortBy, order);
            return ResponseEntity.ok(ranking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare weather comfort index between cities
     */
    @PostMapping("/comfort-index")
    public ResponseEntity<Map<String, Object>> compareComfortIndex(
            @Valid @RequestBody List<Map<String, Double>> locations) {
        try {
            Map<String, Object> comparison = weatherComparisonService.compareComfortIndex(locations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Save weather comparison for later reference
     */
    @PostMapping("/save/{userId}")
    public ResponseEntity<Map<String, String>> saveComparison(
            @PathVariable String userId,
            @Valid @RequestBody WeatherComparisonDto comparison,
            @RequestParam(required = false) String name) {
        try {
            String comparisonId = weatherComparisonService.saveComparison(userId, comparison, name);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("comparisonId", comparisonId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get saved comparisons for user
     */
    @GetMapping("/saved/{userId}")
    public ResponseEntity<List<WeatherComparisonDto>> getSavedComparisons(@PathVariable String userId) {
        try {
            List<WeatherComparisonDto> comparisons = weatherComparisonService.getSavedComparisons(userId);
            return ResponseEntity.ok(comparisons);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete saved comparison
     */
    @DeleteMapping("/saved/{userId}/{comparisonId}")
    public ResponseEntity<Void> deleteSavedComparison(
            @PathVariable String userId,
            @PathVariable String comparisonId) {
        try {
            weatherComparisonService.deleteSavedComparison(userId, comparisonId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}