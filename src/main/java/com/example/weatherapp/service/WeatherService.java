package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.ForecastData;
import com.example.weatherapp.model.AirPollutionData;
import com.example.weatherapp.repository.WeatherRepository;
import com.example.weatherapp.repository.ForecastRepository;
import com.example.weatherapp.repository.AirPollutionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class WeatherService {

    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    private final WeatherRepository weatherRepository;
    private final ForecastRepository forecastRepository;
    private final AirPollutionRepository airPollutionRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public WeatherService(
            WeatherRepository weatherRepository,
            ForecastRepository forecastRepository,
            AirPollutionRepository airPollutionRepository,
            RestTemplate restTemplate) {
        this.weatherRepository = weatherRepository;
        this.forecastRepository = forecastRepository;
        this.airPollutionRepository = airPollutionRepository;
        this.restTemplate = restTemplate;
    }

    @Cacheable(value = "weatherCache", key = "#city")
    public WeatherData getWeather(String city) {
        String url = buildWeatherUrlByCity(city);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Failed to fetch weather data");
        }

        WeatherData weatherData = mapToWeatherData(response);
        return weatherRepository.save(weatherData);
    }

    @Cacheable(value = "weatherCache", key = "'coord_' + #lat + '_' + #lon")
    public WeatherData getWeatherByCoordinates(double lat, double lon) {
        String url = buildWeatherUrlByCoordinates(lat, lon);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Failed to fetch weather data");
        }

        WeatherData weatherData = mapToWeatherData(response);
        return weatherRepository.save(weatherData);
    }

    @Cacheable(value = "forecastCache", key = "#city")
    public List<ForecastData> getForecast(String city) {
        String url = buildForecastUrlByCity(city);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Failed to fetch forecast data");
        }

        List<ForecastData> forecastList = mapToForecastDataList(response);
        return forecastRepository.saveAll(forecastList);
    }

    @Cacheable(value = "forecastCache", key = "'coord_' + #lat + '_' + #lon")
    public List<ForecastData> getForecastByCoordinates(double lat, double lon) {
        String url = buildForecastUrlByCoordinates(lat, lon);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Failed to fetch forecast data");
        }

        List<ForecastData> forecastList = mapToForecastDataList(response);
        return forecastRepository.saveAll(forecastList);
    }

    @Cacheable(value = "pollutionCache", key = "'coord_' + #lat + '_' + #lon")
    public Map<String, Object> getAirPollution(double lat, double lon) {
        String url = buildAirPollutionUrl(lat, lon);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Failed to fetch air pollution data");
        }

        AirPollutionData pollutionData = mapToAirPollutionData(response, lat, lon);
        airPollutionRepository.save(pollutionData);

        // Return a simplified map for the API response
        return Map.of(
                "aqi", pollutionData.getAqi(),
                "aqiDescription", pollutionData.getAqiDescription(),
                "components", Map.of(
                        "co", pollutionData.getCo(),
                        "no2", pollutionData.getNo2(),
                        "o3", pollutionData.getO3(),
                        "pm2_5", pollutionData.getPm2_5(),
                        "pm10", pollutionData.getPm10(),
                        "so2", pollutionData.getSo2()
                )
        );
    }

    // Private helper methods
    private String buildWeatherUrlByCity(String city) {
        return String.format(
                "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric",
                city, apiKey
        );
    }

    private String buildWeatherUrlByCoordinates(double lat, double lon) {
        return String.format(
                "https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric",
                lat, lon, apiKey
        );
    }

    private String buildForecastUrlByCity(String city) {
        return String.format(
                "https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric",
                city, apiKey
        );
    }

    private String buildForecastUrlByCoordinates(double lat, double lon) {
        return String.format(
                "https://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric",
                lat, lon, apiKey
        );
    }

    private String buildAirPollutionUrl(double lat, double lon) {
        return String.format(
                "https://api.openweathermap.org/data/2.5/air_pollution?lat=%f&lon=%f&appid=%s",
                lat, lon, apiKey
        );
    }

    @SuppressWarnings("unchecked")
    private WeatherData mapToWeatherData(Map<String, Object> response) {
        WeatherData data = new WeatherData();

        data.setCity((String) response.get("name"));

        Map<String, Object> main = (Map<String, Object>) response.get("main");
        data.setTemperature(getDoubleValue(main, "temp"));
        data.setHumidity(getIntValue(main, "humidity"));

        Map<String, Object> wind = (Map<String, Object>) response.get("wind");
        data.setWindSpeed(getDoubleValue(wind, "speed"));

        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) response.get("weather");
        if (!weatherList.isEmpty()) {
            Map<String, Object> weather = weatherList.get(0);
            data.setCondition((String) weather.get("main"));
            data.setDescription((String) weather.get("description"));
            data.setIcon((String) weather.get("icon"));
        }

        return data;
    }

    @SuppressWarnings("unchecked")
    private List<ForecastData> mapToForecastDataList(Map<String, Object> response) {
        List<ForecastData> forecastList = new ArrayList<>();

        // Get city name
        Map<String, Object> cityInfo = (Map<String, Object>) response.get("city");
        String cityName = (String) cityInfo.get("name");

        // Process forecast list
        List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");

        for (Map<String, Object> item : list) {
            ForecastData forecast = new ForecastData();
            forecast.setCity(cityName);

            // Convert timestamp to LocalDateTime
            long timestamp = getLongValue(item, "dt");
            LocalDateTime dateTime = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(timestamp),
                    ZoneId.systemDefault()
            );
            forecast.setDateTime(dateTime);

            // Set day of week for UI grouping
            String dayOfWeek = dateTime.getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            forecast.setDayOfWeek(dayOfWeek);

            // Weather data
            Map<String, Object> main = (Map<String, Object>) item.get("main");
            forecast.setTemperature(getDoubleValue(main, "temp"));
            forecast.setFeelsLike(getDoubleValue(main, "feels_like"));
            forecast.setHumidity(getIntValue(main, "humidity"));

            // Wind data
            Map<String, Object> wind = (Map<String, Object>) item.get("wind");
            forecast.setWindSpeed(getDoubleValue(wind, "speed"));

            // Clouds data
            Map<String, Object> clouds = (Map<String, Object>) item.get("clouds");
            forecast.setCloudiness(getIntValue(clouds, "all"));

            // Precipitation data if available
            Map<String, Object> rain = (Map<String, Object>) item.get("rain");
            if (rain != null) {
                forecast.setPrecipitation(getDoubleValue(rain, "3h"));
            }

            // Weather conditions
            List<Map<String, Object>> weatherList = (List<Map<String, Object>>) item.get("weather");
            if (!weatherList.isEmpty()) {
                Map<String, Object> weather = weatherList.get(0);
                forecast.setCondition((String) weather.get("main"));
                forecast.setDescription((String) weather.get("description"));
                forecast.setIcon((String) weather.get("icon"));
            }

            forecastList.add(forecast);
        }

        return forecastList;
    }

    @SuppressWarnings("unchecked")
    private AirPollutionData mapToAirPollutionData(Map<String, Object> response, double lat, double lon) {
        AirPollutionData data = new AirPollutionData();
        data.setLatitude(lat);
        data.setLongitude(lon);

        // Get the first list item (current pollution data)
        List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
        if (list != null && !list.isEmpty()) {
            Map<String, Object> item = list.get(0);

            // Set timestamp
            long timestamp = getLongValue(item, "dt");
            data.setDateTime(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(timestamp),
                    ZoneId.systemDefault()
            ));

            // Set Air Quality Index
            Map<String, Object> main = (Map<String, Object>) item.get("main");
            data.setAqi(getIntValue(main, "aqi"));

            // Set pollutant concentrations
            Map<String, Object> components = (Map<String, Object>) item.get("components");
            data.setCo(getDoubleValue(components, "co"));
            data.setNo(getDoubleValue(components, "no"));
            data.setNo2(getDoubleValue(components, "no2"));
            data.setO3(getDoubleValue(components, "o3"));
            data.setSo2(getDoubleValue(components, "so2"));
            data.setPm2_5(getDoubleValue(components, "pm2_5"));
            data.setPm10(getDoubleValue(components, "pm10"));
            data.setNh3(getDoubleValue(components, "nh3"));
        }

        return data;
    }

    // Helper methods for safe value extraction
    private double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }

    private int getIntValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }

    private long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return 0L;
    }
}
