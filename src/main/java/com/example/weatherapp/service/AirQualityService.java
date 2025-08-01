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

    private static final Map<String, String> AQI_DESCRIPTIONS = Map.of(
            "good", "Air quality is considered satisfactory, and air pollution poses little or no risk.",
            "fair", "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.",
            "moderate", "Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
            "poor", "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
            "very_poor", "Health warnings of emergency conditions. The entire population is more likely to be affected.",
            "hazardous", "Health alert: everyone may experience more serious health effects."
    );

    private static final Map<String, String> AQI_COLORS = Map.of(
            "good", "#00E400",
            "fair", "#FFFF00",
            "moderate", "#FF7E00",
            "poor", "#FF0000",
            "very_poor", "#8F3F97",
            "hazardous", "#7E0023"
    );

    private static final Map<String, Integer[]> AQI_THRESHOLDS = Map.of(
            "good", new Integer[]{0, 50},
            "fair", new Integer[]{51, 100},
            "moderate", new Integer[]{101, 150},
            "poor", new Integer[]{151, 200},
            "very_poor", new Integer[]{201, 300},
            "hazardous", new Integer[]{301, 500}
    );


    // --- NEW PUBLIC METHODS FOR CONTROLLER ---

    public AirQualityResponse getCurrentAirQualityByCity(String city) {
        double[] coords = getCoordinatesForCity(city);
        AirQualityData data = getAirQualityDataByCoordinates(coords[0], coords[1], null);
        return convertToAirQualityResponse(data);
    }

    public AirQualityResponse getCurrentAirQualityByLocation(double latitude, double longitude) {
        AirQualityData data = getAirQualityDataByCoordinates(latitude, longitude, null);
        return convertToAirQualityResponse(data);
    }

    public List<AirQualityResponse> getAirQualityForecast(String city, int days) {
        double[] coords = getCoordinatesForCity(city);
        List<AirQualityData> forecastData = fetchAirQualityForecast(coords[0], coords[1], null);
        return forecastData.stream()
                .map(this::convertToAirQualityResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDetailedPollutants(String city) {
        AirQualityResponse currentQuality = getCurrentAirQualityByCity(city);
        Map<String, Object> pollutants = new HashMap<>();
        if (currentQuality.getCurrent() != null) {
            AirQualityResponse.CurrentAirQuality current = currentQuality.getCurrent();
            pollutants.put("co", current.getCo());
            pollutants.put("no2", current.getNo2());
            pollutants.put("o3", current.getO3());
            pollutants.put("so2", current.getSo2());
            pollutants.put("pm2_5", current.getPm25());
            pollutants.put("pm10", current.getPm10());
        }
        return pollutants;
    }

    public List<AirQualityResponse> getAirQualityHistory(String city, int days) {
        double[] coords = getCoordinatesForCity(city);
        LocalDateTime now = LocalDateTime.now();
        long end = now.toEpochSecond(ZoneOffset.UTC);
        long start = now.minusDays(days).toEpochSecond(ZoneOffset.UTC);
        List<AirQualityData> historicalData = fetchHistoricalAirQuality(coords[0], coords[1], start, end, null);
        return historicalData.stream()
                .map(this::convertToAirQualityResponse)
                .collect(Collectors.toList());
    }

    public Map<String, AirQualityResponse> getAirQualityForMultipleCities(List<String> cities) {
        Map<String, AirQualityResponse> results = new HashMap<>();
        for (String city : cities) {
            try {
                results.put(city, getCurrentAirQualityByCity(city));
            } catch (LocationNotFoundException e) {
                logger.warn("Could not find location for city: {}", city);
            }
        }
        return results;
    }

    public Map<String, Object> getHealthRecommendations(String city) {
        AirQualityResponse currentQuality = getCurrentAirQualityByCity(city);
        Map<String, Object> recommendations = new HashMap<>();
        recommendations.put("aqi", currentQuality.getCurrent().getAqi());
        recommendations.put("category", currentQuality.getCurrent().getAqiCategory());
        recommendations.put("recommendations", currentQuality.getHealthRecommendations());
        return recommendations;
    }

    // ... other public methods matching controller endpoints can be built here similarly ...


    // --- CORE DATA FETCHING AND PROCESSING ---

    private AirQualityData getAirQualityDataByCoordinates(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/air_pollution?lat=%f&lon=%f&appid=%s", baseUrl, lat, lon, apiKey);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new WeatherServiceException("No air quality data received from API");
            }
            AirQualityData airQualityData = parseAirQualityResponse(response, userId);
            airQualityRepository.save(airQualityData);
            checkAirQualityAlerts(airQualityData, userId);
            return airQualityData;
        } catch (RestClientException e) {
            throw new WeatherServiceException("Failed to fetch air quality data: " + e.getMessage());
        }
    }

    private List<AirQualityData> fetchAirQualityForecast(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/air_pollution/forecast?lat=%f&lon=%f&appid=%s", baseUrl, lat, lon, apiKey);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new WeatherServiceException("No air quality forecast data received from API");
            }
            return parseHistoricalOrForecastResponse(response, userId);
        } catch (RestClientException e) {
            throw new WeatherServiceException("Failed to fetch air quality forecast data: " + e.getMessage());
        }
    }

    private List<AirQualityData> fetchHistoricalAirQuality(double lat, double lon, long start, long end, String userId) {
        try {
            String url = String.format("%s/air_pollution/history?lat=%f&lon=%f&start=%d&end=%d&appid=%s", baseUrl, lat, lon, start, end, apiKey);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new WeatherServiceException("No historical air quality data received from API");
            }
            return parseHistoricalOrForecastResponse(response, userId);
        } catch (RestClientException e) {
            throw new WeatherServiceException("Failed to fetch historical air quality data: " + e.getMessage());
        }
    }


    // --- HELPER AND PARSING METHODS ---

    private double[] getCoordinatesForCity(String cityName) {
        try {
            String geoUrl = String.format("http://api.openweathermap.org/geo/1.0/direct?q=%s&limit=1&appid=%s", cityName, apiKey);
            List<Map<String, Object>> geoResponse = restTemplate.getForObject(geoUrl, List.class);
            if (geoResponse == null || geoResponse.isEmpty()) {
                throw new LocationNotFoundException("City not found: " + cityName);
            }
            Map<String, Object> location = geoResponse.get(0);
            return new double[]{((Number) location.get("lat")).doubleValue(), ((Number) location.get("lon")).doubleValue()};
        } catch (RestClientException e) {
            throw new WeatherServiceException("Failed to fetch coordinates for city: " + cityName, e);
        }
    }

    private AirQualityResponse convertToAirQualityResponse(AirQualityData data) {
        AirQualityResponse response = new AirQualityResponse();

        response.setLatitude(data.getLatitude());
        response.setLongitude(data.getLongitude());
        response.setLastUpdated(data.getCreatedAt());
        response.setDataSource("OpenWeatherMap");

        AirQualityResponse.CurrentAirQuality current = new AirQualityResponse.CurrentAirQuality();
        current.setAqi(data.getAqi());
        current.setMeasurementTime(data.getDateTime());

        String category = getAqiCategory(data.getAqi());
        current.setAqiCategory(category);
        current.setAqiText(AQI_DESCRIPTIONS.getOrDefault(category, "Unknown"));
        current.setAqiColor(AQI_COLORS.getOrDefault(category, "#808080"));

        if (data.getCo() != null) current.setCo(data.getCo());
        if (data.getNo2() != null) current.setNo2(data.getNo2());
        if (data.getO3() != null) current.setO3(data.getO3());
        if (data.getSo2() != null) current.setSo2(data.getSo2());
        if (data.getPm2_5() != null) current.setPm25(data.getPm2_5());
        if (data.getPm10() != null) current.setPm10(data.getPm10());
        if (data.getNh3() != null) current.setNh3(data.getNh3());

        String dominantPollutant = getDominantPollutant(data);
        current.setDominantPollutant(dominantPollutant);
        current.setDominantPollutantText("The dominant pollutant is currently " + dominantPollutant);
        response.setCurrent(current);

        response.setHealthRecommendations(createHealthRecommendations(data.getAqi()));

        return response;
    }

    private AirQualityData parseAirQualityResponse(Map<String, Object> response, String userId) {
        List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
        if (list == null || list.isEmpty()) {
            throw new WeatherServiceException("API response contained no air quality data points.");
        }
        Map<String, Object> dataPoint = list.get(0);
        AirQualityData airQualityData = new AirQualityData();
        populateAirQualityData(airQualityData, dataPoint, response, userId);
        return airQualityData;
    }

    private List<AirQualityData> parseHistoricalOrForecastResponse(Map<String, Object> response, String userId) {
        List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
        if (list == null) return new ArrayList<>();

        return list.stream().map(dataPoint -> {
            AirQualityData airQualityData = new AirQualityData();
            populateAirQualityData(airQualityData, dataPoint, response, userId);
            return airQualityData;
        }).collect(Collectors.toList());
    }

    private void populateAirQualityData(AirQualityData airQualityData, Map<String, Object> dataPoint, Map<String, Object> fullResponse, String userId) {
        airQualityData.setUserId(userId);
        Map<String, Object> coord = (Map<String, Object>) fullResponse.get("coord");
        airQualityData.setLatitude(((Number) coord.get("lat")).doubleValue());
        airQualityData.setLongitude(((Number) coord.get("lon")).doubleValue());

        long dt = ((Number) dataPoint.get("dt")).longValue();
        airQualityData.setDateTime(LocalDateTime.ofEpochSecond(dt, 0, ZoneOffset.UTC));

        Map<String, Object> main = (Map<String, Object>) dataPoint.get("main");
        airQualityData.setAqi(((Number) main.get("aqi")).intValue());

        Map<String, Object> components = (Map<String, Object>) dataPoint.get("components");
        if (components.get("co") instanceof Number) airQualityData.setCo(((Number) components.get("co")).doubleValue());
        if (components.get("no2") instanceof Number) airQualityData.setNo2(((Number) components.get("no2")).doubleValue());
        if (components.get("o3") instanceof Number) airQualityData.setO3(((Number) components.get("o3")).doubleValue());
        if (components.get("so2") instanceof Number) airQualityData.setSo2(((Number) components.get("so2")).doubleValue());
        if (components.get("pm2_5") instanceof Number) airQualityData.setPm2_5(((Number) components.get("pm2_5")).doubleValue());
        if (components.get("pm10") instanceof Number) airQualityData.setPm10(((Number) components.get("pm10")).doubleValue());
        if (components.get("nh3") instanceof Number) airQualityData.setNh3(((Number) components.get("nh3")).doubleValue());

        airQualityData.setCreatedAt(LocalDateTime.now());
    }

    private AirQualityResponse.HealthRecommendations createHealthRecommendations(int aqi) {
        AirQualityResponse.HealthRecommendations recommendations = new AirQualityResponse.HealthRecommendations();
        String category = getAqiCategory(aqi);
        recommendations.setOverallHealthRisk(category);

        switch (category) {
            case "good":
                recommendations.setGeneralRecommendation("It's a great day for outdoor activities.");
                recommendations.setOutdoorExerciseRecommended(true);
                recommendations.setExerciseRecommendation("recommended");
                break;
            case "fair":
                recommendations.setGeneralRecommendation("Air quality is acceptable. Unusually sensitive individuals should consider reducing prolonged exertion.");
                recommendations.setOutdoorExerciseRecommended(true);
                recommendations.setExerciseRecommendation("acceptable");
                break;
            case "moderate":
                recommendations.setGeneralRecommendation("Sensitive groups may experience health effects. Limit prolonged outdoor exertion.");
                recommendations.setOutdoorExerciseRecommended(false);
                recommendations.setExerciseRecommendation("limit");
                break;
            case "poor":
                recommendations.setGeneralRecommendation("Everyone may experience health effects. Reduce heavy outdoor exertion.");
                recommendations.setMaskRecommended(true);
                recommendations.setMaskType("N95");
                recommendations.setOutdoorExerciseRecommended(false);
                recommendations.setExerciseRecommendation("avoid");
                break;
            case "very_poor":
                recommendations.setGeneralRecommendation("Health warnings of emergency conditions. Avoid all outdoor exertion.");
                recommendations.setAirPurifierRecommended(true);
                recommendations.setMaskRecommended(true);
                recommendations.setMaskType("N95");
                recommendations.setOutdoorExerciseRecommended(false);
                recommendations.setExerciseRecommendation("avoid");
                break;
            case "hazardous":
                recommendations.setGeneralRecommendation("Health alert: everyone may experience more serious health effects. Remain indoors.");
                recommendations.setAirPurifierRecommended(true);
                recommendations.setMaskRecommended(true);
                recommendations.setMaskType("N95/P100");
                recommendations.setOutdoorExerciseRecommended(false);
                recommendations.setExerciseRecommendation("avoid");
                break;
        }
        return recommendations;
    }

    private String getAqiCategory(int aqi) {
        if (aqi <= 50) return "good";
        if (aqi <= 100) return "fair";
        if (aqi <= 150) return "moderate";
        if (aqi <= 200) return "poor";
        if (aqi <= 300) return "very_poor";
        return "hazardous";
    }

    private String getDominantPollutant(AirQualityData data) {
        Map<String, Double> pollutants = new HashMap<>();
        if (data.getPm2_5() != null) pollutants.put("PM2.5", data.getPm2_5() / 15.0);
        if (data.getPm10() != null) pollutants.put("PM10", data.getPm10() / 45.0);
        if (data.getNo2() != null) pollutants.put("NO2", data.getNo2() / 25.0);
        if (data.getO3() != null) pollutants.put("O3", data.getO3() / 100.0);
        if (data.getSo2() != null) pollutants.put("SO2", data.getSo2() / 40.0);
        if (data.getCo() != null) pollutants.put("CO", data.getCo() / 4000.0);

        return pollutants.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");
    }

    private void checkAirQualityAlerts(AirQualityData data, String userId) {
        if (userId == null) return;
        try {
            userRepository.findById(userId).ifPresent(user -> {
                if (user.getAirQualityAlertsEnabled() != null && user.getAirQualityAlertsEnabled()) {
                    String category = getAqiCategory(data.getAqi());
                    if (!category.equals("good") && !category.equals("fair")) {
                        notificationService.sendAirQualityAlert(userId, data.getAqi(), category, AQI_DESCRIPTIONS.get(category));
                    }
                }
            });
        } catch (Exception e) {
            logger.error("Error checking air quality alerts for user: {}", userId, e);
        }
    }
}