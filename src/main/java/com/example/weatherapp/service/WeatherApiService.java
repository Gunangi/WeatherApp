package com.example.weatherapp.service;

import com.example.weatherapp.config.OpenWeatherMapConfig;
import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.WeatherData;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WeatherApiService {

    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    private final String WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

    @Autowired
    private OpenWeatherMapConfig weatherConfig;

    @Autowired
    private RestTemplate restTemplate;

    // Current weather method implementation
    public WeatherData getCurrentWeather(String city) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/weather")
                .queryParam("q", city)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .build()
                .toUriString();

        ResponseEntity<WeatherData> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                WeatherData.class
        );

        return response.getBody();
    }


    // Get weather alerts
    public List<WeatherAlert> getWeatherAlerts(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/onecall")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("exclude", "current,minutely,hourly,daily")
                .queryParam("appid", apiKey)
                .build()
                .toUriString();

        // Use ParameterizedTypeReference to handle generic type
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        Map<String, Object> responseBody = response.getBody();
        List<WeatherAlert> alerts = new ArrayList<>();

        if (responseBody != null && responseBody.containsKey("alerts")) {
            List<Map<String, Object>> alertsData = (List<Map<String, Object>>) responseBody.get("alerts");
            for (Map<String, Object> alertData : alertsData) {
                WeatherAlert alert = new WeatherAlert();
                alert.setTitle((String) alertData.getOrDefault("event", "Unknown Alert"));
                alert.setDescription((String) alertData.getOrDefault("description", ""));
                alert.setActive(true);
                alerts.add(alert);
            }
        }

        return alerts;
    }

    // Get weather recommendations
    public Map<String, Object> getWeatherRecommendations(double lat, double lon) {
        // Get current weather
        WeatherData weatherData = getWeatherByCoordinates(lat, lon);

        // Create recommendations based on weather data
        Map<String, Object> recommendations = new HashMap<>();
        recommendations.put("weatherData", weatherData);
        recommendations.put("clothing", generateClothingRecommendation(weatherData));
        recommendations.put("activities", generateActivityRecommendation(weatherData));
        recommendations.put("alerts", "Check local weather alerts");

        return recommendations;
    }

    // Helper method to generate clothing recommendations
    private String generateClothingRecommendation(WeatherData weatherData) {
        // Extract temperature from weatherData
        double temp = weatherData.getMainTemperature();

        if (temp < 10) {
            return "Heavy coat, gloves, and warm layers recommended";
        } else if (temp < 20) {
            return "Light jacket or sweater recommended";
        } else {
            return "Light clothing suitable for warm weather";
        }
    }

    // Helper method to generate activity recommendations
    private String generateActivityRecommendation(WeatherData weatherData) {
        // Extract temperature and weather conditions
        double temp = weatherData.getMainTemperature();

        String mainWeather = weatherData.getWeather() != null && !weatherData.getWeather().isEmpty() ?
                (String) weatherData.getWeather().get(0).getOrDefault("main", "Clear") : "Clear";

        switch (mainWeather.toLowerCase()) {
            case "rain":
                return "Indoor activities recommended";
            case "clear":
                return temp > 20 ? "Great day for outdoor activities" : "Moderate outdoor activities suggested";
            case "clouds":
                return "Suitable for various outdoor activities";
            default:
                return "Check local conditions before planning activities";
        }
    }

    // Forecast method
    public Map<String, Object> getForecast(String city, int days, Logger logger, Object RestClientException) {
        // First, geocode the location to get coordinates
        String geoUrl = UriComponentsBuilder.fromHttpUrl("http://api.openweathermap.org/geo/1.0/direct")
                .queryParam("q", city)
                .queryParam("limit", "1")
                .queryParam("appid", apiKey)
                .build()
                .toUriString();

        ResponseEntity<List<Map<String, Object>>> geoResponse = restTemplate.exchange(
                geoUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );

        List<Map<String, Object>> geoResponseBody = geoResponse.getBody();

        if (geoResponseBody == null || geoResponseBody.isEmpty()) {
            throw new RuntimeException("Invalid location: " + city);
        }

        // Extract lat/lon from the geocoding response
        Map<String, Object> geoData = geoResponseBody.get(0);
        double lat = ((Number) geoData.get("lat")).doubleValue();
        double lon = ((Number) geoData.get("lon")).doubleValue();

        // Get forecast using One Call API
        String forecastUrl = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/onecall")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("exclude", "current,minutely,alerts")
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .build()
                .toUriString();

        ResponseEntity<Map<String, Object>> forecastResponse = restTemplate.exchange(
                forecastUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return forecastResponse.getBody();
    }

    // Hourly forecast method with lat, lon, and hours
    public List<Map<String, Object>> getHourlyForecast(double lat, double lon, int hours) {
        // Get hourly forecast using One Call API
        String forecastUrl = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/onecall")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("exclude", "current,minutely,daily,alerts")
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .build()
                .toUriString();

        ResponseEntity<Map<String, Object>> forecastResponse = restTemplate.exchange(
                forecastUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        Map<String, Object> responseBody = forecastResponse.getBody();

        if (responseBody != null && responseBody.containsKey("hourly")) {
            List<Map<String, Object>> hourlyData = (List<Map<String, Object>>) responseBody.get("hourly");
            // Limit to specified number of hours
            return hourlyData.stream()
                    .limit(hours)
                    .collect(Collectors.toList());
        }

        return new ArrayList<>();
    }
    // Overloaded method to get hourly forecast by city name
    public List<Map<String, Object>> getHourlyForecast(String location, int hours) {
        // First, geocode the location to get coordinates
        String geoUrl = UriComponentsBuilder.fromHttpUrl("http://api.openweathermap.org/geo/1.0/direct")
                .queryParam("q", location)
                .queryParam("limit", "1")
                .queryParam("appid", apiKey)
                .build()
                .toUriString();

        ResponseEntity<List<Map<String, Object>>> geoResponse = restTemplate.exchange(
                geoUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );

        List<Map<String, Object>> geoResponseBody = geoResponse.getBody();

        if (geoResponseBody == null || geoResponseBody.isEmpty()) {
            throw new RuntimeException("Invalid location: " + location);
        }

        // Extract lat/lon from the geocoding response
        Map<String, Object> geoData = geoResponseBody.get(0);
        double lat = ((Number) geoData.get("lat")).doubleValue();
        double lon = ((Number) geoData.get("lon")).doubleValue();

        // Call the original method with lat and lon
        return getHourlyForecast(lat, lon, hours);
    }

    // Overloaded historical weather method to return Map
    public Map<String, Object> getHistoricalWeather(double lat, double lon, String period) {
        long timestamp = Long.parseLong(period);

        String url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=" + lat +
                "&lon=" + lon + "&dt=" + timestamp + "&appid=" + apiKey + "&units=metric";

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return response.getBody();
    }

    // Get weather by geographic coordinates
    public WeatherData getWeatherByCoordinates(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/weather")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .build()
                .toUriString();

        ResponseEntity<WeatherData> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                WeatherData.class
        );

        return response.getBody();
    }

    // Get air pollution data
    public Map<String, Object> getAirPollution(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/air_pollution")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .build()
                .toUriString();

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return response.getBody();
    }

    // Compare weather for multiple cities
    public List<Map<String, Object>> compareCities(List<String> cities) {
        return cities.stream()
                .map(city -> {
                    WeatherData cityWeather = getCurrentWeather(city);
                    Map<String, Object> cityData = new HashMap<>();
                    cityData.put("city", city);
                    cityData.put("weather", cityWeather);
                    return cityData;
                })
                .collect(Collectors.toList());
    }

    // Get historical weather data
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
}