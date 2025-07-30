package com.example.weatherapp.controller;



import com.example.weatherapp.dto.ApiResponse;
import com.example.weatherapp.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/weather/comparison")
@CrossOrigin(origins = "*")
public class WeatherComparisonController {

    @Autowired
    private WeatherService weatherService;

    @PostMapping("/cities")
    public ResponseEntity<ApiResponse<WeatherComparisonDto>> compareCities(
            @Valid @RequestBody @NotEmpty(message = "Cities list cannot be empty")
            @Size(min = 2, max = 10, message = "Comparison requires between 2 and 10 cities")
            List<CityComparisonDto> cities) {

        WeatherComparisonDto comparison = weatherService.compareCitiesWeather(cities);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cities weather comparison retrieved successfully", comparison));
    }

    @GetMapping("/current-vs-historical")
    public ResponseEntity<ApiResponse<HistoricalComparisonDto>> compareCurrentVsHistorical(
            @RequestParam String cityName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate historicalDate) {

        HistoricalComparisonDto comparison = weatherService.compareCurrentVsHistorical(cityName, historicalDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Current vs historical comparison retrieved successfully", comparison));
    }

    @PostMapping("/forecast-comparison")
    public ResponseEntity<ApiResponse<List<ForecastComparisonDto>>> compareForecast(
            @Valid @RequestBody ForecastComparisonRequestDto request) {

        List<ForecastComparisonDto> comparison = weatherService.compareForecast(
                request.getCities(),
                request.getDays()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Forecast comparison retrieved successfully", comparison));
    }

    @GetMapping("/seasonal-comparison/{cityName}")
    public ResponseEntity<ApiResponse<SeasonalComparisonDto>> getSeasonalComparison(
            @PathVariable String cityName,
            @RequestParam(defaultValue = "5") int years) {

        SeasonalComparisonDto comparison = weatherService.getSeasonalComparison(cityName, years);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seasonal comparison retrieved successfully", comparison));
    }

    @PostMapping("/real-time-comparison")
    public ResponseEntity<ApiResponse<RealTimeComparisonDto>> getRealTimeComparison(
            @Valid @RequestBody @NotEmpty(message = "Locations list cannot be empty")
            List<LocationDto> locations) {

        RealTimeComparisonDto comparison = weatherService.getRealTimeComparison(locations);
        return ResponseEntity.ok(new ApiResponse<>(true, "Real-time comparison retrieved successfully", comparison));
    }

    @GetMapping("/temperature-trends")
    public ResponseEntity<ApiResponse<TemperatureTrendsDto>> getTemperatureTrends(
            @RequestParam List<String> cities,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        TemperatureTrendsDto trends = weatherService.getTemperatureTrends(cities, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Temperature trends retrieved successfully", trends));
    }

    @PostMapping("/weather-patterns")
    public ResponseEntity<ApiResponse<WeatherPatternsDto>> analyzeWeatherPatterns(
            @Valid @RequestBody WeatherPatternsRequestDto request) {

        WeatherPatternsDto patterns = weatherService.analyzeWeatherPatterns(
                request.getLocations(),
                request.getTimeframe(),
                request.getMetrics()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Weather patterns analyzed successfully", patterns));
    }

    @GetMapping("/climate-comparison")
    public ResponseEntity<ApiResponse<ClimateComparisonDto>> getClimateComparison(
            @RequestParam List<String> cities,
            @RequestParam(defaultValue = "10") int years) {

        ClimateComparisonDto comparison = weatherService.getClimateComparison(cities, years);
        return ResponseEntity.ok(new ApiResponse<>(true, "Climate comparison retrieved successfully", comparison));
    }

    // Inner DTOs for request bodies
    public static class ForecastComparisonRequestDto {
        @Valid
        @NotEmpty(message = "Cities cannot be empty")
        @Size(min = 2, max = 5, message = "Forecast comparison supports 2-5 cities")
        private List<String> cities;

        private int days = 5;

        // Getters and setters
        public List<String> getCities() { return cities; }
        public void setCities(List<String> cities) { this.cities = cities; }
        public int getDays() { return days; }
        public void setDays(int days) { this.days = days; }
    }

    public static class LocationDto {
        private String name;
        private double latitude;
        private double longitude;
        private String timezone;

        // Constructors
        public LocationDto() {}

        public LocationDto(String name, double latitude, double longitude) {
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
        public String getTimezone() { return timezone; }
        public void setTimezone(String timezone) { this.timezone = timezone; }
    }

    public static class WeatherPatternsRequestDto {
        @Valid
        @NotEmpty(message = "Locations cannot be empty")
        private List<LocationDto> locations;

        private String timeframe = "1Y"; // 1Y, 6M, 3M, 1M
        private List<String> metrics;

        // Getters and setters
        public List<LocationDto> getLocations() { return locations; }
        public void setLocations(List<LocationDto> locations) { this.locations = locations; }
        public String getTimeframe() { return timeframe; }
        public void setTimeframe(String timeframe) { this.timeframe = timeframe; }
        public List<String> getMetrics() { return metrics; }
        public void setMetrics(List<String> metrics) { this.metrics = metrics; }
    }
}