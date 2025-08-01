package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.User;
import com.example.weatherapp.repository.WeatherDataRepository;
import com.example.weatherapp.repository.UserRepository;
import com.example.weatherapp.exception.WeatherServiceException;
import com.example.weatherapp.exception.LocationNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@Service
public class WeatherService {

    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;

    @Autowired
    private WeatherDataRepository weatherDataRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private LocationService locationService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Get current weather by city name
     */
    public WeatherResponse getCurrentWeatherByCity(String cityName, String userId) {
        try {
            String url = String.format("%s/weather?q=%s&appid=%s&units=metric",
                    baseUrl, cityName, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No weather data received from API");
            }

            WeatherData weatherData = parseWeatherResponse(response);
            weatherData.setUserId(userId);
            weatherData.setRequestTime(LocalDateTime.now());

            // Save to database
            weatherDataRepository.save(weatherData);

            // Update location history
            locationService.addToLocationHistory(userId, cityName,
                    weatherData.getLatitude(), weatherData.getLongitude());

            // Check for weather alerts
            checkWeatherAlerts(weatherData, userId);

            return convertToWeatherResponse(weatherData);

        } catch (RestClientException e) {
            logger.error("Error fetching weather data for city: {}", cityName, e);
            throw new WeatherServiceException("Failed to fetch weather data: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in getCurrentWeatherByCity", e);
            throw new WeatherServiceException("Unexpected error occurred");
        }
    }

    /**
     * Get current weather by coordinates
     */
    public WeatherResponse getCurrentWeatherByCoordinates(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/weather?lat=%f&lon=%f&appid=%s&units=metric",
                    baseUrl, lat, lon, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No weather data received from API");
            }

            WeatherData weatherData = parseWeatherResponse(response);
            weatherData.setUserId(userId);
            weatherData.setRequestTime(LocalDateTime.now());

            // Save to database
            weatherDataRepository.save(weatherData);

            // Check for weather alerts
            checkWeatherAlerts(weatherData, userId);

