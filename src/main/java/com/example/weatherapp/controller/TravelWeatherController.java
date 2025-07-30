package com.example.weatherapp.controller;

import com.example.weatherapp.dto.TravelDestinationDto;
import com.example.weatherapp.dto.TravelRecommendationDto;
import com.example.weatherapp.dto.MultiDestinationWeatherDto;
import com.example.weatherapp.dto.TravelComparisonDto;
import com.example.weatherapp.dto.ApiResponse;
import com.example.weatherapp.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/travel")
@CrossOrigin(origins = "*")
public class TravelWeatherController {

    @Autowired
    private WeatherService weatherService;

    @PostMapping("/multi-destination")
    public ResponseEntity<ApiResponse<List<MultiDestinationWeatherDto>>> getMultiDestinationWeather(
            @Valid @RequestBody @NotEmpty(message = "Destinations list cannot be empty")
            List<TravelDestinationDto> destinations) {

        List<MultiDestinationWeatherDto> weatherData = weatherService.getMultiDestinationWeather(destinations);
        return ResponseEntity.ok(new ApiResponse<>(true, "Multi-destination weather retrieved successfully", weatherData));
    }

    @PostMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<TravelRecommendationDto>>> getTravelRecommendations(
            @Valid @RequestBody TravelPlanDto travelPlan) {

        List<TravelRecommendationDto> recommendations = weatherService.getTravelRecommendations(
                travelPlan.getDestinations(),
                travelPlan.getTravelDates(),
                travelPlan.getPreferences()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Travel recommendations retrieved successfully", recommendations));
    }

    @GetMapping("/weather-for-dates")
    public ResponseEntity<ApiResponse<Object>> getWeatherForDates(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Object weatherData = weatherService.getWeatherForDateRange(lat, lon, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Weather for specified dates retrieved successfully", weatherData));
    }

    @PostMapping("/comparison")
    public ResponseEntity<ApiResponse<TravelComparisonDto>> getTravelComparison(
            @Valid @RequestBody TravelComparisonRequestDto request) {

        if (request.getDestinations().size() < 2) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "At least 2 destinations are required for comparison", null)
            );
        }

        TravelComparisonDto comparison = weatherService.getTravelComparison(
                request.getDestinations(),
                request.getDate()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Travel comparison retrieved successfully", comparison));
    }

    @GetMapping("/best-time/{cityName}")
    public ResponseEntity<ApiResponse<BestTimeToTravelDto>> getBestTimeToTravel(
            @PathVariable String cityName,
            @RequestParam(required = false) String activityType) {

        BestTimeToTravelDto bestTime = weatherService.getBestTimeToTravel(cityName, activityType);
        return ResponseEntity.ok(new ApiResponse<>(true, "Best time to travel retrieved successfully", bestTime));
    }

    @PostMapping("/itinerary-weather")
    public ResponseEntity<ApiResponse<List<ItineraryWeatherDto>>> getItineraryWeather(
            @Valid @RequestBody TravelItineraryDto itinerary) {

        List<ItineraryWeatherDto> itineraryWeather = weatherService.getItineraryWeather(itinerary);
        return ResponseEntity.ok(new ApiResponse<>(true, "Itinerary weather retrieved successfully", itineraryWeather));
    }

    @GetMapping("/seasonal-recommendations/{cityName}")
    public ResponseEntity<ApiResponse<SeasonalRecommendationsDto>> getSeasonalRecommendations(
            @PathVariable String cityName) {

        SeasonalRecommendationsDto seasonalRecs = weatherService.getSeasonalRecommendations(cityName);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seasonal recommendations retrieved successfully", seasonalRecs));
    }

    @PostMapping("/packing-suggestions")
    public ResponseEntity<ApiResponse<PackingSuggestionsDto>> getPackingSuggestions(
            @Valid @RequestBody PackingRequestDto request) {

        PackingSuggestionsDto suggestions = weatherService.getPackingSuggestions(
                request.getDestination(),
                request.getTravelDates(),
                request.getActivities()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Packing suggestions retrieved successfully", suggestions));
    }

    // Inner DTOs for request bodies
    public static class TravelPlanDto {
        @Valid
        @NotEmpty(message = "Destinations cannot be empty")
        private List<TravelDestinationDto> destinations;

        @Valid
        private TravelDatesDto travelDates;

        private TravelPreferencesDto preferences;

        // Getters and setters
        public List<TravelDestinationDto> getDestinations() { return destinations; }
        public void setDestinations(List<TravelDestinationDto> destinations) { this.destinations = destinations; }
        public TravelDatesDto getTravelDates() { return travelDates; }
        public void setTravelDates(TravelDatesDto travelDates) { this.travelDates = travelDates; }
        public TravelPreferencesDto getPreferences() { return preferences; }
        public void setPreferences(TravelPreferencesDto preferences) { this.preferences = preferences; }
    }

    public static class TravelComparisonRequestDto {
        @Valid
        @NotEmpty(message = "Destinations cannot be empty")
        private List<TravelDestinationDto> destinations;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate date;

        // Getters and setters
        public List<TravelDestinationDto> getDestinations() { return destinations; }
        public void setDestinations(List<TravelDestinationDto> destinations) { this.destinations = destinations; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
    }

    public static class TravelItineraryDto {
        @Valid
        @NotEmpty(message = "Itinerary items cannot be empty")
        private List<ItineraryItemDto> items;

        // Getters and setters
        public List<ItineraryItemDto> getItems() { return items; }
        public void setItems(List<ItineraryItemDto> items) { this.items = items; }
    }

    public static class PackingRequestDto {
        @Valid
        private TravelDestinationDto destination;

        @Valid
        private TravelDatesDto travelDates;

        private List<String> activities;

        // Getters and setters
        public TravelDestinationDto getDestination() { return destination; }
        public void setDestination(TravelDestinationDto destination) { this.destination = destination; }
        public TravelDatesDto getTravelDates() { return travelDates; }
        public void setTravelDates(TravelDatesDto travelDates) { this.travelDates = travelDates; }
        public List<String> getActivities() { return activities; }
        public void setActivities(List<String> activities) { this.activities = activities; }
    }
}
