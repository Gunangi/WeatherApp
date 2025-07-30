package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.ForecastData;
import com.example.weatherapp.model.AirQualityData;
import com.example.weatherapp.model.Location;
import com.example.weatherapp.repository.WeatherRepository;
import com.example.weatherapp.external.OpenWeatherMapClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class WeatherService {

    @Autowired
    private WeatherRepository weatherRepository;

    @Autowired
    private OpenWeatherMapClient weatherClient;

    @Autowired
    private NotificationService notificationService;

    @Cacheable(value = "currentWeather", key = "#location.city + '_' + #location.country")
    public WeatherData getCurrentWeather(Location location) {
        try {
            log.info("Fetching current weather for: {}, {}", location.getCity(), location.getCountry());

            WeatherData weatherData = weatherClient.getCurrentWeather(location);
            weatherData.setTimestamp(LocalDateTime.now());

            // Save to database for historical tracking
            weatherRepository.save(weatherData);

            // Check for severe weather alerts
            checkWeatherAlerts(weatherData, location);

            return weatherData;
        } catch (Exception e) {
            log.error("Error fetching current weather for {}: {}", location.getCity(), e.getMessage());
            // Return cached data if available
            return getCachedWeatherData(location);
        }
    }

    @Cacheable(value = "forecast", key = "#location.city + '_' + #days")
    public List<ForecastData> getForecast(Location location, int days) {
        try {
            log.info("Fetching {}-day forecast for: {}, {}", days, location.getCity(), location.getCountry());

            List<ForecastData> forecast = weatherClient.getForecast(location, days);

            // Save forecast data
            forecast.forEach(f -> {
                f.setLocation(location);
                weatherRepository.saveForecast(f);
            });

            return forecast;
        } catch (Exception e) {
            log.error("Error fetching forecast for {}: {}", location.getCity(), e.getMessage());
            return getCachedForecastData(location, days);
        }
    }

    @Cacheable(value = "hourlyForecast", key = "#location.city + '_24h'")
    public List<ForecastData> getHourlyForecast(Location location) {
        try {
            log.info("Fetching hourly forecast for: {}, {}", location.getCity(), location.getCountry());
            return weatherClient.getHourlyForecast(location, 24);
        } catch (Exception e) {
            log.error("Error fetching hourly forecast for {}: {}", location.getCity(), e.getMessage());
            return getCachedHourlyForecast(location);
        }
    }

    @Cacheable(value = "airQuality", key = "#location.city")
    public AirQualityData getAirQuality(Location location) {
        try {
            log.info("Fetching air quality for: {}, {}", location.getCity(), location.getCountry());

            AirQualityData airQuality = weatherClient.getAirQuality(location);
            airQuality.setTimestamp(LocalDateTime.now());

            // Save air quality data
            weatherRepository.saveAirQuality(airQuality);

            return airQuality;
        } catch (Exception e) {
            log.error("Error fetching air quality for {}: {}", location.getCity(), e.getMessage());
            return getCachedAirQualityData(location);
        }
    }

    public List<WeatherData> getHistoricalWeather(Location location, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching historical weather for: {} from {} to {}", location.getCity(), startDate, endDate);
        return weatherRepository.findByLocationAndDateRange(location, startDate, endDate);
    }

    public WeatherData getWeatherByCoordinates(double latitude, double longitude) {
        Location location = Location.builder()
                .latitude(latitude)
                .longitude(longitude)
                .build();

        return getCurrentWeather(location);
    }

    public List<Location> searchCities(String query) {
        try {
            log.info("Searching cities with query: {}", query);
            return weatherClient.searchCities(query);
        } catch (Exception e) {
            log.error("Error searching cities: {}", e.getMessage());
            return List.of();
        }
    }

    private void checkWeatherAlerts(WeatherData weatherData, Location location) {
        // Check for severe weather conditions
        if (weatherData.getTemperature() > 40 || weatherData.getTemperature() < -10) {
            notificationService.sendWeatherAlert(location, "Extreme Temperature Alert",
                    String.format("Temperature is %s°C", weatherData.getTemperature()));
        }

        if (weatherData.getWindSpeed() > 15) {
            notificationService.sendWeatherAlert(location, "High Wind Alert",
                    String.format("Wind speed is %s m/s", weatherData.getWindSpeed()));
        }

        if (weatherData.getCondition().toLowerCase().contains("storm") ||
                weatherData.getCondition().toLowerCase().contains("thunder")) {
            notificationService.sendWeatherAlert(location, "Storm Alert",
                    "Thunderstorm conditions detected");
        }
    }

    private WeatherData getCachedWeatherData(Location location) {
        Optional<WeatherData> cached = weatherRepository.findLatestByLocation(location);
        return cached.orElse(null);
    }

    private List<ForecastData> getCachedForecastData(Location location, int days) {
        return weatherRepository.findForecastByLocation(location, days);
    }

    private List<ForecastData> getCachedHourlyForecast(Location location) {
        return weatherRepository.findHourlyForecastByLocation(location);
    }

    private AirQualityData getCachedAirQualityData(Location location) {
        Optional<AirQualityData> cached = weatherRepository.findLatestAirQualityByLocation(location);
        return cached.orElse(null);
    }

    public void refreshWeatherData(Location location) {
        log.info("Refreshing weather data for: {}", location.getCity());
        // Clear cache and fetch fresh data
        getCurrentWeather(location);
        getForecast(location, 5);
        getAirQuality(location);
    }
}