            return convertToWeatherResponse(weatherData);

        } catch (RestClientException e) {
            logger.error("Error fetching weather data for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch weather data: " + e.getMessage());
        }
    }

    /**
     * Get weather data with user preferences applied
     */
    public WeatherResponse getWeatherWithPreferences(String cityName, String userId) {
        WeatherResponse weather = getCurrentWeatherByCity(cityName, userId);

        // Apply user preferences for units
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("fahrenheit".equalsIgnoreCase(user.getTemperatureUnit())) {
                weather = convertToFahrenheit(weather);
            }
            if ("mph".equalsIgnoreCase(user.getWindSpeedUnit())) {
                weather = convertWindSpeedToMph(weather);
            }
        }

        return weather;
    }

    /**
     * Parse weather API response to WeatherData model
     */
    private WeatherData parseWeatherResponse(Map<String, Object> response) {
        WeatherData weatherData = new WeatherData();

        try {
            // Basic info
            weatherData.setCityName((String) response.get("name"));

            // Coordinates
            Map<String, Object> coord = (Map<String, Object>) response.get("coord");
            weatherData.setLatitude(((Number) coord.get("lat")).doubleValue());
            weatherData.setLongitude(((Number) coord.get("lon")).doubleValue());

            // Main weather data
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            weatherData.setTemperature(((Number) main.get("temp")).doubleValue());
            weatherData.setFeelsLike(((Number) main.get("feels_like")).doubleValue());
            weatherData.setHumidity(((Number) main.get("humidity")).intValue());
            weatherData.setPressure(((Number) main.get("pressure")).intValue());

            if (main.get("temp_min") != null) {
                weatherData.setTempMin(((Number) main.get("temp_min")).doubleValue());
            }
            if (main.get("temp_max") != null) {
                weatherData.setTempMax(((Number) main.get("temp_max")).doubleValue());
            }

            // Weather description
            Map<String, Object>[] weather = (Map<String, Object>[]) response.get("weather");
            if (weather != null && weather.length > 0) {
                weatherData.setDescription((String) weather[0].get("description"));
                weatherData.setMainCondition((String) weather[0].get("main"));
                weatherData.setWeatherIcon((String) weather[0].get("icon"));
            }

            // Wind data
            Map<String, Object> wind = (Map<String, Object>) response.get("wind");
            if (wind != null) {
                weatherData.setWindSpeed(((Number) wind.get("speed")).doubleValue());
                if (wind.get("deg") != null) {
                    weatherData.setWindDirection(((Number) wind.get("deg")).intValue());
                }
            }

            // Visibility
            if (response.get("visibility") != null) {
                weatherData.setVisibility(((Number) response.get("visibility")).doubleValue() / 1000); // Convert to km
            }

            // Sunrise/Sunset
            Map<String, Object> sys = (Map<String, Object>) response.get("sys");
            if (sys != null) {
                if (sys.get("sunrise") != null) {
                    long sunrise = ((Number) sys.get("sunrise")).longValue();
                    weatherData.setSunrise(LocalDateTime.ofEpochSecond(sunrise, 0, ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now())));
                }
                if (sys.get("sunset") != null) {
                    long sunset = ((Number) sys.get("sunset")).longValue();
                    weatherData.setSunset(LocalDateTime.ofEpochSecond(sunset, 0, ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now())));
                }
                weatherData.setCountry((String) sys.get("country"));
            }

            // Timezone
            if (response.get("timezone") != null) {
                weatherData.setTimezone(((Number) response.get("timezone")).intValue());
            }

            weatherData.setLastUpdated(LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error parsing weather response", e);
            throw new WeatherServiceException("Failed to parse weather data");
        }

        return weatherData;
    }

    /**
     * Convert WeatherData to WeatherResponse DTO
     */
    private WeatherResponse convertToWeatherResponse(WeatherData weatherData) {
        WeatherResponse response = new WeatherResponse();

        response.setCityName(weatherData.getCityName());
        response.setCountry(weatherData.getCountry());
        response.setLatitude(weatherData.getLatitude());
        response.setLongitude(weatherData.getLongitude());
        response.setTemperature(weatherData.getTemperature());
        response.setFeelsLike(weatherData.getFeelsLike());
        response.setTempMin(weatherData.getTempMin());
        response.setTempMax(weatherData.getTempMax());
        response.setHumidity(weatherData.getHumidity());
        response.setPressure(weatherData.getPressure());
        response.setDescription(weatherData.getDescription());
        response.setMainCondition(weatherData.getMainCondition());
        response.setWeatherIcon(weatherData.getWeatherIcon());
        response.setWindSpeed(weatherData.getWindSpeed());
        response.setWindDirection(weatherData.getWindDirection());
        response.setVisibility(weatherData.getVisibility());
        response.setTimezone(weatherData.getTimezone());

        // Format sunrise/sunset times
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        if (weatherData.getSunrise() != null) {
            response.setSunrise(weatherData.getSunrise().format(timeFormatter));
        }
        if (weatherData.getSunset() != null) {
            response.setSunset(weatherData.getSunset().format(timeFormatter));
        }

        response.setLastUpdated(weatherData.getLastUpdated());

        return response;
    }

    /**
     * Convert temperature values to Fahrenheit
     */
    private WeatherResponse convertToFahrenheit(WeatherResponse weather) {
        weather.setTemperature(celsiusToFahrenheit(weather.getTemperature()));
        weather.setFeelsLike(celsiusToFahrenheit(weather.getFeelsLike()));
        if (weather.getTempMin() != null) {
            weather.setTempMin(celsiusToFahrenheit(weather.getTempMin()));
        }
        if (weather.getTempMax() != null) {
            weather.setTempMax(celsiusToFahrenheit(weather.getTempMax()));
        }
        weather.setTemperatureUnit("°F");
        return weather;
    }

    /**
     * Convert wind speed to mph
     */
    private WeatherResponse convertWindSpeedToMph(WeatherResponse weather) {
        weather.setWindSpeed(weather.getWindSpeed() * 2.237); // m/s to mph
        weather.setWindSpeedUnit("mph");
        return weather;
    }

    /**
     * Convert Celsius to Fahrenheit
     */
    private double celsiusToFahrenheit(double celsius) {
        return (celsius * 9.0 / 5.0) + 32.0;
    }

    /**
     * Check for weather alerts and send notifications
     */
    private void checkWeatherAlerts(WeatherData weatherData, String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // Check temperature thresholds
                if (user.getHighTempAlert() != null && weatherData.getTemperature() > user.getHighTempAlert()) {
                    notificationService.sendTemperatureAlert(userId, weatherData.getCityName(),
                            weatherData.getTemperature(), "high");
                }

                if (user.getLowTempAlert() != null && weatherData.getTemperature() < user.getLowTempAlert()) {
                    notificationService.sendTemperatureAlert(userId, weatherData.getCityName(),
                            weatherData.getTemperature(), "low");
                }

                // Check for severe weather conditions
                String mainCondition = weatherData.getMainCondition().toLowerCase();
                if (mainCondition.contains("thunderstorm") || mainCondition.contains("tornado") ||
                        mainCondition.contains("hurricane")) {
                    notificationService.sendSevereWeatherAlert(userId, weatherData.getCityName(),
                            weatherData.getDescription());
                }
            }
        } catch (Exception e) {
            logger.error("Error checking weather alerts for user: {}", userId, e);
        }
    }

    /**
     * Get cached weather data if available and recent
     */
    public Optional<WeatherResponse> getCachedWeather(String cityName, String userId) {
        Optional<WeatherData> cachedData = weatherDataRepository
                .findTopByCityNameAndUserIdOrderByLastUpdatedDesc(cityName, userId);

        if (cachedData.isPresent()) {
            WeatherData data = cachedData.get();
            // Return cached data if it's less than 10 minutes old
            if (data.getLastUpdated().isAfter(LocalDateTime.now().minusMinutes(10))) {
                return Optional.of(convertToWeatherResponse(data));
            }
        }

        return Optional.empty();
    }

    /**
     * Get weather summary for multiple cities
     */
    public Map<String, WeatherResponse> getMultipleCitiesWeather(String[] cities, String userId) {
        Map<String, WeatherResponse> weatherMap = new java.util.HashMap<>();

        for (String city : cities) {
            try {
                WeatherResponse weather = getCurrentWeatherByCity(city, userId);
                weatherMap.put(city, weather);
            } catch (Exception e) {
                logger.error("Failed to get weather for city: {}", city, e);
                // Continue with other cities
            }
        }

        return weatherMap;
    }
}