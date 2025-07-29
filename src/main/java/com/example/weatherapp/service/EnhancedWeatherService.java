package com.example.weatherapp.service;

import com.example.weatherapp.dto.LocationSearchResult;
import com.example.weatherapp.model.ExtendedWeatherData;
import com.example.weatherapp.model.HourlyWeatherData;
import com.example.weatherapp.model.DailyWeatherData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EnhancedWeatherService {

    @Value("${openweathermap.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private WeatherCacheService cacheService;

    @Autowired
    private LocationService locationService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String OPENWEATHER_API_URL = "http://api.openweathermap.org/data/2.5/";
    private static final String ONECALL_API_URL = "https://api.openweathermap.org/data/3.0/onecall";

    /**
     * Get comprehensive weather data with caching
     */
    public ExtendedWeatherData getExtendedWeatherData(String city) {
        String cacheKey = cacheService.generateCacheKey(city, "extended");

        // Try to get from cache first
        Optional<String> cachedData = cacheService.getCachedWeatherData(cacheKey, "extended");
        if (cachedData.isPresent()) {
            return parseExtendedWeatherData(cachedData.get());
        }

        try {
            // Get current weather
            String currentWeatherUrl = String.format("%sweather?q=%s&appid=%s&units=metric",
                    OPENWEATHER_API_URL, city, apiKey);
            String currentWeatherData = restTemplate.getForObject(currentWeatherUrl, String.class);

            JsonNode currentNode = objectMapper.readTree(currentWeatherData);
            double lat = currentNode.get("coord").get("lat").asDouble();
            double lon = currentNode.get("coord").get("lon").asDouble();

            // Get comprehensive data using One Call API
            String oneCallUrl = String.format("%s?lat=%f&lon=%f&exclude=minutely&appid=%s&units=metric",
                    ONECALL_API_URL, lat, lon, apiKey);
            String oneCallData = restTemplate.getForObject(oneCallUrl, String.class);

            // Combine and parse data
            ExtendedWeatherData extendedData = parseOneCallData(oneCallData, city);

            // Cache the result
            cacheService.cacheWeatherData(cacheKey, objectMapper.writeValueAsString(extendedData),
                    "extended", city);

            return extendedData;

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch extended weather data for city: " + city, e);
        }
    }

    /**
     * Get weather data by coordinates (GPS)
     */
    public ExtendedWeatherData getWeatherByCoordinates(double lat, double lon) {
        String cacheKey = cacheService.generateCacheKey(lat, lon, "extended");

        // Try cache first
        Optional<String> cachedData = cacheService.getCachedWeatherData(cacheKey, "extended");
        if (cachedData.isPresent()) {
            return parseExtendedWeatherData(cachedData.get());
        }

        try {
            // Reverse geocode to get location name
            LocationSearchResult location = locationService.reverseGeocode(lat, lon);

            // Get comprehensive weather data
            String oneCallUrl = String.format("%s?lat=%f&lon=%f&exclude=minutely&appid=%s&units=metric",
                    ONECALL_API_URL, lat, lon, apiKey);
            String oneCallData = restTemplate.getForObject(oneCallUrl, String.class);

            ExtendedWeatherData extendedData = parseOneCallData(oneCallData, location.getName());

            // Cache the result
            cacheService.cacheWeatherData(cacheKey, objectMapper.writeValueAsString(extendedData),
                    "extended", String.format("%.4f,%.4f", lat, lon));

            return extendedData;

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch weather data for coordinates", e);
        }
    }

    /**
     * Get hourly forecast for next 48 hours
     */
    public List<HourlyWeatherData> getHourlyForecast(String city, int hours) {
        String cacheKey = cacheService.generateCacheKey(city, "hourly_" + hours);

        Optional<String> cachedData = cacheService.getCachedWeatherData(cacheKey, "hourly");
        if (cachedData.isPresent()) {
            return parseHourlyForecast(cachedData.get());
        }

        try {
            // Get coordinates first
            String currentWeatherUrl = String.format("%sweather?q=%s&appid=%s&units=metric",
                    OPENWEATHER_API_URL, city, apiKey);
            String currentWeatherData = restTemplate.getForObject(currentWeatherUrl, String.class);

            JsonNode currentNode = objectMapper.readTree(currentWeatherData);
            double lat = currentNode.get("coord").get("lat").asDouble();
            double lon = currentNode.get("coord").get("lon").asDouble();

            // Get hourly data
            String oneCallUrl = String.format("%s?lat=%f&lon=%f&exclude=current,daily,minutely&appid=%s&units=metric",
                    ONECALL_API_URL, lat, lon, apiKey);
            String oneCallData = restTemplate.getForObject(oneCallUrl, String.class);

            List<HourlyWeatherData> hourlyData = parseHourlyData(oneCallData, hours);

            // Cache the result
            cacheService.cacheWeatherData(cacheKey, objectMapper.writeValueAsString(hourlyData),
                    "hourly", city, 30); // Cache for 30 minutes

            return hourlyData;

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch hourly forecast for city: " + city, e);
        }
    }

    /**
     * Get UV Index data
     */
    public String getUVIndex(double lat, double lon) {
        String cacheKey = cacheService.generateCacheKey(lat, lon, "uv");

        Optional<String> cachedData = cacheService.getCachedWeatherData(cacheKey, "uv");
        if (cachedData.isPresent()) {
            return cachedData.get();
        }

        try {
            String url = String.format("%suvi?lat=%f&lon=%f&appid=%s",
                    OPENWEATHER_API_URL, lat, lon, apiKey);
            String uvData = restTemplate.getForObject(url, String.class);

            // Cache for 2 hours
            cacheService.cacheWeatherData(cacheKey, uvData, "uv",
                    String.format("%.4f,%.4f", lat, lon), 120);

            return uvData;

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch UV index data", e);
        }
    }

    /**
     * Get historical weather data
     */
    public String getHistoricalWeather(double lat, double lon, long timestamp) {
        String cacheKey = String.format("%.4f_%.4f_historical_%d", lat, lon, timestamp);

        Optional<String> cachedData = cacheService.getCachedWeatherData(cacheKey, "historical");
        if (cachedData.isPresent()) {
            return cachedData.get();
        }

        try {
            String url = String.format("https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=%f&lon=%f&dt=%d&appid=%s&units=metric",
                    lat, lon, timestamp, apiKey);
            String historicalData = restTemplate.getForObject(url, String.class);

            // Cache for 24 hours (historical data doesn't change)
            cacheService.cacheWeatherData(cacheKey, historicalData, "historical",
                    String.format("%.4f,%.4f", lat, lon), 1440);

            return historicalData;

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch historical weather data", e);
        }
    }

    /**
     * Parse One Call API data into ExtendedWeatherData
     */
    private ExtendedWeatherData parseOneCallData(String oneCallData, String locationName) {
        try {
            JsonNode root = objectMapper.readTree(oneCallData);
            JsonNode current = root.get("current");

            return ExtendedWeatherData.builder()
                    .locationName(locationName)
                    .latitude(root.get("lat").asDouble())
                    .longitude(root.get("lon").asDouble())
                    .timestamp(LocalDateTime.ofEpochSecond(current.get("dt").asLong(), 0, ZoneOffset.UTC))
                    .timezone(root.get("timezone").asText())
                    .temperature(current.get("temp").asDouble())
                    .feelsLike(current.get("feels_like").asDouble())
                    .humidity(current.get("humidity").asInt())
                    .pressure(current.get("pressure").asDouble())
                    .windSpeed(current.get("wind_speed").asDouble())
                    .windDirection(current.has("wind_deg") ? current.get("wind_deg").asDouble() : 0)
                    .visibility(current.has("visibility") ? current.get("visibility").asDouble() : 10000)
                    .description(current.get("weather").get(0).get("description").asText())
                    .icon(current.get("weather").get(0).get("icon").asText())
                    .uvIndex(current.has("uvi") ? current.get("uvi").asDouble() : 0)
                    .dewPoint(current.has("dew_point") ? current.get("dew_point").asDouble() : 0)
                    .cloudCover(current.has("clouds") ? current.get("clouds").asInt() : 0)
                    .sunrise(LocalDateTime.ofEpochSecond(current.get("sunrise").asLong(), 0, ZoneOffset.UTC))
                    .sunset(LocalDateTime.ofEpochSecond(current.get("sunset").asLong(), 0, ZoneOffset.UTC))
                    .hourlyForecast(parseHourlyData(oneCallData, 24))
                    .dailyForecast(parseDailyData(oneCallData))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse One Call API data", e);
        }
    }

    private ExtendedWeatherData parseExtendedWeatherData(String jsonData) {
        try {
            return objectMapper.readValue(jsonData, ExtendedWeatherData.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse cached weather data", e);
        }
    }

    private List<HourlyWeatherData> parseHourlyForecast(String jsonData) {
        try {
            JsonNode arrayNode = objectMapper.readTree(jsonData);
            List<HourlyWeatherData> hourlyData = new ArrayList<>();

            for (JsonNode node : arrayNode) {
                HourlyWeatherData data = objectMapper.treeToValue(node, HourlyWeatherData.class);
                hourlyData.add(data);
            }

            return hourlyData;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse cached hourly forecast data", e);
        }
    }

    private List<HourlyWeatherData> parseHourlyData(String oneCallData, int hours) {
        try {
            JsonNode root = objectMapper.readTree(oneCallData);
            JsonNode hourlyArray = root.get("hourly");
            List<HourlyWeatherData> hourlyData = new ArrayList<>();

            int count = Math.min(hours, hourlyArray.size());
            for (int i = 0; i < count; i++) {
                JsonNode hour = hourlyArray.get(i);
                HourlyWeatherData data = HourlyWeatherData.builder()
                        .dateTime(LocalDateTime.ofEpochSecond(hour.get("dt").asLong(), 0, ZoneOffset.UTC))
                        .temperature(hour.get("temp").asDouble())
                        .feelsLike(hour.get("feels_like").asDouble())
                        .humidity(hour.get("humidity").asInt())
                        .windSpeed(hour.get("wind_speed").asDouble())
                        .windDirection(hour.has("wind_deg") ? hour.get("wind_deg").asDouble() : 0)
                        .pressure(hour.get("pressure").asDouble())
                        .visibility(hour.has("visibility") ? hour.get("visibility").asDouble() : 10000)
                        .description(hour.get("weather").get(0).get("description").asText())
                        .icon(hour.get("weather").get(0).get("icon").asText())
                        .rainProbability(hour.has("pop") ? hour.get("pop").asDouble() * 100 : 0)
                        .rainVolume(hour.has("rain") && hour.get("rain").has("1h") ?
                                hour.get("rain").get("1h").asDouble() : 0)
                        .snowVolume(hour.has("snow") && hour.get("snow").has("1h") ?
                                hour.get("snow").get("1h").asDouble() : 0)
                        .cloudCover(hour.has("clouds") ? hour.get("clouds").asInt() : 0)
                        .uvIndex(hour.has("uvi") ? hour.get("uvi").asDouble() : 0)
                        .build();
                hourlyData.add(data);
            }

            return hourlyData;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse hourly data", e);
        }
    }

    private List<DailyWeatherData> parseDailyData(String oneCallData) {
        try {
            JsonNode root = objectMapper.readTree(oneCallData);
            JsonNode dailyArray = root.get("daily");
            List<DailyWeatherData> dailyData = new ArrayList<>();

            for (JsonNode day : dailyArray) {
                JsonNode temp = day.get("temp");
                DailyWeatherData data = DailyWeatherData.builder()
                        .date(LocalDateTime.ofEpochSecond(day.get("dt").asLong(), 0, ZoneOffset.UTC).toLocalDate())
                        .tempMin(temp.get("min").asDouble())
                        .tempMax(temp.get("max").asDouble())
                        .tempMorning(temp.get("morn").asDouble())
                        .tempDay(temp.get("day").asDouble())
                        .tempEvening(temp.get("eve").asDouble())
                        .tempNight(temp.get("night").asDouble())
                        .humidity(day.get("humidity").asInt())
                        .windSpeed(day.get("wind_speed").asDouble())
                        .windDirection(day.has("wind_deg") ? day.get("wind_deg").asDouble() : 0)
                        .pressure(day.get("pressure").asDouble())
                        .description(day.get("weather").get(0).get("description").asText())
                        .icon(day.get("weather").get(0).get("icon").asText())
                        .rainProbability(day.has("pop") ? day.get("pop").asDouble() * 100 : 0)
                        .rainVolume(day.has("rain") ? day.get("rain").asDouble() : 0)
                        .snowVolume(day.has("snow") ? day.get("snow").asDouble() : 0)
                        .uvIndex(day.has("uvi") ? day.get("uvi").asDouble() : 0)
                        .sunrise(LocalDateTime.ofEpochSecond(day.get("sunrise").asLong(), 0, ZoneOffset.UTC))
                        .sunset(LocalDateTime.ofEpochSecond(day.get("sunset").asLong(), 0, ZoneOffset.UTC))
                        .moonPhase(day.has("moon_phase") ? getMoonPhaseDescription(day.get("moon_phase").asDouble()) : "Unknown")
                        .build();
                dailyData.add(data);
            }

            return dailyData;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse daily data", e);
        }
    }

    private String getMoonPhaseDescription(double moonPhase) {
        if (moonPhase == 0 || moonPhase == 1) return "New Moon";
        else if (moonPhase < 0.25) return "Waxing Crescent";
        else if (moonPhase == 0.25) return "First Quarter";
        else if (moonPhase < 0.5) return "Waxing Gibbous";
        else if (moonPhase == 0.5) return "Full Moon";
        else if (moonPhase < 0.75) return "Waning Gibbous";
        else if (moonPhase == 0.75) return "Last Quarter";
        else return "Waning Crescent";
    }
}