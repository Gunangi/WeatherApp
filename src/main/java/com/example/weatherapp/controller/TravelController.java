package com.example.weatherapp.controller;

import com.example.weatherapp.dto.TravelPlannerDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.exception.InvalidRequestException;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.example.weatherapp.service.TravelPlannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for travel weather planning endpoints
 * Handles multi-destination weather planning and travel recommendations
 */
@RestController
@RequestMapping("/api/travel")
@CrossOrigin(origins = "*")
public class TravelController {

    @Autowired
    private TravelPlannerService travelPlannerService;

    /**
     * Get weather forecast for multiple destinations
     * @param destinations List of city names or coordinates
     * @param startDate Start date of travel
     * @param endDate End date of travel
     * @return Multi-destination weather data
     */
    @GetMapping("/multi-destination")
    public ResponseEntity<List<TravelPlannerDto>> getMultiDestinationWeather(
            @RequestParam List<String> destinations,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (destinations.isEmpty()) {
            throw new InvalidRequestException("At least one destination must be provided");
        }

        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("Start date cannot be after end date");
        }

        List<TravelPlannerDto> travelData = travelPlannerService.getMultiDestinationWeather(
                destinations, startDate, endDate);

        return ResponseEntity.ok(travelData);
    }

    /**
     * Get detailed travel plan with weather recommendations
     * @param travelPlan Travel plan details including destinations, dates, and preferences
     * @return Comprehensive travel weather plan
     */
    @PostMapping("/plan")
    public ResponseEntity<TravelPlannerDto> createTravelPlan(@Valid @RequestBody TravelPlannerDto travelPlan) {
        TravelPlannerDto detailedPlan = travelPlannerService.createDetailedTravelPlan(travelPlan);
        return ResponseEntity.ok(detailedPlan);
    }

    /**
     * Get weather comparison between multiple destinations for a specific date
     * @param destinations List of destinations to compare
     * @param date Date for comparison
     * @return Weather comparison data
     */
    @GetMapping("/compare")
    public ResponseEntity<Map<String, WeatherResponse>> compareDestinations(
            @RequestParam List<String> destinations,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (destinations.size() < 2) {
            throw new InvalidRequestException("At least two destinations are required for comparison");
        }

        Map<String, WeatherResponse> comparison = travelPlannerService.compareDestinationsWeather(
                destinations, date);

        return ResponseEntity.ok(comparison);
    }

    /**
     * Get travel recommendations based on weather conditions
     * @param destination Destination city
     * @param startDate Start date of travel
     * @param endDate End date of travel
     * @param activityType Type of activities planned (outdoor, indoor, mixed)
     * @return Travel recommendations
     */
    @GetMapping("/recommendations")
    public ResponseEntity<TravelPlannerDto> getTravelRecommendations(
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "mixed") String activityType) {

        TravelPlannerDto recommendations = travelPlannerService.getTravelRecommendations(
                destination, startDate, endDate, activityType);

        return ResponseEntity.ok(recommendations);
    }

    /**
     * Get best travel dates for a destination within a date range
     * @param destination Destination city
     * @param startDate Start of date range to consider
     * @param endDate End of date range to consider
     * @param duration Duration of trip in days
     * @return Best travel dates with weather scores
     */
    @GetMapping("/best-dates")
    public ResponseEntity<List<TravelPlannerDto>> getBestTravelDates(
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "3") int duration) {

        if (duration < 1 || duration > 30) {
            throw new InvalidRequestException("Trip duration must be between 1 and 30 days");
        }

        List<TravelPlannerDto> bestDates = travelPlannerService.findBestTravelDates(
                destination, startDate, endDate, duration);

        return ResponseEntity.ok(bestDates);
    }

    /**
     * Get weather alerts and warnings for travel destinations
     * @param destinations List of destinations to check
     * @param startDate Start date for alert checking
     * @param endDate End date for alert checking
     * @return Travel alerts and warnings
     */
    @GetMapping("/alerts")
    public ResponseEntity<Map<String, List<String>>> getTravelAlerts(
            @RequestParam List<String> destinations,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Map<String, List<String>> alerts = travelPlannerService.getTravelAlerts(
                destinations, startDate, endDate);

        return ResponseEntity.ok(alerts);
    }

    /**
     * Get packing suggestions based on weather forecast
     * @param destination Destination city
     * @param startDate Start date of travel
     * @param endDate End date of travel
     * @param tripType Type of trip (business, leisure, adventure)
     * @return Packing recommendations
     */
    @GetMapping("/packing-suggestions")
    public ResponseEntity<Map<String, List<String>>> getPackingSuggestions(
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "leisure") String tripType) {

        Map<String, List<String>> packingSuggestions = travelPlannerService.getPackingSuggestions(
                destination, startDate, endDate, tripType);

        return ResponseEntity.ok(packingSuggestions);
    }

    /**
     * Get saved travel plans for a user
     * @param userId User ID
     * @return List of saved travel plans
     */
    @GetMapping("/saved-plans/{userId}")
    public ResponseEntity<List<TravelPlannerDto>> getSavedTravelPlans(@PathVariable String userId) {
        List<TravelPlannerDto> savedPlans = travelPlannerService.getSavedTravelPlans(userId);
        return ResponseEntity.ok(savedPlans);
    }

    /**
     * Save a travel plan for future reference
     * @param userId User ID
     * @param travelPlan Travel plan to save
     * @return Saved travel plan with ID
     */
    @PostMapping("/save-plan/{userId}")
    public ResponseEntity<TravelPlannerDto> saveTravelPlan(
            @PathVariable String userId,
            @Valid @RequestBody TravelPlannerDto travelPlan) {

        TravelPlannerDto savedPlan = travelPlannerService.saveTravelPlan(userId, travelPlan);
        return ResponseEntity.ok(savedPlan);
    }

    /**
     * Delete a saved travel plan
     * @param userId User ID
     * @param planId Travel plan ID
     * @return Success response
     */
    @DeleteMapping("/saved-plans/{userId}/{planId}")
    public ResponseEntity<Map<String, String>> deleteSavedTravelPlan(
            @PathVariable String userId,
            @PathVariable String planId) {

        travelPlannerService.deleteSavedTravelPlan(userId, planId);
        return ResponseEntity.ok(Map.of("message", "Travel plan deleted successfully"));
    }
}