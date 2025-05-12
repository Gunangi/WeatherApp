package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.WeatherData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class WeatherApiService {

    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;  // Fixed: Use property placeholder instead of hardcoded value

    private final String WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";
    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherData getCurrentWeather(String location) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/weather")
                .queryParam("q", location)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .toUriString();

        return restTemplate.getForObject(url, WeatherData.class);
    }

    public Map<String, Object> getForecast(String location, int days) {
        // OpenWeatherMap free tier provides 5-day forecast
        // For more days, we would need to use a different API or premium plan
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/forecast")
                .queryParam("q", location)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .queryParam("cnt", Math.min(days * 8, 40)) // 8 data points per day (3-hour intervals)
                .toUriString();

        return restTemplate.getForObject(url, Map.class);
    }

    public List<Map<String, Object>> getHourlyForecast(double lat, double lon, int hours) {
        // OpenWeatherMap free tier provides 3-hour interval forecast
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/forecast")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .queryParam("cnt", Math.min(hours / 3, 40)) // Each forecast point is 3 hours
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Map<String, Object>> hourlyList = (List<Map<String, Object>>) response.get("list");
        return hourlyList.subList(0, Math.min(hours / 3, hourlyList.size()));
    }

    public Map<String, Object> getAirPollution(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/air_pollution")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .toUriString();

        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> getHistoricalWeather(double lat, double lon, String period) {
        // For historical data, we need Unix timestamps
        // This implementation assumes period is provided as Unix timestamp

        // For free tier, we could use the following endpoint for a single day:
        String url = UriComponentsBuilder.fromHttpUrl("https://api.openweathermap.org/data/3.0/onecall/timemachine")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("dt", period) // Unix timestamp
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .toUriString();

        return restTemplate.getForObject(url, Map.class);
    }

    public Object getWeatherMap(String layer, double lat, double lon, int zoom) {
        // This would normally return a URL to a map tile
        // but for demonstration purposes, we'll return a structured response
        Map<String, Object> mapResponse = new HashMap<>();
        mapResponse.put("mapUrl", "https://tile.openweathermap.org/map/" + layer + "/" + zoom + "/" + lat + "/" + lon + ".png?appid=" + apiKey);
        mapResponse.put("lat", lat);
        mapResponse.put("lon", lon);
        mapResponse.put("zoom", zoom);
        mapResponse.put("layer", layer);

        return mapResponse;
    }

    public List<Map<String, Object>> compareCities(List<String> cities) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (String city : cities) {
            WeatherData cityWeather = getCurrentWeather(city);
            Map<String, Object> cityData = new HashMap<>();
            cityData.put("city", city);
            cityData.put("weather", cityWeather);
            result.add(cityData);
        }

        return result;
    }

    public List<WeatherAlert> getWeatherAlerts(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/onecall")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("exclude", "current,minutely,hourly,daily")
                .queryParam("appid", apiKey)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<WeatherAlert> alerts = new ArrayList<>();

        if (response != null && response.containsKey("alerts")) {
            List<Map<String, Object>> alertsData = (List<Map<String, Object>>) response.get("alerts");
            for (Map<String, Object> alertData : alertsData) {
                WeatherAlert alert = new WeatherAlert();
                // Map alert data to WeatherAlert model
                alert.setTitle((String) alertData.getOrDefault("event", "Unknown Alert"));
                alert.setDescription((String) alertData.getOrDefault("description", ""));
                // Other mappings as needed
                alert.setActive(true);  // Default to active
                alerts.add(alert);
            }
        }

        return alerts;
    }

    public Map<String, Object> getWeatherRecommendations(double lat, double lon) {
        // Get current weather
        WeatherData weatherData = getWeatherByCoordinates(lat, lon);

        // In a real implementation, we would analyze the weather data
        // and provide recommendations based on conditions
        // For this example, we'll return a simple structure

        Map<String, Object> recommendations = new HashMap<>();
        recommendations.put("weatherData", weatherData);
        recommendations.put("clothing", "Recommendations based on temperature and conditions");
        recommendations.put("activities", "Outdoor activity recommendations based on conditions");
        recommendations.put("alerts", "Any special warnings or alerts based on extreme conditions");

        return recommendations;
    }

    public WeatherData getWeatherByCoordinates(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/weather")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .toUriString();

        return restTemplate.getForObject(url, WeatherData.class);
    }

    public Object getHistoricalWeather(double lat, double lon, String startDate, String endDate) {
        List<Object> historicalData = new ArrayList<>();

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            long timestamp = date.atStartOfDay(ZoneOffset.UTC).toEpochSecond();
            String url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=" + lat +
                    "&lon=" + lon + "&dt=" + timestamp + "&appid=" + apiKey + "&units=metric";
            Object dayData = restTemplate.getForObject(url, Object.class);
            historicalData.add(dayData);
        }

        return historicalData;
    }

    public Object getHourlyForecast(String location) {
        // Step 1: Geocode city name to get coordinates
        String geoUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + location +
                "&limit=1&appid=" + apiKey;
        Object[] geoResponse = restTemplate.getForObject(geoUrl, Object[].class);

        if (geoResponse == null || geoResponse.length == 0) {
            throw new RuntimeException("Invalid location: " + location);
        }

        // Extract lat/lon from the geocoding response
        Map<String, Object> geoData = (Map<String, Object>) geoResponse[0];
        double lat = (double) geoData.get("lat");
        double lon = (double) geoData.get("lon");

        // Step 2: Get hourly forecast using One Call API
        String forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat +
                "&lon=" + lon + "&exclude=current,minutely,daily,alerts" +
                "&appid=" + apiKey + "&units=metric";

        return restTemplate.getForObject(forecastUrl, Object.class);
    }
}