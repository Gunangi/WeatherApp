// src/main/java/com/weatherapp/service/WeatherService.java
package com.example.weatherapp.service;

import com.example.weatherapp.client.OpenWeatherMapClient;
import com.example.weatherapp.client.dto.CurrentWeatherResponse;
import com.example.weatherapp.client.dto.GeoCoordinates;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.repository.WeatherDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final WeatherDataRepository weatherDataRepository;
    private final OpenWeatherMapClient weatherClient;
    private final LocationService locationService;

    public WeatherResponse getWeatherForCity(String city, String userId) {
        GeoCoordinates coords = weatherClient.getCoordinatesForCity(city)
                .orElseThrow(() -> new LocationNotFoundException("Could not find coordinates for city: " + city));

        try {
            CurrentWeatherResponse liveData = weatherClient.getCurrentWeather(coords.getLat(), coords.getLon());

            if (userId != null && !userId.isBlank()) {
                locationService.saveSearchHistory(userId, city);
            }

            saveOrUpdateWeatherData(city, liveData);
            return mapToWeatherResponse(liveData);

        } catch (Exception e) {
            Optional<WeatherData> cachedData = weatherDataRepository.findByCityIgnoreCase(city);
            if (cachedData.isPresent()) {
                return mapToWeatherResponse(cachedData.get());
            } else {
                throw new LocationNotFoundException("Weather data not available for " + city + " and could not be fetched.");
            }
        }
    }

    private void saveOrUpdateWeatherData(String city, CurrentWeatherResponse liveData) {
        WeatherData weatherData = weatherDataRepository.findByCityIgnoreCase(city)
                .orElse(new WeatherData());

        weatherData.setCity(city);
        weatherData.setTemperature(liveData.getMain().getTemp());
        // FIX: The model still uses 'description', which is fine. The DTO is what changed.
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
    }

    // Mapper for live data from API
    private WeatherResponse mapToWeatherResponse(CurrentWeatherResponse data) {
        WeatherResponse response = new WeatherResponse();

        // FIX: Using the new setters from the updated WeatherResponse DTO
        response.setTemperature(data.getMain().getTemp());
        response.setFeelsLike(data.getMain().getFeels_like());
        response.setHumidity(data.getMain().getHumidity());
        response.setWindSpeed(data.getWind().getSpeed());
        response.setPressure(data.getMain().getPressure());
        response.setVisibility(data.getVisibility() / 1000.0); // Convert meters to km
        response.setSunrise(Instant.ofEpochSecond(data.getSys().getSunrise()));
        response.setSunset(Instant.ofEpochSecond(data.getSys().getSunset()));

        if (data.getWeather() != null && !data.getWeather().isEmpty()) {
            CurrentWeatherResponse.Weather weatherInfo = data.getWeather().get(0);
            response.setWeatherMain(weatherInfo.getMain());
            response.setWeatherDescription(weatherInfo.getDescription());
            response.setWeatherIcon(weatherInfo.getIcon());
        }

        if (data.getClouds() != null) {
            response.setCloudCover(data.getClouds().getAll());
        }

        if (data.getWind() != null) {
            response.setWindDirection(data.getWind().getDeg());
        }

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a").withZone(ZoneId.of("UTC").normalized());
        response.setLocalTime(timeFormatter.format(Instant.ofEpochSecond(data.getDt() + data.getTimezone())));

        return response;
    }

    // Mapper for cached data from Database
    private WeatherResponse mapToWeatherResponse(WeatherData data) {
        WeatherResponse response = new WeatherResponse();

        // FIX: Mapping cached data to the new DTO structure
        response.setTemperature(data.getTemperature());
        response.setFeelsLike(data.getFeelsLike());
        response.setHumidity(data.getHumidity());
        response.setWindSpeed(data.getWindSpeed());
        response.setPressure(data.getPressure());
        response.setVisibility(data.getVisibility() / 1000.0);
        response.setSunrise(data.getSunrise());
        response.setSunset(data.getSunset());
        response.setWeatherDescription(data.getDescription()); // Map the simple description

        // Other fields like UV index, icon, etc., would need to be stored in WeatherData to be mapped here.
        // For now, they will be null/default when serving from cache.

        return response;
    }
}