// src/main/java/com/weatherapp/client/OpenWeatherMapClient.java
package com.example.weatherapp.client;

import com.example.weatherapp.client.dto.AirQualityResponseDto;
import com.example.weatherapp.client.dto.CurrentWeatherResponse;
import com.example.weatherapp.client.dto.ForecastResponseDto;
import com.example.weatherapp.client.dto.GeoCoordinates;
import com.example.weatherapp.exception.WeatherServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OpenWeatherMapClient {

    private final RestTemplate restTemplate;

    @Value("${openweathermap.api.key}")
    private String apiKey;
    @Value("${https://api.openweathermap.org/data/2.5}")
    private String weatherUrl;
    @Value("${https://api.openweathermap.org/data/2.5/forecast}")
    private String forecastUrl;
    @Value("${https://api.openweathermap.org/data/2.5/air_pollution}")
    private String airQualityUrl;
    @Value("${https://api.openweathermap.org/geo/1.0}")
    private String geocodingUrl;

    public Optional<GeoCoordinates> getCoordinatesForCity(String city) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(geocodingUrl)
                .queryParam("q", city)
                .queryParam("limit", 1)
                .queryParam("appid", apiKey);

        try {
            GeoCoordinates[] response = restTemplate.getForObject(uriBuilder.toUriString(), GeoCoordinates[].class);
            return Arrays.stream(response).findFirst();
        } catch (Exception e) {
            throw new WeatherServiceException("Failed to fetch coordinates for city: " + city);
        }
    }

    public CurrentWeatherResponse getCurrentWeather(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(weatherUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric");
        return restTemplate.getForObject(uriBuilder.toUriString(), CurrentWeatherResponse.class);
    }

    public ForecastResponseDto getForecast(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(forecastUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric");
        return restTemplate.getForObject(uriBuilder.toUriString(), ForecastResponseDto.class);
    }

    public AirQualityResponseDto getAirQuality(double lat, double lon) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(airQualityUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey);
        return restTemplate.getForObject(uriBuilder.toUriString(), AirQualityResponseDto.class);
    }
}