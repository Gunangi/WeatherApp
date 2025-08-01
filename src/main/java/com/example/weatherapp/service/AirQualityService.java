package com.example.weatherapp.service;

import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.example.weatherapp.model.AirQualityData;
import com.example.weatherapp.model.User;
import com.example.weatherapp.repository.AirQualityRepository;
import com.example.weatherapp.repository.UserRepository;
import com.example.weatherapp.exception.WeatherServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AirQualityService {

    private static final Logger logger = LoggerFactory.getLogger(AirQualityService.class);

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;

    @Autowired
    private AirQualityRepository airQualityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private NotificationService notificationService;

    // --- PUBLIC-FACING METHODS FOR THE CONTROLLER ---

    public AirQualityResponse getCurrentAirQualityByCity(String city) {
        double[] coords = getCoordinatesForCity(city);
        // The userId is passed as null here. In a real application with security,
        // you would get the authenticated user's ID from the security context.
        AirQualityData data = getAirQualityDataByCoordinates(coords[0], coords[1], null);
        return convertToAirQualityResponse(data);
    }
    public AirQualityResponse getCurrentAirQualityByLocation(double latitude, double longitude) {
        // The userId is passed as null here. In a real application with security,
        // you would get the authenticated user's ID from the security context.
        AirQualityData data = getAirQualityDataByCoordinates(latitude, longitude, null);
        return convertToAirQualityResponse(data);
    }

    // ... Other public methods can be added here ...
// Add these methods to your AirQualityService.java file

    public List<AirQualityResponse> getAirQualityForecast(String city, int days) {
        // TODO: Implement logic to fetch forecast data
        System.out.println("Fetching forecast for " + city + " for " + days + " days.");
        return new ArrayList<>(); // Return an empty list for now
    }

    public Map<String, Object> getDetailedPollutants(String city) {
        // TODO: Implement logic to fetch detailed pollutant data
        System.out.println("Fetching detailed pollutants for " + city);
        return new HashMap<>(); // Return an empty map for now
    }

    public List<AirQualityResponse> getAirQualityHistory(String city, int days) {
        // TODO: Implement logic to fetch historical data
        System.out.println("Fetching history for " + city + " for " + days + " days.");
        return new ArrayList<>(); // Return an empty list for now
    }

    // --- CORE DATA FETCHING AND PROCESSING ---

    private AirQualityData getAirQualityDataByCoordinates(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/air_pollution?lat=%f&lon=%f&appid=%s", baseUrl, lat, lon, apiKey);

            // Using ParameterizedTypeReference for type safety with RestTemplate
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            Map<String, Object> response = responseEntity.getBody();

            if (response == null) {
                throw new WeatherServiceException("No air quality data received from API");
            }
            AirQualityData airQualityData = parseAndPopulateAirQualityData(response, userId);
            airQualityRepository.save(airQualityData);
            checkAirQualityAlerts(airQualityData, userId);
            return airQualityData;
        } catch (RestClientException e) {
            throw new WeatherServiceException("Failed to fetch air quality data: " + e.getMessage());
        }
    }


    // --- HELPER AND PARSING METHODS ---

    private double[] getCoordinatesForCity(String cityName) {
        try {
            String geoUrl = String.format("http://api.openweathermap.org/geo/1.0/direct?q=%s&limit=1&appid=%s", cityName, apiKey);

            // Using ParameterizedTypeReference to fix unchecked cast warnings
            ResponseEntity<List<Map<String, Object>>> responseEntity = restTemplate.exchange(
                    geoUrl, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            List<Map<String, Object>> geoResponse = responseEntity.getBody();

            if (geoResponse == null || geoResponse.isEmpty()) {
                throw new LocationNotFoundException("City not found: " + cityName);
            }
            Map<String, Object> location = geoResponse.get(0);
            return new double[]{((Number) location.get("lat")).doubleValue(), ((Number) location.get("lon")).doubleValue()};
        } catch (RestClientException e) {
            throw new WeatherServiceException("Failed to fetch coordinates for city: " + cityName, e);
        }
    }

    private AirQualityData parseAndPopulateAirQualityData(Map<String, Object> response, String userId) {
        List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
        if (list == null || list.isEmpty()) {
            throw new WeatherServiceException("API response contained no air quality data points.");
        }
        Map<String, Object> dataPoint = list.get(0);
        AirQualityData model = new AirQualityData();

        Map<String, Object> coord = (Map<String, Object>) response.get("coord");
        model.setLatitude(((Number) coord.get("lat")).doubleValue());
        model.setLongitude(((Number) coord.get("lon")).doubleValue());
        model.setTimestamp(LocalDateTime.ofEpochSecond(((Number) dataPoint.get("dt")).longValue(), 0, ZoneOffset.UTC));
        model.setDataSource("OpenWeatherMap");

        Map<String, Object> main = (Map<String, Object>) dataPoint.get("main");
        int aqiValue = ((Number) main.get("aqi")).intValue();
        model.setOverallAqi(aqiValue);

        Map<String, Object> components = (Map<String, Object>) dataPoint.get("components");
        if (components.get("pm2_5") instanceof Number) model.getPm2_5().setConcentration(((Number) components.get("pm2_5")).doubleValue());
        if (components.get("pm10") instanceof Number) model.getPm10().setConcentration(((Number) components.get("pm10")).doubleValue());

        model.setHealthRecommendations(createModelHealthRecommendations(aqiValue));
        model.setDominantPollutant(determineDominantPollutant(model));

        return model;
    }

    private AirQualityResponse convertToAirQualityResponse(AirQualityData data) {
        AirQualityResponse response = new AirQualityResponse();
        response.setCityName(data.getCityName());
        response.setLatitude(data.getLatitude());
        response.setLongitude(data.getLongitude());

        AirQualityResponse.CurrentAirQuality currentDto = new AirQualityResponse.CurrentAirQuality();
        currentDto.setAqi(data.getOverallAqi());
        if (data.getAqiCategory() != null) {
            currentDto.setAqiCategory(data.getAqiCategory().name().toLowerCase());
            currentDto.setAqiText(data.getAqiCategory().getDescription());
            currentDto.setAqiColor(data.getAqiCategory().getColorCode());
        }
        if (data.getPm2_5() != null) currentDto.setPm25(data.getPm2_5().getConcentration());
        if (data.getPm10() != null) currentDto.setPm10(data.getPm10().getConcentration());
        response.setCurrent(currentDto);

        response.setHealthRecommendations(createDtoHealthRecommendations(data.getHealthRecommendations()));

        return response;
    }

    private AirQualityData.HealthRecommendations createModelHealthRecommendations(int aqi) {
        AirQualityData.HealthRecommendations recs = new AirQualityData.HealthRecommendations();
        AirQualityData.AirQualityCategory category = AirQualityData.AirQualityCategory.fromAqi(aqi);
        recs.setGeneralPopulation(category.getDescription());
        return recs;
    }

    private AirQualityResponse.HealthRecommendations createDtoHealthRecommendations(AirQualityData.HealthRecommendations modelRecs) {
        AirQualityResponse.HealthRecommendations dtoRecs = new AirQualityResponse.HealthRecommendations();
        if (modelRecs != null) {
            dtoRecs.setGeneralRecommendation(modelRecs.getGeneralPopulation());
        }
        return dtoRecs;
    }

    private String determineDominantPollutant(AirQualityData data) {
        Map<String, Double> pollutantConcentrations = new HashMap<>();
        if(data.getPm2_5() != null && data.getPm2_5().getConcentration() != null) pollutantConcentrations.put("PM2.5", data.getPm2_5().getConcentration());
        if(data.getPm10() != null && data.getPm10().getConcentration() != null) pollutantConcentrations.put("PM10", data.getPm10().getConcentration());

        if (pollutantConcentrations.isEmpty()) {
            return "Unknown";
        }
        return Collections.max(pollutantConcentrations.entrySet(), Map.Entry.comparingByValue()).getKey();
    }

    /**
     * Checks for alerts and calls the NotificationService.
     * This method is now corrected to work with the provided User and NotificationService models.
     */
    private void checkAirQualityAlerts(AirQualityData data, String userId) {
        if (userId == null || data.getAqiCategory() == null) return;

        try {
            userRepository.findById(userId).ifPresent(user -> {
                // FIX 1: Accessing the nested NotificationSettings object
                if (user.getNotificationSettings() != null && user.getNotificationSettings().isAirQualityAlertsEnabled()) {
                    // Trigger alert if the category is UNHEALTHY_FOR_SENSITIVE or worse
                    if (data.isSensitiveGroupAlert()) {
                        String severity = "MEDIUM";
                        if (data.getAqiCategory() == AirQualityData.AirQualityCategory.UNHEALTHY) severity = "HIGH";
                        if (data.getAqiCategory() == AirQualityData.AirQualityCategory.VERY_UNHEALTHY || data.getAqiCategory() == AirQualityData.AirQualityCategory.HAZARDOUS) severity = "CRITICAL";

                        String message = String.format("Air quality in your area is now %s (AQI: %d).",
                                data.getAqiCategory().getDescription(), data.getOverallAqi());

                        // FIX 2: Calling the correct 'createWeatherAlert' method
                        notificationService.createWeatherAlert(
                                userId,
                                "AIR_QUALITY_ALERT",
                                "Air Quality Alert: " + data.getAqiCategory().name(),
                                message,
                                severity,
                                Map.of("aqi", data.getOverallAqi(), "category", data.getAqiCategory().name())
                        );
                    }
                }
            });
        } catch (Exception e) {
            logger.error("Error checking air quality alerts for user: {}", userId, e);
        }
    }
}