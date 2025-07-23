// src/main/java/com/weatherapp/service/WeatherService.java

package com.example.weatherapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


@Service
public class WeatherService {

    // Inject the API key from application.properties
    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    private final RestTemplate restTemplate;
    private static final String OPENWEATHER_API_URL = "http://api.openweathermap.org/data/2.5/";

    public WeatherService() {
        this.restTemplate = new RestTemplate();
    }


    public String getCurrentWeather(String city) {
        String url = String.format("%sweather?q=%s&appid=%s&units=metric", OPENWEATHER_API_URL, city, apiKey);
        // In a real app, you'd map this response to a DTO instead of returning a raw string.
        return restTemplate.getForObject(url, String.class);
    }

    public String getForecast(String city) {
        String url = String.format("%sforecast?q=%s&appid=%s&units=metric", OPENWEATHER_API_URL, city, apiKey);
        return restTemplate.getForObject(url, String.class);
    }


    public String getAirPollution(double lat, double lon) {
        String url = String.format("%sair/pollution?lat=%f&lon=%f&appid=%s", OPENWEATHER_API_URL, lat, lon, apiKey);
        return restTemplate.getForObject(url, String.class);
    }
}
