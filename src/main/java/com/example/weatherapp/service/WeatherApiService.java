package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.WeatherData;
import org.springframework.beans.factory.annotation.Autowired;
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
    private String apiKey;

    private final String WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";
    private final RestTemplate restTemplate;


    // Constructor for dependency injection of RestTemplate
    public WeatherApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Get current weather for a specific location
    public WeatherData getCurrentWeather(String location) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/weather")
                .queryParam("q", location)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .toUriString();

        return restTemplate.getForObject(url, WeatherData.class);
    }

    // Get weather forecast for a specific location
    public Map<String, Object> getForecast(String location, int days) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/forecast")
                .queryParam("q", location)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .queryParam("cnt", Math.min(days * 8, 40)) // 8 data points per day (3-hour intervals)
                .toUriString();

        return restTemplate.getForObject(url, Map.class);
    }

    // Get hourly forecast by coordinates
    public List<Map<String, Object>> getHourlyForecast(double lat, double lon, int hours) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/forecast")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .queryParam("cnt", Math.min(hours / 3, 40)) // Each forecast point is 3 hours
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("list")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> hourlyList = (List<Map<String, Object>>) response.get("list");
        return hourlyList.subList(0, Math.min(hours / 3, hourlyList.size()));
    }

    // Get weather by geographic coordinates
    public WeatherData getWeatherByCoordinates(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/weather")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .toUriString();

        return restTemplate.getForObject(url, WeatherData.class);
    }

    // Get air pollution data
    public Map<String, Object> getAirPollution(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(WEATHER_API_BASE_URL + "/air_pollution")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .toUriString();

        return restTemplate.getForObject(url, Map.class);
    }

    // Compare weather for multiple cities
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