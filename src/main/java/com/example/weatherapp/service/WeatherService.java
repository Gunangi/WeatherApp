package com.example.weatherapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@Service
public class WeatherService {

    @Value("${openweathermap.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private static final String OPENWEATHER_API_URL = "http://api.openweathermap.org/data/2.5/";

    // Constructor injection instead of @Autowired
    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getCurrentWeather(String city) {
        try {
            String url = String.format("%sweather?q=%s&appid=%s&units=metric", OPENWEATHER_API_URL, city, apiKey);
            return restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch current weather for city: " + city, e);
        }
    }

    public String getForecast(String city) {
        try {
            String url = String.format("%sforecast?q=%s&appid=%s&units=metric", OPENWEATHER_API_URL, city, apiKey);
            return restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch forecast for city: " + city, e);
        }
    }

    public String getAirPollution(double lat, double lon) {
        try {
            String url = String.format("%sair_pollution?lat=%f&lon=%f&appid=%s", OPENWEATHER_API_URL, lat, lon, apiKey);
            return restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch air pollution data", e);
        }
    }
}