package com.example.weatherapp.service;

import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.dto.WeatherComparisonDto;
import com.example.weatherapp.dto.WeatherResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WeatherComparisonService {

    private final WeatherService weatherService;
    private final AirQualityService airQualityService;

    @Autowired
    public WeatherComparisonService(WeatherService weatherService, AirQualityService airQualityService) {
        this.weatherService = weatherService;
        this.airQualityService = airQualityService;
    }

    public WeatherComparisonDto compareCurrentWeather(List<Map<String, Double>> locations) {
        List<WeatherResponse> weatherDataList = new ArrayList<>();
        for (Map<String, Double> location : locations) {
            try {
                double lat = location.get("latitude");
                double lon = location.get("longitude");
                WeatherResponse weather = weatherService.getCurrentWeatherByCoordinates(lat, lon, null);
                weatherDataList.add(weather);
            } catch (Exception e) {
                System.err.println("Failed to fetch weather for coordinates: " + e.getMessage());
            }
        }

        WeatherComparisonDto comparisonDto = new WeatherComparisonDto();
        comparisonDto.setLocations(convertToCityWeatherList(weatherDataList));
        return comparisonDto;
    }

    /**
     * Implementation for comparing forecasts.
     */
    public Map<String, Object> compareForecast(List<Map<String, Double>> locations, int days) {
        Map<String, Object> comparisonResult = new HashMap<>();
        // This is a placeholder logic. A full implementation would compare daily forecasts.
        comparisonResult.put("message", "Forecast comparison for " + locations.size() + " locations over " + days + " days.");
        comparisonResult.put("locations_checked", locations);
        return comparisonResult;
    }

    /**
     * Implementation for comparing two specific cities.
     */
    public Map<String, Object> compareTwoCities(double lat1, double lon1, String city1, double lat2, double lon2, String city2) {
        Map<String, Object> comparison = new HashMap<>();
        try {
            WeatherResponse weather1 = weatherService.getCurrentWeatherByCoordinates(lat1, lon1, null);
            comparison.put(city1, weather1.getCurrent());
        } catch (Exception e) {
            comparison.put(city1, "Could not fetch weather data.");
        }
        try {
            WeatherResponse weather2 = weatherService.getCurrentWeatherByCoordinates(lat2, lon2, null);
            comparison.put(city2, weather2.getCurrent());
        } catch (Exception e) {
            comparison.put(city2, "Could not fetch weather data.");
        }
        return comparison;
    }

    /**
     * Implementation for comparing air quality.
     */
    public Map<String, Object> compareAirQuality(List<Map<String, Double>> locations) {
        Map<String, Object> comparison = new HashMap<>();
        for (Map<String, Double> location : locations) {
            try {
                double lat = location.get("latitude");
                double lon = location.get("longitude");
                AirQualityResponse aq = airQualityService.getCurrentAirQualityByLocation(lat, lon);
                comparison.put("Location(" + lat + "," + lon + ")", aq.getCurrent());
            } catch (Exception e) {
                // Handle exceptions for individual locations
            }
        }
        return comparison;
    }

    private List<WeatherComparisonDto.CityWeatherComparison> convertToCityWeatherList(List<WeatherResponse> weatherResponses) {
        return weatherResponses.stream().map(weather -> {
            WeatherComparisonDto.LocationDto locationDto = new WeatherComparisonDto.LocationDto();
            locationDto.setCity(weather.getCityName());
            locationDto.setCountry(weather.getCountryName());
            locationDto.setLatitude(weather.getLatitude());
            locationDto.setLongitude(weather.getLongitude());

            WeatherComparisonDto.CityWeatherComparison cityWeather = new WeatherComparisonDto.CityWeatherComparison();
            cityWeather.setLocation(locationDto);

            WeatherResponse.CurrentWeather current = weather.getCurrent();
            if (current != null) {
                cityWeather.setTemperature(current.getTemperature());
                cityWeather.setCondition(current.getWeatherMain());
                cityWeather.setHumidity(current.getHumidity());
                cityWeather.setWindSpeed(current.getWindSpeed());
            }
            return cityWeather;
        }).collect(Collectors.toList());
    }
}