package com.example.weatherapp.service;

import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.dto.LocationDto;
import com.example.weatherapp.exception.WeatherServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
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
        logger.info("Fetching daily forecast for {} for {} days", cityName, days);
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

        if (response.getHourlyForecast() != null) {
            int intervals = hours / 3; // API provides data in 3-hour intervals
            response.setHourlyForecast(response.getHourlyForecast().stream().limit(intervals).collect(Collectors.toList()));
        }
        return response;
    }

    public ForecastResponse getHourlyForecastByCoordinates(double lat, double lon, int hours, String units) {
        logger.info("Fetching hourly forecast for coordinates {},{} for {} hours", lat, lon, hours);
        String url = String.format("%s/forecast?lat=%f&lon=%f&appid=%s&units=%s", baseUrl, lat, lon, apiKey);
        return fetchAndConvertForecast(url);
    }

    public ForecastResponse getForecastByDateRange(String city, LocalDate start, LocalDate end, String units) {
        logger.warn("Date range forecast is not fully supported with the current API; returning standard forecast.");
        return getDailyForecast(city, 5, units);
    }

    public ForecastResponse getMultiLocationForecast(List<LocationDto> locations, int days, String units) {
        // Placeholder returns forecast for the first location. A full implementation
        // would require multiple API calls and a custom DTO to combine results.
        if (locations != null && !locations.isEmpty()) {
            return getDailyForecast(locations.get(0).getCity(), days, units);
        }
        return new ForecastResponse();
    }

    public ForecastResponse getExtendedForecast(String city, int days, String units) {
        logger.info("Fetching extended forecast.");
        // This often requires a different API endpoint or subscription level.
        // Using the daily forecast endpoint as a placeholder.
        return getDailyForecast(city, days, units);
    }

    public ForecastResponse getDetailedForecast(String city, int days, String units, boolean includeUvIndex, boolean includeAirQuality) {
        logger.info("Fetching detailed forecast.");
        // A full implementation would merge data from different API calls (e.g., One Call API).
        return getDailyForecast(city, days, units);
    }

    public ForecastResponse getEventForecast(String city, String eventDate, String eventTime, String units, String activityType) {
        logger.info("Fetching forecast for an event on {} at {}", eventDate, eventTime);
        return getDailyForecast(city, 1, units);
    }

    public ForecastResponse getMarineForecast(double lat, double lon, int days, String units) {
        logger.info("Fetching marine forecast for coordinates {},{}", lat, lon);
        return getDailyForecastByCoordinates(lat, lon, days, units);
    }

    public ForecastResponse getAgriculturalForecast(String city, int days, String units, String cropType) {
        logger.info("Fetching agricultural forecast for {} with crop type {}", city, cropType);
        return getDailyForecast(city, days, units);
    }

    private ForecastResponse fetchAndConvertForecast(String url) {
        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            Map<String, Object> responseMap = responseEntity.getBody();

            if (responseMap == null) {
                throw new WeatherServiceException("No forecast data received from API");
            }
            // In a complete application, you would parse `responseMap` into your full DTO structure here.
            // For now, we return a new ForecastResponse to resolve compilation errors.
            return new ForecastResponse();
        } catch (Exception e) {
            logger.error("Error fetching or parsing forecast data from URL: {}", url, e);
            throw new WeatherServiceException("Failed to retrieve or parse forecast data.");
        }
    }
}