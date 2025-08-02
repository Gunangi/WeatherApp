// src/main/java/com/example/weatherapp/service/WeatherService.java
package com.example.weatherapp.service;

import com.example.weatherapp.client.OpenWeatherMapClient;
import com.example.weatherapp.client.dto.CurrentWeatherResponse;
import com.example.weatherapp.client.dto.GeoCoordinates;
import com.example.weatherapp.client.dto.UvIndexResponseDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.repository.WeatherDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    private final WeatherDataRepository weatherDataRepository;
    private final OpenWeatherMapClient weatherClient;
    private final LocationService locationService;
    private final WeatherAlertService weatherAlertService;

    public WeatherResponse getWeatherForCity(String city, String userId) {
        GeoCoordinates coords = weatherClient.getCoordinatesForCity(city)
                .orElseThrow(() -> new LocationNotFoundException("Could not find coordinates for city: " + city));

        try {
            CurrentWeatherResponse liveData = weatherClient.getCurrentWeather(coords.getLat(), coords.getLon());

            // Fetch UV Index
            UvIndexResponseDto uvData = null;
            try {
                uvData = weatherClient.getUvIndex(coords.getLat(), coords.getLon());
            } catch (Exception e) {
                log.warn("Failed to fetch UV index for {}: {}", city, e.getMessage());
            }

            if (userId != null && !userId.isBlank()) {
                locationService.saveSearchHistory(userId, city);
            }

            WeatherResponse response = mapToWeatherResponse(liveData, uvData);

            // Save weather data for caching
            saveOrUpdateWeatherData(city, liveData, uvData);

            // Check for weather alerts
            weatherAlertService.checkAndCreateAlerts(city, response);

            return response;

        } catch (Exception e) {
            log.error("Failed to fetch live weather data for {}", city, e);
            Optional<WeatherData> cachedData = weatherDataRepository.findByCityIgnoreCase(city);
            if (cachedData.isPresent()) {
                log.info("Returning cached weather data for {}", city);
                return mapToWeatherResponse(cachedData.get());
            } else {
                throw new LocationNotFoundException("Weather data not available for " + city + " and could not be fetched.");
            }
        }
    }

    private void saveOrUpdateWeatherData(String city, CurrentWeatherResponse liveData, UvIndexResponseDto uvData) {
        try {
            WeatherData weatherData = weatherDataRepository.findByCityIgnoreCase(city)
                    .orElse(new WeatherData());

            weatherData.setCity(city);
            weatherData.setTemperature(liveData.getMain().getTemp());
            weatherData.setDescription(liveData.getWeather().get(0).getDescription());
            weatherData.setFeelsLike(liveData.getMain().getFeels_like());
            weatherData.setHumidity(liveData.getMain().getHumidity());
            weatherData.setWindSpeed(liveData.getWind().getSpeed());
            weatherData.setPressure(liveData.getMain().getPressure());
            weatherData.setVisibility(liveData.getVisibility());
            weatherData.setSunrise(Instant.ofEpochSecond(liveData.getSys().getSunrise()));
            weatherData.setSunset(Instant.ofEpochSecond(liveData.getSys().getSunset()));
            weatherData.setTimestamp(Instant.now());

            weatherDataRepository.save(weatherData);
        } catch (Exception e) {
            log.error("Failed to save weather data for {}", city, e);
        }
    }

    // Enhanced mapper for live data from API
    private WeatherResponse mapToWeatherResponse(CurrentWeatherResponse data, UvIndexResponseDto uvData) {
        WeatherResponse response = new WeatherResponse();

        response.setTemperature(data.getMain().getTemp());
        response.setFeelsLike(data.getMain().getFeels_like());
        response.setHumidity(data.getMain().getHumidity());
        response.setWindSpeed(data.getWind().getSpeed());
        response.setPressure(data.getMain().getPressure());
        response.setVisibility(data.getVisibility() / 1000.0); // Convert meters to km
        response.setSunrise(Instant.ofEpochSecond(data.getSys().getSunrise()));
        response.setSunset(Instant.ofEpochSecond(data.getSys().getSunset()));

        // Weather information
        if (data.getWeather() != null && !data.getWeather().isEmpty()) {
            CurrentWeatherResponse.Weather weatherInfo = data.getWeather().get(0);
            response.setWeatherMain(weatherInfo.getMain());
            response.setWeatherDescription(weatherInfo.getDescription());
            response.setWeatherIcon(weatherInfo.getIcon());
        }

        // Cloud cover
        if (data.getClouds() != null) {
            response.setCloudCover(data.getClouds().getAll());
        }

        // Wind direction
        if (data.getWind() != null) {
            response.setWindDirection(data.getWind().getDeg());
            response.setWindDirectionText(getWindDirectionText(data.getWind().getDeg()));
        }

        // UV Index
        if (uvData != null) {
            response.setUvIndex(uvData.getValue());
            response.setUvIndexText(getUvIndexText(uvData.getValue()));
        }

        // Calculate dew point
        response.setDewPoint(calculateDewPoint(data.getMain().getTemp(), data.getMain().getHumidity()));

        // Local time
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a")
                .withZone(ZoneId.of("UTC").normalized());
        response.setLocalTime(timeFormatter.format(Instant.ofEpochSecond(data.getDt() + data.getTimezone())));

        return response;
    }

    // Mapper for cached data from Database
    private WeatherResponse mapToWeatherResponse(WeatherData data) {
        WeatherResponse response = new WeatherResponse();

        response.setTemperature(data.getTemperature());
        response.setFeelsLike(data.getFeelsLike());
        response.setHumidity(data.getHumidity());
        response.setWindSpeed(data.getWindSpeed());
        response.setPressure(data.getPressure());
        response.setVisibility(data.getVisibility() / 1000.0);
        response.setSunrise(data.getSunrise());
        response.setSunset(data.getSunset());
        response.setWeatherDescription(data.getDescription());

        return response;
    }

    private String getWindDirectionText(double degrees) {
        if (degrees >= 348.75 || degrees < 11.25) return "N";
        else if (degrees < 33.75) return "NNE";
        else if (degrees < 56.25) return "NE";
        else if (degrees < 78.75) return "ENE";
        else if (degrees < 101.25) return "E";
        else if (degrees < 123.75) return "ESE";
        else if (degrees < 146.25) return "SE";
        else if (degrees < 168.75) return "SSE";
        else if (degrees < 191.25) return "S";
        else if (degrees < 213.75) return "SSW";
        else if (degrees < 236.25) return "SW";
        else if (degrees < 258.75) return "WSW";
        else if (degrees < 281.25) return "W";
        else if (degrees < 303.75) return "WNW";
        else if (degrees < 326.25) return "NW";
        else return "NNW";
    }

    private String getUvIndexText(double uvIndex) {
        if (uvIndex <= 2) return "Low";
        else if (uvIndex <= 5) return "Moderate";
        else if (uvIndex <= 7) return "High";
        else if (uvIndex <= 10) return "Very High";
        else return "Extreme";
    }

    private double calculateDewPoint(double temperature, int humidity) {
        // Magnus formula for dew point calculation
        double a = 17.27;
        double b = 237.7;
        double alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100.0);
        return (b * alpha) / (a - alpha);
    }
}