// src/main/java/com/example/weatherapp/client/OpenWeatherMapClient.java
package com.example.weatherapp.client;

import com.example.weatherapp.client.dto.AirQualityResponseDto;
import com.example.weatherapp.client.dto.CurrentWeatherResponse;
import com.example.weatherapp.client.dto.ForecastResponseDto;
import com.example.weatherapp.client.dto.GeoCoordinates;
import com.example.weatherapp.client.dto.UvIndexResponseDto;
import com.example.weatherapp.exception.WeatherServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenWeatherMapClient {

    private final RestTemplate restTemplate;

    @Value("${openweathermap.api.key}")
    private String apiKey;

    @Value("${weather.api.openweathermap.url:https://api.openweathermap.org/data/2.5}")
    private String weatherUrl;

    @Value("${weather.api.forecast.url:https://api.openweathermap.org/data/2.5/forecast}")
    private String forecastUrl;

    @Value("${weather.api.airquality.url:https://api.openweathermap.org/data/2.5/air_pollution}")
    private String airQualityUrl;

    @Value("${weather.api.geocoding.url:https://api.openweathermap.org/geo/1.0/direct}")
    private String geocodingUrl;

    @Value("${weather.api.uvindex.url:https://api.openweathermap.org/data/2.5/uvi}")
    private String uvIndexUrl;

    public Optional<GeoCoordinates> getCoordinatesForCity(String city) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(geocodingUrl)
                .queryParam("q", city)
                .queryParam("limit", 1)
                .queryParam("appid", apiKey);

        try {
            log.debug("Fetching coordinates for city: {}", city);
            GeoCoordinates[] response = restTemplate.getForObject(uriBuilder.toUriString(), GeoCoordinates[].class);
            return response != null && response.length > 0 ? Optional.of(response[0]) : Optional.empty();
        } catch (Exception e) {
            log.error("Failed to fetch coordinates for city: {}", city, e);
            throw new WeatherServiceException("Failed to fetch coordinates for city: " + city);
        }
    }

    public CurrentWeatherResponse getCurrentWeather(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(weatherUrl + "/weather")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric");

        try {
            log.debug("Fetching current weather for coordinates: {}, {}", lat, lon);
            return restTemplate.getForObject(uriBuilder.toUriString(), CurrentWeatherResponse.class);
        } catch (Exception e) {
            log.error("Failed to fetch current weather for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch current weather data");
        }
    }

    public ForecastResponseDto getForecast(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(forecastUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric");

        try {
            log.debug("Fetching forecast for coordinates: {}, {}", lat, lon);
            return restTemplate.getForObject(uriBuilder.toUriString(), ForecastResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to fetch forecast for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch forecast data");
        }
    }

    public AirQualityResponseDto getAirQuality(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(airQualityUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey);

        try {
            log.debug("Fetching air quality for coordinates: {}, {}", lat, lon);
            return restTemplate.getForObject(uriBuilder.toUriString(), AirQualityResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to fetch air quality for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch air quality data");
        }
    }

    public UvIndexResponseDto getUvIndex(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(uvIndexUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey);

        try {
            log.debug("Fetching UV index for coordinates: {}, {}", lat, lon);
            return restTemplate.getForObject(uriBuilder.toUriString(), UvIndexResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to fetch UV index for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch UV index data");
        }
    }
}