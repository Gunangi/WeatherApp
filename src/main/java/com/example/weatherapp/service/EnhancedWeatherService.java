package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherDataDto;
import com.example.weatherapp.dto.WeatherForecastDto;
import com.example.weatherapp.dto.AirQualityDto;
import com.example.weatherapp.dto.EnhancedWeatherDto;
import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.HistoricalWeatherData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class EnhancedWeatherService {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedWeatherService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private WeatherMLService weatherMLService;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url}")
    private String baseUrl;

    private static final String WEATHER_CACHE_PREFIX = "enhanced_weather:";
    private static final String FORECAST_CACHE_PREFIX = "enhanced_forecast:";
    private static final String HISTORICAL_CACHE_PREFIX = "historical_weather:";

    public CompletableFuture<EnhancedWeatherDto> getEnhancedWeatherData(String location, String userId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String cacheKey = WEATHER_CACHE_PREFIX + location.toLowerCase();

                // Try to get from cache first
                EnhancedWeatherDto cachedData = (EnhancedWeatherDto) redisTemplate.opsForValue().get(cacheKey);
                if (cachedData != null) {
                    logger.debug("Retrieved enhanced weather data from cache for location: {}", location);
                    return cachedData;
                }

                // Fetch data from multiple sources in parallel
                CompletableFuture<WeatherDataDto> currentWeatherFuture = getCurrentWeatherAsync(location);
                CompletableFuture<List<WeatherForecastDto>> forecastFuture = getExtendedForecastAsync(location);
                CompletableFuture<AirQualityDto> airQualityFuture = getAirQualityAsync(location);
                CompletableFuture<List<WeatherAlert>> alertsFuture = getWeatherAlertsAsync(location);

                // Wait for all futures to complete
                WeatherDataDto currentWeather = currentWeatherFuture.get();
                List<WeatherForecastDto> forecast = forecastFuture.get();
                AirQualityDto airQuality = airQualityFuture.get();
                List<WeatherAlert> alerts = alertsFuture.get();

                // Create enhanced weather data
                EnhancedWeatherDto enhancedData = createEnhancedWeatherDto(
                        currentWeather, forecast, airQuality, alerts, location);

                // Add ML predictions
                enhancedData.setMlPredictions(weatherMLService.getPredictions(location, enhancedData));

                // Add additional computed data
                enhanceWithComputedData(enhancedData);

                // Cache the result
                redisTemplate.opsForValue().set(cacheKey, enhancedData, Duration.ofMinutes(15));

                logger.info("Enhanced weather data retrieved and cached for location: {}", location);
                return enhancedData;

            } catch (Exception e) {
                logger.error("Error fetching enhanced weather data for location {}: {}", location, e.getMessage());
                throw new RuntimeException("Failed to fetch enhanced weather data", e);
            }
        });
    }

    private CompletableFuture<WeatherDataDto> getCurrentWeatherAsync(String location) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = String.format("%s/weather?q=%s&appid=%s&units=metric", baseUrl, location, apiKey);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                return mapToWeatherDataDto(response);
            } catch (Exception e) {
                logger.error("Error fetching current weather for {}: {}", location, e.getMessage());
                return new WeatherDataDto(); // Return empty DTO as fallback
            }
        });
    }

    private CompletableFuture<List<WeatherForecastDto>> getExtendedForecastAsync(String location) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = String.format("%s/forecast?q=%s&appid=%s&units=metric&cnt=40", baseUrl, location, apiKey);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                return mapToForecastList(response);
            } catch (Exception e) {
                logger.error("Error fetching forecast for {}: {}", location, e.getMessage());
                return new ArrayList<>();
            }
        });
    }

    private CompletableFuture<AirQualityDto> getAirQualityAsync(String location) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // First get coordinates for the location
                String geoUrl = String.format("%s/geo/1.0/direct?q=%s&limit=1&appid=%s", baseUrl, location, apiKey);
                List<Map<String, Object>> geoResponse = restTemplate.getForObject(geoUrl, List.class);

                if (geoResponse != null && !geoResponse.isEmpty()) {
                    Map<String, Object> coords = geoResponse.get(0);
                    double lat = (Double) coords.get("lat");
                    double lon = (Double) coords.get("lon");

                    String aqUrl = String.format("%s/air_pollution?lat=%f&lon=%f&appid=%s", baseUrl, lat, lon, apiKey);
                    Map<String, Object> aqResponse = restTemplate.getForObject(aqUrl, Map.class);
                    return mapToAirQualityDto(aqResponse);
                }
            } catch (Exception e) {
                logger.error("Error fetching air quality for {}: {}", location, e.getMessage());
            }
            return new AirQualityDto();
        });
    }

    private CompletableFuture<List<WeatherAlert>> getWeatherAlertsAsync(String location) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Get weather alerts from the API
                String url = String.format("%s/onecall?q=%s&appid=%s&exclude=minutely,daily", baseUrl, location, apiKey);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                return mapToWeatherAlerts(response);
            } catch (Exception e) {
                logger.error("Error fetching weather alerts for {}: {}", location, e.getMessage());
                return new ArrayList<>();
            }
        });
    }

    public List<HistoricalWeatherData> getHistoricalWeatherData(String location, LocalDateTime startDate, LocalDateTime endDate) {
        String cacheKey = HISTORICAL_CACHE_PREFIX + location + ":" + startDate.toLocalDate() + ":" + endDate.toLocalDate();

        List<HistoricalWeatherData> cachedData = (List<HistoricalWeatherData>) redisTemplate.opsForValue().get(cacheKey);
        if (cachedData != null) {
            return cachedData;
        }

        try {
            List<HistoricalWeatherData> historicalData = fetchHistoricalData(location, startDate, endDate);

            // Cache for 1 day (historical data doesn't change)
            redisTemplate.opsForValue().set(cacheKey, historicalData, Duration.ofDays(1));

            return historicalData;
        } catch (Exception e) {
            logger.error("Error fetching historical weather data: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public Map<String, Object> getWeatherComparison(List<String> locations) {
        Map<String, Object> comparison = new HashMap<>();

        for (String location : locations) {
            try {
                EnhancedWeatherDto weather = getEnhancedWeatherData(location, null).get();
                comparison.put(location, weather);
            } catch (Exception e) {
                logger.error("Error fetching weather for comparison location {}: {}", location, e.getMessage());
            }
        }

        // Add comparison analytics
        comparison.put("analytics", generateComparisonAnalytics(comparison));

        return comparison;
    }

    public Map<String, Object> getWeatherTrends(String location, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<HistoricalWeatherData> historicalData = getHistoricalWeatherData(location, startDate, endDate);

        Map<String, Object> trends = new HashMap<>();
        trends.put("temperatureTrend", calculateTemperatureTrend(historicalData));
        trends.put("humidityTrend", calculateHumidityTrend(historicalData));
        trends.put("pressureTrend", calculatePressureTrend(historicalData));
        trends.put("precipitationTrend", calculatePrecipitationTrend(historicalData));
        trends.put("overallTrend", determineOverallTrend(historicalData));

        return trends;
    }

    public EnhancedWeatherDto getWeatherForSpecificTime(String location, LocalDateTime targetTime) {
        try {
            // Check if target time is in the future (forecast) or past (historical)
            LocalDateTime now = LocalDateTime.now();

            if (targetTime.isAfter(now)) {
                return getForecastForTime(location, targetTime);
            } else {
                return getHistoricalForTime(location, targetTime);
            }
        } catch (Exception e) {
            logger.error("Error fetching weather for specific time: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch weather for specific time", e);
        }
    }

    private EnhancedWeatherDto createEnhancedWeatherDto(WeatherDataDto current, List<WeatherForecastDto> forecast,
                                                        AirQualityDto airQuality, List<WeatherAlert> alerts, String location) {
        EnhancedWeatherDto enhanced = new EnhancedWeatherDto();
        enhanced.setCurrentWeather(current);
        enhanced.setForecast(forecast);
        enhanced.setAirQuality(airQuality);
        enhanced.setAlerts(alerts);
        enhanced.setLocation(location);
        enhanced.setLastUpdated(LocalDateTime.now());
        enhanced.setTimeZone(determineTimeZone(location));

        return enhanced;
    }

    private void enhanceWithComputedData(EnhancedWeatherDto enhancedData) {
        // Calculate additional metrics
        enhancedData.setComfortIndex(calculateComfortIndex(enhancedData.getCurrentWeather()));
        enhancedData.setUvIndex(calculateUVIndex(enhancedData.getCurrentWeather()));
        enhancedData.setHeatIndex(calculateHeatIndex(enhancedData.getCurrentWeather()));
        enhancedData.setWindChill(calculateWindChill(enhancedData.getCurrentWeather()));
        enhancedData.setDewPoint(calculateDewPoint(enhancedData.getCurrentWeather()));
        enhancedData.setVisibilityRating(categorizeVisibility(enhancedData.getCurrentWeather().getVisibility()));
        enhancedData.setWeatherSeverity(calculateWeatherSeverity(enhancedData));

        // Add sunrise/sunset and moon phase data
        enhancedData.setSunData(calculateSunData(enhancedData.getLocation()));
        enhancedData.setMoonPhase(calculateMoonPhase());

        // Add seasonal information
        enhancedData.setSeasonalData(getSeasonalData(enhancedData.getLocation()));
    }

    // Helper methods for mapping API responses
    private WeatherDataDto mapToWeatherDataDto(Map<String, Object> response) {
        WeatherDataDto dto = new WeatherDataDto();

        if (response != null) {
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Map<String, Object> wind = (Map<String, Object>) response.get("wind");
            List<Map<String, Object>> weather = (List<Map<String, Object>>) response.get("weather");
            Map<String, Object> sys = (Map<String, Object>) response.get("sys");

            if (main != null) {
                dto.setTemperature(((Number) main.get("temp")).doubleValue());
                dto.setFeelsLike(((Number) main.get("feels_like")).doubleValue());
                dto.setHumidity(((Number) main.get("humidity")).doubleValue());
                dto.setPressure(((Number) main.get("pressure")).doubleValue());
            }

            if (wind != null) {
                dto.setWindSpeed(((Number) wind.get("speed")).doubleValue());
                dto.setWindDirection(((Number) wind.getOrDefault("deg", 0)).intValue());
            }

            if (weather != null && !weather.isEmpty()) {
                dto.setWeatherCondition((String) weather.get(0).get("main"));
                dto.setWeatherDescription((String) weather.get(0).get("description"));
            }

            dto.setVisibility(((Number) response.getOrDefault("visibility", 10000)).doubleValue());

            if (sys != null) {
                dto.setSunrise(new Date(((Number) sys.get("sunrise")).longValue() * 1000));
                dto.setSunset(new Date(((Number) sys.get("sunset")).longValue() * 1000));
            }
        }

        return dto;
    }

    private List<WeatherForecastDto> mapToForecastList(Map<String, Object> response) {
        List<WeatherForecastDto> forecasts = new ArrayList<>();

        if (response != null) {
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");

            if (list != null) {
                for (Map<String, Object> item : list) {
                    WeatherForecastDto forecast = new WeatherForecastDto();

                    Map<String, Object> main = (Map<String, Object>) item.get("main");
                    List<Map<String, Object>> weather = (List<Map<String, Object>>) item.get("weather");

                    if (main != null) {
                        forecast.setTemperature(((Number) main.get("temp")).doubleValue());
                        forecast.setHumidity(((Number) main.get("humidity")).doubleValue());
                    }

                    if (weather != null && !weather.isEmpty()) {
                        forecast.setWeatherCondition((String) weather.get(0).get("main"));
                        forecast.setDescription((String) weather.get(0).get("description"));
                    }

                    forecast.setDateTime(new Date(((Number) item.get("dt")).longValue() * 1000));
                    forecasts.add(forecast);
                }
            }
        }

        return forecasts;
    }

    private AirQualityDto mapToAirQualityDto(Map<String, Object> response) {
        AirQualityDto dto = new AirQualityDto();

        if (response != null) {
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");

            if (list != null && !list.isEmpty()) {
                Map<String, Object> data = list.get(0);
                Map<String, Object> main = (Map<String, Object>) data.get("main");
                Map<String, Object> components = (Map<String, Object>) data.get("components");

                if (main != null) {
                    dto.setAqi(((Number) main.get("aqi")).intValue());
                }

                if (components != null) {
                    dto.setCo(((Number) components.getOrDefault("co", 0)).doubleValue());
                    dto.setNo2(((Number) components.getOrDefault("no2", 0)).doubleValue());
                    dto.setO3(((Number) components.getOrDefault("o3", 0)).doubleValue());
                    dto.setSo2(((Number) components.getOrDefault("so2", 0)).doubleValue());
                    dto.setPm25(((Number) components.getOrDefault("pm2_5", 0)).doubleValue());
                    dto.setPm10(((Number) components.getOrDefault("pm10", 0)).doubleValue());
                }
            }
        }

        return dto;
    }

    private List<WeatherAlert> mapToWeatherAlerts(Map<String, Object> response) {
        List<WeatherAlert> alerts = new ArrayList<>();

        if (response != null) {
            List<Map<String, Object>> alertsData = (List<Map<String, Object>>) response.get("alerts");

            if (alertsData != null) {
                for (Map<String, Object> alertData : alertsData) {
                    WeatherAlert alert = new WeatherAlert();
                    alert.setTitle((String) alertData.get("event"));
                    alert.setDescription((String) alertData.get("description"));
                    alert.setSeverity(determineSeverity((String) alertData.get("event")));
                    alert.setStartTime(new Date(((Number) alertData.get("start")).longValue() * 1000));
                    alert.setEndTime(new Date(((Number) alertData.get("end")).longValue() * 1000));
                    alert.setSenderName((String) alertData.get("sender_name"));
                    alerts.add(alert);
                }
            }
        }

        return alerts;
    }

    private List<HistoricalWeatherData> fetchHistoricalData(String location, LocalDateTime startDate, LocalDateTime endDate) {
        List<HistoricalWeatherData> historicalData = new ArrayList<>();

        try {
            // Note: This is a simplified implementation. In reality, you'd need to use
            // historical weather API or stored data
            long startTimestamp = startDate.atZone(ZoneId.systemDefault()).toEpochSecond();
            long endTimestamp = endDate.atZone(ZoneId.systemDefault()).toEpochSecond();

            // For demo purposes, generate sample historical data
            LocalDateTime current = startDate;
            while (current.isBefore(endDate)) {
                HistoricalWeatherData data = new HistoricalWeatherData();
                data.setLocation(location);
                data.setDateTime(current);
                data.setTemperature(20 + Math.random() * 15); // Sample data
                data.setHumidity(40 + Math.random() * 40);
                data.setPressure(1000 + Math.random() * 50);
                data.setPrecipitation(Math.random() * 10);
                historicalData.add(data);
                current = current.plusHours(3);
            }
        } catch (Exception e) {
            logger.error("Error generating historical data: {}", e.getMessage());
        }

        return historicalData;
    }

    private Map<String, Object> generateComparisonAnalytics(Map<String, Object> comparison) {
        Map<String, Object> analytics = new HashMap<>();

        List<Double> temperatures = new ArrayList<>();
        List<Double> humidities = new ArrayList<>();
        List<Double> pressures = new ArrayList<>();

        for (Map.Entry<String, Object> entry : comparison.entrySet()) {
            if (entry.getValue() instanceof EnhancedWeatherDto) {
                EnhancedWeatherDto weather = (EnhancedWeatherDto) entry.getValue();
                temperatures.add(weather.getCurrentWeather().getTemperature());
                humidities.add(weather.getCurrentWeather().getHumidity());
                pressures.add(weather.getCurrentWeather().getPressure());
            }
        }

        analytics.put("temperatureRange", Map.of(
                "min", temperatures.stream().min(Double::compare).orElse(0.0),
                "max", temperatures.stream().max(Double::compare).orElse(0.0),
                "average", temperatures.stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
        ));

        analytics.put("humidityRange", Map.of(
                "min", humidities.stream().min(Double::compare).orElse(0.0),
                "max", humidities.stream().max(Double::compare).orElse(0.0),
                "average", humidities.stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
        ));

        return analytics;
    }

    // Calculation methods
    private double calculateComfortIndex(WeatherDataDto weather) {
        double temp = weather.getTemperature();
        double humidity = weather.getHumidity();

        // Simplified comfort index calculation
        if (temp >= 20 && temp <= 26 && humidity >= 40 && humidity <= 60) {
            return 10.0; // Perfect comfort
        } else if (temp >= 18 && temp <= 28 && humidity >= 30 && humidity <= 70) {
            return 8.0; // Very comfortable
        } else if (temp >= 15 && temp <= 30 && humidity >= 25 && humidity <= 75) {
            return 6.0; // Comfortable
        } else if (temp >= 10 && temp <= 35) {
            return 4.0; // Moderately comfortable
        } else {
            return 2.0; // Uncomfortable
        }
    }

    private double calculateUVIndex(WeatherDataDto weather) {
        // Simplified UV index calculation based on conditions
        String condition = weather.getWeatherCondition().toLowerCase();
        if (condition.contains("clear") || condition.contains("sunny")) {
            return 8.0 + Math.random() * 3; // 8-11 for sunny days
        } else if (condition.contains("cloud")) {
            return 4.0 + Math.random() * 4; // 4-8 for cloudy days
        } else {
            return 1.0 + Math.random() * 3; // 1-4 for overcast/rainy days
        }
    }

    private double calculateHeatIndex(WeatherDataDto weather) {
        double temp = weather.getTemperature();
        double humidity = weather.getHumidity();

        // Simplified heat index calculation
        if (temp >= 27) {
            return temp + (humidity / 100) * (temp - 27) * 1.5;
        }
        return temp;
    }

    private double calculateWindChill(WeatherDataDto weather) {
        double temp = weather.getTemperature();
        double windSpeed = weather.getWindSpeed() * 3.6; // Convert m/s to km/h

        // Wind chill calculation for temperatures below 10°C
        if (temp <= 10 && windSpeed > 4.8) {
            return 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
        }
        return temp;
    }

    private double calculateDewPoint(WeatherDataDto weather) {
        double temp = weather.getTemperature();
        double humidity = weather.getHumidity();

        // Magnus formula for dew point
        double a = 17.27;
        double b = 237.7;
        double alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
        return (b * alpha) / (a - alpha);
    }

    private String categorizeVisibility(double visibility) {
        if (visibility >= 10000) return "Excellent";
        if (visibility >= 5000) return "Good";
        if (visibility >= 2000) return "Moderate";
        if (visibility >= 1000) return "Poor";
        return "Very Poor";
    }

    private String calculateWeatherSeverity(EnhancedWeatherDto weather) {
        WeatherDataDto current = weather.getCurrentWeather();
        List<WeatherAlert> alerts = weather.getAlerts();

        if (!alerts.isEmpty()) {
            return "High"; // Any active alerts indicate high severity
        }

        String condition = current.getWeatherCondition().toLowerCase();
        double windSpeed = current.getWindSpeed();
        double temp = current.getTemperature();

        if (condition.contains("storm") || condition.contains("hurricane") || windSpeed > 25) {
            return "High";
        } else if (condition.contains("rain") || condition.contains("snow") || temp < 0 || temp > 40) {
            return "Moderate";
        } else {
            return "Low";
        }
    }

    private Map<String, Object> calculateSunData(String location) {
        Map<String, Object> sunData = new HashMap<>();

        // This would typically involve astronomical calculations
        // For now, providing sample data
        sunData.put("sunrise", "06:30");
        sunData.put("sunset", "18:45");
        sunData.put("dayLength", "12h 15m");
        sunData.put("goldenHour", "17:45 - 18:45");

        return sunData;
    }

    private String calculateMoonPhase() {
        // Simplified moon phase calculation
        String[] phases = {"New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
                "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"};
        return phases[(int) (Math.random() * phases.length)];
    }

    private Map<String, Object> getSeasonalData(String location) {
        Map<String, Object> seasonal = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        int month = now.getMonthValue();

        if (month >= 3 && month <= 5) {
            seasonal.put("season", "Spring");
            seasonal.put("characteristics", Arrays.asList("Mild temperatures", "Blooming flowers", "Variable weather"));
        } else if (month >= 6 && month <= 8) {
            seasonal.put("season", "Summer");
            seasonal.put("characteristics", Arrays.asList("Hot temperatures", "High humidity", "Thunderstorms"));
        } else if (month >= 9 && month <= 11) {
            seasonal.put("season", "Autumn");
            seasonal.put("characteristics", Arrays.asList("Cooling temperatures", "Falling leaves", "Clear skies"));
        } else {
            seasonal.put("season", "Winter");
            seasonal.put("characteristics", Arrays.asList("Cold temperatures", "Frost/snow possible", "Short days"));
        }

        return seasonal;
    }

    private String determineSeverity(String eventType) {
        if (eventType == null) return "LOW";

        String event = eventType.toLowerCase();
        if (event.contains("hurricane") || event.contains("tornado") || event.contains("severe")) {
            return "HIGH";
        } else if (event.contains("warning") || event.contains("watch")) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    private String determineTimeZone(String location) {
        // This would typically involve a timezone lookup service
        // For now, returning a default
        return "UTC";
    }

    private EnhancedWeatherDto getForecastForTime(String location, LocalDateTime targetTime) {
        // Implementation for getting forecast data for future time
        // This would involve interpolating forecast data
        return new EnhancedWeatherDto();
    }

    private EnhancedWeatherDto getHistoricalForTime(String location, LocalDateTime targetTime) {
        // Implementation for getting historical data for past time
        return new EnhancedWeatherDto();
    }

    // Trend calculation methods
    private Map<String, Object> calculateTemperatureTrend(List<HistoricalWeatherData> data) {
        if (data.isEmpty()) return new HashMap<>();

        List<Double> temps = data.stream().map(HistoricalWeatherData::getTemperature).toList();
        double average = temps.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double min = temps.stream().min(Double::compare).orElse(0.0);
        double max = temps.stream().max(Double::compare).orElse(0.0);

        return Map.of(
                "average", average,
                "min", min,
                "max", max,
                "trend", calculateTrendDirection(temps)
        );
    }

    private Map<String, Object> calculateHumidityTrend(List<HistoricalWeatherData> data) {
        if (data.isEmpty()) return new HashMap<>();

        List<Double> humidity = data.stream().map(HistoricalWeatherData::getHumidity).toList();
        double average = humidity.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        return Map.of(
                "average", average,
                "trend", calculateTrendDirection(humidity)
        );
    }

    private Map<String, Object> calculatePressureTrend(List<HistoricalWeatherData> data) {
        if (data.isEmpty()) return new HashMap<>();

        List<Double> pressure = data.stream().map(HistoricalWeatherData::getPressure).toList();
        double average = pressure.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        return Map.of(
                "average", average,
                "trend", calculateTrendDirection(pressure)
        );
    }

    private Map<String, Object> calculatePrecipitationTrend(List<HistoricalWeatherData> data) {
        if (data.isEmpty()) return new HashMap<>();

        List<Double> precipitation = data.stream().map(HistoricalWeatherData::getPrecipitation).toList();
        double total = precipitation.stream().mapToDouble(Double::doubleValue).sum();

        return Map.of(
                "total", total,
                "average", total / data.size(),
                "trend", calculateTrendDirection(precipitation)
        );
    }

    private String determineOverallTrend(List<HistoricalWeatherData> data) {
        if (data.size() < 2) return "STABLE";

        // Compare first half with second half
        int midPoint = data.size() / 2;
        List<HistoricalWeatherData> firstHalf = data.subList(0, midPoint);
        List<HistoricalWeatherData> secondHalf = data.subList(midPoint, data.size());

        double firstAvgTemp = firstHalf.stream().mapToDouble(HistoricalWeatherData::getTemperature).average().orElse(0.0);
        double secondAvgTemp = secondHalf.stream().mapToDouble(HistoricalWeatherData::getTemperature).average().orElse(0.0);

        if (secondAvgTemp > firstAvgTemp + 2) return "WARMING";
        if (secondAvgTemp < firstAvgTemp - 2) return "COOLING";
        return "STABLE";
    }

    private String calculateTrendDirection(List<Double> values) {
        if (values.size() < 2) return "STABLE";

        double first = values.get(0);
        double last = values.get(values.size() - 1);
        double difference = last - first;

        if (Math.abs(difference) < 0.1) return "STABLE";
        return difference > 0 ? "INCREASING" : "DECREASING";
    }
}