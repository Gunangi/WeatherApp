package com.example.weatherapp.service;

import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.model.AirQualityData;
import com.example.weatherapp.model.User;
import com.example.weatherapp.repository.AirQualityRepository;
import com.example.weatherapp.repository.UserRepository;
import com.example.weatherapp.exception.WeatherServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;

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

    // Air Quality Index thresholds and categories
    private static final Map<String, Integer[]> AQI_THRESHOLDS = Map.of(
            "good", new Integer[]{0, 50},
            "fair", new Integer[]{51, 100},
            "moderate", new Integer[]{101, 150},
            "poor", new Integer[]{151, 200},
            "very_poor", new Integer[]{201, 300},
            "hazardous", new Integer[]{301, 500}
    );

    private static final Map<String, String> AQI_DESCRIPTIONS = Map.of(
            "good", "Air quality is considered satisfactory, and air pollution poses little or no risk",
            "fair", "Air quality is acceptable; however, there may be a concern for some people who are unusually sensitive to air pollution",
            "moderate", "Members of sensitive groups may experience health effects. The general public is not likely to be affected",
            "poor", "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects",
            "very_poor", "Health warnings of emergency conditions. The entire population is more likely to be affected",
            "hazardous", "Health alert: everyone may experience more serious health effects"
    );

    private static final Map<String, String> AQI_COLORS = Map.of(
            "good", "#00E400",
            "fair", "#FFFF00",
            "moderate", "#FF7E00",
            "poor", "#FF0000",
            "very_poor", "#8F3F97",
            "hazardous", "#7E0023"
    );

    /**
     * Get air quality data by city name
     */
    public AirQualityResponse getAirQualityByCity(String cityName, String userId) {
        try {
            // First get coordinates for the city
            String geoUrl = String.format("http://api.openweathermap.org/geo/1.0/direct?q=%s&limit=1&appid=%s",
                    cityName, apiKey);

            List<Map<String, Object>> geoResponse = restTemplate.getForObject(geoUrl, List.class);

            if (geoResponse == null || geoResponse.isEmpty()) {
                throw new WeatherServiceException("City not found: " + cityName);
            }

            Map<String, Object> location = geoResponse.get(0);
            double lat = ((Number) location.get("lat")).doubleValue();
            double lon = ((Number) location.get("lon")).doubleValue();

            return getAirQualityByCoordinates(lat, lon, userId);

        } catch (RestClientException e) {
            logger.error("Error fetching air quality data for city: {}", cityName, e);
            throw new WeatherServiceException("Failed to fetch air quality data: " + e.getMessage());
        }
    }

    /**
     * Get air quality data by coordinates
     */
    public AirQualityResponse getAirQualityByCoordinates(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/air_pollution?lat=%f&lon=%f&appid=%s",
                    baseUrl, lat, lon, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No air quality data received from API");
            }

            AirQualityData airQualityData = parseAirQualityResponse(response, userId);

            // Save to database
            airQualityRepository.save(airQualityData);

            // Check for air quality alerts
            checkAirQualityAlerts(airQualityData, userId);

            return convertToAirQualityResponse(airQualityData);

        } catch (RestClientException e) {
            logger.error("Error fetching air quality data for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch air quality data: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in getAirQualityByCoordinates", e);
            throw new WeatherServiceException("Unexpected error occurred");
        }
    }

    /**
     * Get historical air quality data
     */
    public List<AirQualityResponse> getHistoricalAirQuality(double lat, double lon, long start, long end, String userId) {
        try {
            String url = String.format("%s/air_pollution/history?lat=%f&lon=%f&start=%d&end=%d&appid=%s",
                    baseUrl, lat, lon, start, end, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No historical air quality data received from API");
            }

            List<AirQualityData> historicalData = parseHistoricalAirQualityResponse(response, userId);

            // Save to database
            airQualityRepository.saveAll(historicalData);

            return historicalData.stream()
                    .map(this::convertToAirQualityResponse)
                    .collect(ArrayList::new, (list, item) -> list.add(item), (list1, list2) -> list1.addAll(list2));

        } catch (RestClientException e) {
            logger.error("Error fetching historical air quality data", e);
            throw new WeatherServiceException("Failed to fetch historical air quality data: " + e.getMessage());
        }
    }

    /**
     * Get air quality forecast
     */
    public List<AirQualityResponse> getAirQualityForecast(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/air_pollution/forecast?lat=%f&lon=%f&appid=%s",
                    baseUrl, lat, lon, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No air quality forecast data received from API");
            }

            List<AirQualityData> forecastData = parseHistoricalAirQualityResponse(response, userId);

            // Save to database
            airQualityRepository.saveAll(forecastData);

            return forecastData.stream()
                    .map(this::convertToAirQualityResponse)
                    .collect(ArrayList::new, (list, item) -> list.add(item), (list1, list2) -> list1.addAll(list2));

        } catch (RestClientException e) {
            logger.error("Error fetching air quality forecast data", e);
            throw new WeatherServiceException("Failed to fetch air quality forecast data: " + e.getMessage());
        }
    }

    /**
     * Parse air quality API response
     */
    private AirQualityData parseAirQualityResponse(Map<String, Object> response, String userId) {
        AirQualityData airQualityData = new AirQualityData();

        try {
            airQualityData.setUserId(userId);

            // Coordinates
            Map<String, Object> coord = (Map<String, Object>) response.get("coord");
            airQualityData.setLatitude(((Number) coord.get("lat")).doubleValue());
            airQualityData.setLongitude(((Number) coord.get("lon")).doubleValue());

            // Air quality data
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
            if (!list.isEmpty()) {
                Map<String, Object> data = list.get(0);

                // Date/time
                long dt = ((Number) data.get("dt")).longValue();
                airQualityData.setDateTime(LocalDateTime.ofEpochSecond(dt, 0,
                        java.time.ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now())));

                // Main AQI
                Map<String, Object> main = (Map<String, Object>) data.get("main");
                airQualityData.setAqi(((Number) main.get("aqi")).intValue());

                // Components (pollutants in μg/m³)
                Map<String, Object> components = (Map<String, Object>) data.get("components");
                if (components.get("co") != null) {
                    airQualityData.setCo(((Number) components.get("co")).doubleValue());
                }
                if (components.get("no") != null) {
                    airQualityData.setNo(((Number) components.get("no")).doubleValue());
                }
                if (components.get("no2") != null) {
                    airQualityData.setNo2(((Number) components.get("no2")).doubleValue());
                }
                if (components.get("o3") != null) {
                    airQualityData.setO3(((Number) components.get("o3")).doubleValue());
                }
                if (components.get("so2") != null) {
                    airQualityData.setSo2(((Number) components.get("so2")).doubleValue());
                }
                if (components.get("pm2_5") != null) {
                    airQualityData.setPm2_5(((Number) components.get("pm2_5")).doubleValue());
                }
                if (components.get("pm10") != null) {
                    airQualityData.setPm10(((Number) components.get("pm10")).doubleValue());
                }
                if (components.get("nh3") != null) {
                    airQualityData.setNh3(((Number) components.get("nh3")).doubleValue());
                }
            }

            airQualityData.setCreatedAt(LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error parsing air quality response", e);
            throw new WeatherServiceException("Failed to parse air quality data");
        }

        return airQualityData;
    }

    /**
     * Parse historical/forecast air quality API response
     */
    private List<AirQualityData> parseHistoricalAirQualityResponse(Map<String, Object> response, String userId) {
        List<AirQualityData> dataList = new ArrayList<>();

        try {
            // Coordinates
            Map<String, Object> coord = (Map<String, Object>) response.get("coord");
            double latitude = ((Number) coord.get("lat")).doubleValue();
            double longitude = ((Number) coord.get("lon")).doubleValue();

            // Air quality data list
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");

            for (Map<String, Object> data : list) {
                AirQualityData airQualityData = new AirQualityData();

                airQualityData.setUserId(userId);
                airQualityData.setLatitude(latitude);
                airQualityData.setLongitude(longitude);

                // Date/time
                long dt = ((Number) data.get("dt")).longValue();
                airQualityData.setDateTime(LocalDateTime.ofEpochSecond(dt, 0,
                        java.time.ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now())));

                // Main AQI
                Map<String, Object> main = (Map<String, Object>) data.get("main");
                airQualityData.setAqi(((Number) main.get("aqi")).intValue());

                // Components
                Map<String, Object> components = (Map<String, Object>) data.get("components");
                if (components.get("co") != null) {
                    airQualityData.setCo(((Number) components.get("co")).doubleValue());
                }
                if (components.get("no") != null) {
                    airQualityData.setNo(((Number) components.get("no")).doubleValue());
                }
                if (components.get("no2") != null) {
                    airQualityData.setNo2(((Number) components.get("no2")).doubleValue());
                }
                if (components.get("o3") != null) {
                    airQualityData.setO3(((Number) components.get("o3")).doubleValue());
                }
                if (components.get("so2") != null) {
                    airQualityData.setSo2(((Number) components.get("so2")).doubleValue());
                }
                if (components.get("pm2_5") != null) {
                    airQualityData.setPm2_5(((Number) components.get("pm2_5")).doubleValue());
                }
                if (components.get("pm10") != null) {
                    airQualityData.setPm10(((Number) components.get("pm10")).doubleValue());
                }
                if (components.get("nh3") != null) {
                    airQualityData.setNh3(((Number) components.get("nh3")).doubleValue());
                }

                airQualityData.setCreatedAt(LocalDateTime.now());
                dataList.add(airQualityData);
            }

        } catch (Exception e) {
            logger.error("Error parsing historical air quality response", e);
            throw new WeatherServiceException("Failed to parse historical air quality data");
        }

        return dataList;
    }

    /**
     * Convert AirQualityData to AirQualityResponse DTO
     */
    private AirQualityResponse convertToAirQualityResponse(AirQualityData data) {
        AirQualityResponse response = new AirQualityResponse();

        response.setLatitude(data.getLatitude());
        response.setLongitude(data.getLongitude());
        response.setDateTime(data.getDateTime());
        response.setAqi(data.getAqi());

        // Set AQI category and metadata
        String category = getAqiCategory(data.getAqi());
        response.setAqiCategory(category);
        response.setAqiDescription(AQI_DESCRIPTIONS.get(category));
        response.setAqiColor(AQI_COLORS.get(category));

        // Pollutant concentrations
        response.setCo(data.getCo());
        response.setNo(data.getNo());
        response.setNo2(data.getNo2());
        response.setO3(data.getO3());
        response.setSo2(data.getSo2());
        response.setPm2_5(data.getPm2_5());
        response.setPm10(data.getPm10());
        response.setNh3(data.getNh3());

        // Health recommendations
        response.setHealthRecommendations(getHealthRecommendations(data.getAqi()));

        // Dominant pollutant
        response.setDominantPollutant(getDominantPollutant(data));

        response.setCreatedAt(data.getCreatedAt());

        return response;
    }

    /**
     * Get AQI category based on index value
     */
    private String getAqiCategory(int aqi) {
        for (Map.Entry<String, Integer[]> entry : AQI_THRESHOLDS.entrySet()) {
            Integer[] range = entry.getValue();
            if (aqi >= range[0] && aqi <= range[1]) {
                return entry.getKey();
            }
        }
        return "hazardous"; // Default for values above 500
    }

    /**
     * Get health recommendations based on AQI
     */
    private List<String> getHealthRecommendations(int aqi) {
        List<String> recommendations = new ArrayList<>();

        String category = getAqiCategory(aqi);

        switch (category) {
            case "good":
                recommendations.add("Air quality is good. Enjoy outdoor activities.");
                break;
            case "fair":
                recommendations.add("Air quality is acceptable for most people.");
                recommendations.add("Sensitive individuals may want to limit prolonged outdoor exertion.");
                break;
            case "moderate":
                recommendations.add("Sensitive groups should reduce prolonged outdoor exertion.");
                recommendations.add("Everyone else can enjoy normal outdoor activities.");
                break;
            case "poor":
                recommendations.add("Everyone should reduce prolonged outdoor exertion.");
                recommendations.add("Sensitive groups should avoid prolonged outdoor exertion.");
                recommendations.add("Consider wearing a mask when outdoors.");
                break;
            case "very_poor":
                recommendations.add("Everyone should avoid prolonged outdoor exertion.");
                recommendations.add("Sensitive groups should remain indoors.");
                recommendations.add("Wear a mask when outdoors is highly recommended.");
                break;
            case "hazardous":
                recommendations.add("Everyone should avoid all outdoor activities.");
                recommendations.add("Remain indoors and keep windows closed.");
                recommendations.add("Use air purifiers if available.");
                recommendations.add("Seek medical attention if you experience breathing difficulties.");
                break;
        }

        return recommendations;
    }

    /**
     * Determine the dominant pollutant
     */
    private String getDominantPollutant(AirQualityData data) {
        Map<String, Double> pollutants = new HashMap<>();

        // Normalize pollutant values to comparable scale (relative to WHO guidelines)
        if (data.getPm2_5() != null) pollutants.put("PM2.5", data.getPm2_5() / 15.0); // WHO guideline: 15 μg/m³
        if (data.getPm10() != null) pollutants.put("PM10", data.getPm10() / 45.0); // WHO guideline: 45 μg/m³
        if (data.getNo2() != null) pollutants.put("NO2", data.getNo2() / 25.0); // WHO guideline: 25 μg/m³
        if (data.getO3() != null) pollutants.put("O3", data.getO3() / 100.0); // WHO guideline: 100 μg/m³
        if (data.getSo2() != null) pollutants.put("SO2", data.getSo2() / 40.0); // WHO guideline: 40 μg/m³
        if (data.getCo() != null) pollutants.put("CO", data.getCo() / 4000.0); // WHO guideline: 4000 μg/m³

        return pollutants.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");
    }

    /**
     * Check for air quality alerts and send notifications
     */
    private void checkAirQualityAlerts(AirQualityData data, String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // Check if user wants air quality notifications
                if (user.getAirQualityAlertsEnabled() != null && user.getAirQualityAlertsEnabled()) {
                    String category = getAqiCategory(data.getAqi());

                    // Send alert for moderate or worse air quality
                    if (Arrays.asList("moderate", "poor", "very_poor", "hazardous").contains(category)) {
                        notificationService.sendAirQualityAlert(userId, data.getAqi(), category,
                                AQI_DESCRIPTIONS.get(category));
                    }

                    // Check specific pollutant thresholds
                    checkPollutantThresholds(data, userId);
                }
            }
        } catch (Exception e) {
            logger.error("Error checking air quality alerts for user: {}", userId, e);
        }
    }

    /**
     * Check individual pollutant thresholds
     */
    private void checkPollutantThresholds(AirQualityData data, String userId) {
        // PM2.5 threshold (WHO guideline: 15 μg/m³ annual, 45 μg/m³ 24-hour)
        if (data.getPm2_5() != null && data.getPm2_5() > 45.0) {
            notificationService.sendPollutantAlert(userId, "PM2.5", data.getPm2_5(), 45.0);
        }

        // PM10 threshold (WHO guideline: 45 μg/m³ annual, 90 μg/m³ 24-hour)
        if (data.getPm10() != null && data.getPm10() > 90.0) {
            notificationService.sendPollutantAlert(userId, "PM10", data.getPm10(), 90.0);
        }

        // NO2 threshold (WHO guideline: 25 μg/m³ annual, 200 μg/m³ 1-hour)
        if (data.getNo2() != null && data.getNo2() > 200.0) {
            notificationService.sendPollutantAlert(userId, "NO2", data.getNo2(), 200.0);
        }

        // O3 threshold (WHO guideline: 100 μg/m³ 8-hour)
        if (data.getO3() != null && data.getO3() > 100.0) {
            notificationService.sendPollutantAlert(userId, "O3", data.getO3(), 100.0);
        }
    }

    /**
     * Get cached air quality data if available and recent
     */
    public Optional<AirQualityResponse> getCachedAirQuality(double lat, double lon, String userId) {
        Optional<AirQualityData> cachedData = airQualityRepository
                .findTopByLatitudeAndLongitudeAndUserIdOrderByCreatedAtDesc(lat, lon, userId);

        if (cachedData.isPresent()) {
            AirQualityData data = cachedData.get();
            // Return cached data if it's less than 30 minutes old
            if (data.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(30))) {
                return Optional.of(convertToAirQualityResponse(data));
            }
        }

        return Optional.empty();
    }

    /**
     * Get air quality summary for multiple locations
     */
    public Map<String, AirQualityResponse> getMultipleLocationsAirQuality(Map<String, double[]> locations, String userId) {
        Map<String, AirQualityResponse> airQualityMap = new HashMap<>();

        for (Map.Entry<String, double[]> entry : locations.entrySet()) {
            try {
                double[] coords = entry.getValue();
                AirQualityResponse airQuality = getAirQualityByCoordinates(coords[0], coords[1], userId);
                airQualityMap.put(entry.getKey(), airQuality);
            } catch (Exception e) {
                logger.error("Failed to get air quality for location: {}", entry.getKey(), e);
                // Continue with other locations
            }
        }

        return airQualityMap;
    }

    /**
     * Get air quality trend analysis
     */
    public Map<String, Object> getAirQualityTrend(double lat, double lon, String userId, int days) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusDays(days);

        long start = startTime.toEpochSecond(java.time.ZoneId.systemDefault().getRules().getOffset(startTime));
        long end = endTime.toEpochSecond(java.time.ZoneId.systemDefault().getRules().getOffset(endTime));

        List<AirQualityResponse> historicalData = getHistoricalAirQuality(lat, lon, start, end, userId);

        Map<String, Object> trend = new HashMap<>();

        if (!historicalData.isEmpty()) {
            // Calculate average AQI
            double avgAqi = historicalData.stream()
                    .mapToDouble(AirQualityResponse::getAqi)
                    .average().orElse(0);

            // Find best and worst days
            AirQualityResponse bestDay = historicalData.stream()
                    .min(Comparator.comparingInt(AirQualityResponse::getAqi))
                    .orElse(null);

            AirQualityResponse worstDay = historicalData.stream()
                    .max(Comparator.comparingInt(AirQualityResponse::getAqi))
                    .orElse(null);

            // Calculate trend direction
            List<AirQualityResponse> sortedData = historicalData.stream()
                    .sorted(Comparator.comparing(AirQualityResponse::getDateTime))
                    .collect(ArrayList::new, (list, item) -> list.add(item), (list1, list2) -> list1.addAll(list2));

            String trendDirection = "stable";
            if (sortedData.size() > 1) {
                double firstHalfAvg = sortedData.subList(0, sortedData.size() / 2).stream()
                        .mapToDouble(AirQualityResponse::getAqi)
                        .average().orElse(0);

                double secondHalfAvg = sortedData.subList(sortedData.size() / 2, sortedData.size()).stream()
                        .mapToDouble(AirQualityResponse::getAqi)
                        .average().orElse(0);

                double change = secondHalfAvg - firstHalfAvg;
                if (change > 10) trendDirection = "worsening";
                else if (change < -10) trendDirection = "improving";
            }

            trend.put("averageAqi", Math.round(avgAqi));
            trend.put("averageCategory", getAqiCategory((int) Math.round(avgAqi)));
            trend.put("bestDay", bestDay);
            trend.put("worstDay", worstDay);
            trend.put("trendDirection", trendDirection);
            trend.put("totalDataPoints", historicalData.size());
        }

        return trend;
    }

    /**
     * Get air quality statistics
     */
    public Map<String, Object> getAirQualityStatistics(double lat, double lon, String userId, int days) {
        Map<String, Object> trend = getAirQualityTrend(lat, lon, userId, days);

        // Get current data for context
        AirQualityResponse current = getAirQualityByCoordinates(lat, lon, userId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("current", current);
        stats.put("trend", trend);

        // Calculate category distribution
        if (trend.get("totalDataPoints") != null && (Integer) trend.get("totalDataPoints") > 0) {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(days);

            long start = startTime.toEpochSecond(java.time.ZoneId.systemDefault().getRules().getOffset(startTime));
            long end = endTime.toEpochSecond(java.time.ZoneId.systemDefault().getRules().getOffset(endTime));

            List<AirQualityResponse> historicalData = getHistoricalAirQuality(lat, lon, start, end, userId);

            Map<String, Long> categoryDistribution = historicalData.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            AirQualityResponse::getAqiCategory,
                            java.util.stream.Collectors.counting()));

            stats.put("categoryDistribution", categoryDistribution);

            // Calculate pollutant averages
            Map<String, Double> pollutantAverages = new HashMap<>();

            double avgPm25 = historicalData.stream()
                    .filter(d -> d.getPm2_5() != null)
                    .mapToDouble(AirQualityResponse::getPm2_5)
                    .average().orElse(0);

            double avgPm10 = historicalData.stream()
                    .filter(d -> d.getPm10() != null)
                    .mapToDouble(AirQualityResponse::getPm10)
                    .average().orElse(0);

            double avgNo2 = historicalData.stream()
                    .filter(d -> d.getNo2() != null)
                    .mapToDouble(AirQualityResponse::getNo2)
                    .average().orElse(0);

            double avgO3 = historicalData.stream()
                    .filter(d -> d.getO3() != null)
                    .mapToDouble(AirQualityResponse::getO3)
                    .average().orElse(0);

            if (avgPm25 > 0) pollutantAverages.put("PM2.5", Math.round(avgPm25 * 10.0) / 10.0);
            if (avgPm10 > 0) pollutantAverages.put("PM10", Math.round(avgPm10 * 10.0) / 10.0);
            if (avgNo2 > 0) pollutantAverages.put("NO2", Math.round(avgNo2 * 10.0) / 10.0);
            if (avgO3 > 0) pollutantAverages.put("O3", Math.round(avgO3 * 10.0) / 10.0);

            stats.put("pollutantAverages", pollutantAverages);
        }

        return stats;
    }

    /**
     * Get air quality recommendations for outdoor activities
     */
    public Map<String, Object> getActivityRecommendations(AirQualityResponse airQuality) {
        Map<String, Object> recommendations = new HashMap<>();

        String category = airQuality.getAqiCategory();
        int aqi = airQuality.getAqi();

        // General activity recommendations
        Map<String, String> activities = new HashMap<>();

        switch (category) {
            case "good":
                activities.put("outdoor_exercise", "recommended");
                activities.put("children_outdoor_play", "recommended");
                activities.put("window_opening", "recommended");
                activities.put("outdoor_events", "recommended");
                break;
            case "fair":
                activities.put("outdoor_exercise", "acceptable");
                activities.put("children_outdoor_play", "acceptable");
                activities.put("window_opening", "acceptable");
                activities.put("outdoor_events", "acceptable");
                break;
            case "moderate":
                activities.put("outdoor_exercise", "limited_for_sensitive");
                activities.put("children_outdoor_play", "limited_for_sensitive");
                activities.put("window_opening", "consider_closing");
                activities.put("outdoor_events", "acceptable_with_precautions");
                break;
            case "poor":
                activities.put("outdoor_exercise", "not_recommended");
                activities.put("children_outdoor_play", "not_recommended");
                activities.put("window_opening", "not_recommended");
                activities.put("outdoor_events", "consider_postponing");
                break;
            case "very_poor":
            case "hazardous":
                activities.put("outdoor_exercise", "avoid");
                activities.put("children_outdoor_play", "avoid");
                activities.put("window_opening", "keep_closed");
                activities.put("outdoor_events", "postpone_or_move_indoors");
                break;
        }

        recommendations.put("activities", activities);

        // Protective measures
        List<String> protectiveMeasures = new ArrayList<>();

        if (aqi > 100) {
            protectiveMeasures.add("Consider wearing an N95 or equivalent mask outdoors");
        }
        if (aqi > 150) {
            protectiveMeasures.add("Use air purifiers indoors");
            protectiveMeasures.add("Keep windows and doors closed");
        }
        if (aqi > 200) {
            protectiveMeasures.add("Limit time outdoors");
            protectiveMeasures.add("Avoid outdoor exercise");
        }
        if (aqi > 300) {
            protectiveMeasures.add("Stay indoors as much as possible");
            protectiveMeasures.add("Seek medical attention if experiencing symptoms");
        }

        recommendations.put("protectiveMeasures", protectiveMeasures);

        // Vulnerable groups advice
        if (aqi > 50) {
            List<String> vulnerableGroupsAdvice = new ArrayList<>();
            vulnerableGroupsAdvice.add("People with heart or lung disease should take extra precautions");
            vulnerableGroupsAdvice.add("Children and elderly should limit outdoor exposure");
            if (aqi > 100) {
                vulnerableGroupsAdvice.add("Pregnant women should avoid prolonged outdoor activities");
                vulnerableGroupsAdvice.add("People with asthma should keep rescue inhalers handy");
            }
            recommendations.put("vulnerableGroupsAdvice", vulnerableGroupsAdvice);
        }

        return recommendations;
    }

    /**
     * Compare air quality between multiple cities
     */
    public Map<String, Object> compareAirQuality(Map<String, double[]> cities, String userId) {
        Map<String, AirQualityResponse> airQualityData = getMultipleLocationsAirQuality(cities, userId);

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("data", airQualityData);

        // Find best and worst cities
        if (!airQualityData.isEmpty()) {
            Map.Entry<String, AirQualityResponse> bestCity = airQualityData.entrySet().stream()
                    .min(Map.Entry.comparingByValue(Comparator.comparingInt(AirQualityResponse::getAqi)))
                    .orElse(null);

            Map.Entry<String, AirQualityResponse> worstCity = airQualityData.entrySet().stream()
                    .max(Map.Entry.comparingByValue(Comparator.comparingInt(AirQualityResponse::getAqi)))
                    .orElse(null);

            comparison.put("bestCity", bestCity != null ? bestCity.getKey() : null);
            comparison.put("worstCity", worstCity != null ? worstCity.getKey() : null);

            // Calculate average AQI
            double avgAqi = airQualityData.values().stream()
                    .mapToDouble(AirQualityResponse::getAqi)
                    .average().orElse(0);

            comparison.put("averageAqi", Math.round(avgAqi));
            comparison.put("averageCategory", getAqiCategory((int) Math.round(avgAqi)));
        }

        return comparison;
    }
}