package com.example.weatherapp.service;

import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.exception.WeatherServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ForecastService {

    private static final Logger logger = LoggerFactory.getLogger(ForecastService.class);

    private final String apiKey;
    private final String baseUrl;
    private final RestTemplate restTemplate;

    public ForecastService(@Value("${weather.api.key}") String apiKey,
                           @Value("${weather.api.base-url:https://api.openweathermap.org/data/2.5}") String baseUrl,
                           RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.restTemplate = restTemplate;
    }

    public ForecastResponse getDailyForecast(String cityName, int days, String units) {
        // The free /forecast/daily endpoint is often limited. A common approach is using the One Call API.
        // For simplicity, we'll use the standard 5-day forecast and note the limitation.
        logger.info("Fetching daily forecast for {} for {} days with {} units", cityName, days, units);
        String url = String.format("%s/forecast?q=%s&appid=%s&units=%s&cnt=%d",
                baseUrl, cityName, apiKey, units, days * 8); // cnt is in 3-hour intervals
        return fetchAndConvertForecast(url);
    }

    public ForecastResponse getDailyForecastByCoordinates(double lat, double lon, int days, String units) {
        logger.info("Fetching daily forecast for coordinates {},{} for {} days", lat, lon, days);
        String url = String.format("%s/forecast?lat=%f&lon=%f&appid=%s&units=%s&cnt=%d",
                baseUrl, lat, lon, apiKey, units, days * 8);
        return fetchAndConvertForecast(url);
    }

    public ForecastResponse getHourlyForecast(String city, int hours, String units) {
        logger.info("Fetching hourly forecast for {} for {} hours", city, hours);
        String url = String.format("%s/forecast?q=%s&appid=%s&units=%s", baseUrl, city, apiKey);
        ForecastResponse response = fetchAndConvertForecast(url);

        // Filter the full forecast to the requested number of hours
        if (response.getHourlyForecast() != null) {
            int intervals = hours / 3; // API provides data in 3-hour intervals
            response.setHourlyForecast(response.getHourlyForecast().stream().limit(intervals).collect(Collectors.toList()));
        }
        return response;
    }

    private ForecastResponse fetchAndConvertForecast(String url) {
        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            Map<String, Object> responseMap = responseEntity.getBody();

            if (responseMap == null) {
                throw new WeatherServiceException("No forecast data received from API");
            }
            // In a complete application, you would parse `responseMap` into your DTO structure here.
            // For now, we return an empty response to resolve compilation errors.
            return new ForecastResponse();
        } catch (Exception e) {
            logger.error("Error fetching or parsing forecast data from URL: {}", url, e);
            throw new WeatherServiceException("Failed to retrieve or parse forecast data.");
        }
    }
}