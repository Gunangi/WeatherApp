// src/main/java/com/weatherapp/service/AirQualityService.java
package com.example.weatherapp.service;

import com.example.weatherapp.client.OpenWeatherMapClient;
import com.example.weatherapp.client.dto.AirQualityResponseDto;
import com.example.weatherapp.client.dto.GeoCoordinates;
import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.exception.LocationNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AirQualityService {

    private final OpenWeatherMapClient weatherClient;

    public AirQualityResponse getAirQualityForCity(String city) {
        GeoCoordinates coords = weatherClient.getCoordinatesForCity(city)
                .orElseThrow(() -> new LocationNotFoundException("Could not find coordinates for city: " + city));

        AirQualityResponseDto aqData = weatherClient.getAirQuality(coords.getLat(), coords.getLon());

        return mapToAirQualityResponse(aqData, city);
    }

    private AirQualityResponse mapToAirQualityResponse(AirQualityResponseDto data, String city) {
        AirQualityResponse response = new AirQualityResponse();
        AirQualityResponseDto.AQData aq = data.getList().get(0);
        Map<String, Double> components = aq.getComponents();

        response.setCity(city);
        response.setAqi(aq.getMain().getAqi());

        // FIX: Use map.getOrDefault("key", defaultValue) to safely retrieve values.
        response.setCo(components.getOrDefault("co", 0.0));
        response.setNo(components.getOrDefault("no", 0.0));
        response.setNo2(components.getOrDefault("no2", 0.0));
        response.setO3(components.getOrDefault("o3", 0.0));
        response.setSo2(components.getOrDefault("so2", 0.0));
        response.setPm2_5(components.getOrDefault("pm2_5", 0.0));
        response.setPm10(components.getOrDefault("pm10", 0.0));
        response.setNh3(components.getOrDefault("nh3", 0.0));

        response.setHealthImpact(determineHealthImpact(aq.getMain().getAqi()));

        return response;
    }

    private String determineHealthImpact(int aqi) {
        // FIX: Replaced with a cleaner, enhanced switch statement.
        return switch (aqi) {
            case 1 -> "Good";
            case 2 -> "Fair";
            case 3 -> "Moderate";
            case 4 -> "Poor";
            case 5 -> "Very Poor";
            default -> "Unknown";
        };
    }
}