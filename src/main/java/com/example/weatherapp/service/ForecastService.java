package com.example.weatherapp.service;

import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.model.ForecastData;
import com.example.weatherapp.model.User;
import com.example.weatherapp.repository.ForecastDataRepository;
import com.example.weatherapp.repository.UserRepository;
import com.example.weatherapp.exception.WeatherServiceException;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForecastService {

    private static final Logger logger = LoggerFactory.getLogger(ForecastService.class);

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;

    @Autowired
    private ForecastDataRepository forecastDataRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Get 5-day weather forecast by city name
     */
    public ForecastResponse get5DayForecastByCity(String cityName, String userId) {
        try {
            String url = String.format("%s/forecast?q=%s&appid=%s&units=metric",
                    baseUrl, cityName, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No forecast data received from API");
            }

            List<ForecastData> forecastList = parseForecastResponse(response, userId);

            // Save to database
            forecastDataRepository.saveAll(forecastList);

            return convertToForecastResponse(forecastList, response);

        } catch (RestClientException e) {
            logger.error("Error fetching forecast data for city: {}", cityName, e);
            throw new WeatherServiceException("Failed to fetch forecast data: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in get5DayForecastByCity", e);
            throw new WeatherServiceException("Unexpected error occurred");
        }
    }

    /**
     * Get 5-day weather forecast by coordinates
     */
    public ForecastResponse get5DayForecastByCoordinates(double lat, double lon, String userId) {
        try {
            String url = String.format("%s/forecast?lat=%f&lon=%f&appid=%s&units=metric",
                    baseUrl, lat, lon, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new WeatherServiceException("No forecast data received from API");
            }

            List<ForecastData> forecastList = parseForecastResponse(response, userId);

            // Save to database
            forecastDataRepository.saveAll(forecastList);

            return convertToForecastResponse(forecastList, response);

        } catch (RestClientException e) {
            logger.error("Error fetching forecast data for coordinates: {}, {}", lat, lon, e);
            throw new WeatherServiceException("Failed to fetch forecast data: " + e.getMessage());
        }
    }

    /**
     * Get hourly forecast (next 24 hours)
     */
    public List<ForecastData> getHourlyForecast(String cityName, String userId) {
        ForecastResponse forecast = get5DayForecastByCity(cityName, userId);

        // Filter for next 24 hours
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next24Hours = now.plusHours(24);

        return forecast.getHourlyForecasts().stream()
                .filter(f -> f.getDateTime().isAfter(now) && f.getDateTime().isBefore(next24Hours))
                .collect(Collectors.toList());
    }

    /**
     * Get daily forecast summary (5 days)
     */
    public List<ForecastData> getDailyForecast(String cityName, String userId) {
        ForecastResponse forecast = get5DayForecastByCity(cityName, userId);

        // Group by date and get one forecast per day (preferably noon time)
        Map<String, List<ForecastData>> groupedByDate = forecast.getHourlyForecasts().stream()
                .collect(Collectors.groupingBy(f ->
                        f.getDateTime().toLocalDate().toString()));

        List<ForecastData> dailyForecasts = new ArrayList<>();

        for (Map.Entry<String, List<ForecastData>> entry : groupedByDate.entrySet()) {
            List<ForecastData> dayForecasts = entry.getValue();

            // Find forecast closest to noon (12:00)
            ForecastData noonForecast = dayForecasts.stream()
                    .min(Comparator.comparingInt(f ->
                            Math.abs(f.getDateTime().getHour() - 12)))
                    .orElse(dayForecasts.get(0));

            // Calculate daily min/max temperatures
            double minTemp = dayForecasts.stream()
                    .mapToDouble(ForecastData::getTemperature)
                    .min().orElse(noonForecast.getTemperature());

            double maxTemp = dayForecasts.stream()
                    .mapToDouble(ForecastData::getTemperature)
                    .max().orElse(noonForecast.getTemperature());

            noonForecast.setTempMin(minTemp);
            noonForecast.setTempMax(maxTemp);

            dailyForecasts.add(noonForecast);
        }

        // Sort by date
        dailyForecasts.sort(Comparator.comparing(ForecastData::getDateTime));

        return dailyForecasts.stream().limit(5).collect(Collectors.toList());
    }

    /**
     * Get forecast with user preferences applied
     */
    public ForecastResponse getForecastWithPreferences(String cityName, String userId) {
        ForecastResponse forecast = get5DayForecastByCity(cityName, userId);

        // Apply user preferences for units
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("fahrenheit".equalsIgnoreCase(user.getTemperatureUnit())) {
                forecast = convertToFahrenheit(forecast);
            }
            if ("mph".equalsIgnoreCase(user.getWindSpeedUnit())) {
                forecast = convertWindSpeedToMph(forecast);
            }
        }

        return forecast;
    }

    /**
     * Parse forecast API response to ForecastData models
     */
    private List<ForecastData> parseForecastResponse(Map<String, Object> response, String userId) {
        List<ForecastData> forecastList = new ArrayList<>();

        try {
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
            Map<String, Object> city = (Map<String, Object>) response.get("city");

            String cityName = (String) city.get("name");
            String country = (String) city.get("country");

            Map<String, Object> coord = (Map<String, Object>) city.get("coord");
            double latitude = ((Number) coord.get("lat")).doubleValue();
            double longitude = ((Number) coord.get("lon")).doubleValue();

            int timezone = ((Number) city.get("timezone")).intValue();

            for (Map<String, Object> item : list) {
                ForecastData forecastData = new ForecastData();

                // Basic info
                forecastData.setUserId(userId);
                forecastData.setCityName(cityName);
                forecastData.setCountry(country);
                forecastData.setLatitude(latitude);
                forecastData.setLongitude(longitude);
                forecastData.setTimezone(timezone);

                // Date/time
                long dt = ((Number) item.get("dt")).longValue();
                forecastData.setDateTime(LocalDateTime.ofEpochSecond(dt, 0,
                        ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now())));

                // Main weather data
                Map<String, Object> main = (Map<String, Object>) item.get("main");
                forecastData.setTemperature(((Number) main.get("temp")).doubleValue());
                forecastData.setFeelsLike(((Number) main.get("feels_like")).doubleValue());
                forecastData.setTempMin(((Number) main.get("temp_min")).doubleValue());
                forecastData.setTempMax(((Number) main.get("temp_max")).doubleValue());
                forecastData.setHumidity(((Number) main.get("humidity")).intValue());
                forecastData.setPressure(((Number) main.get("pressure")).intValue());

                if (main.get("sea_level") != null) {
                    forecastData.setSeaLevelPressure(((Number) main.get("sea_level")).intValue());
                }
                if (main.get("grnd_level") != null) {
                    forecastData.setGroundLevelPressure(((Number) main.get("grnd_level")).intValue());
                }

                // Weather description
                Map<String, Object>[] weather = (Map<String, Object>[]) item.get("weather");
                if (weather != null && weather.length > 0) {
                    forecastData.setDescription((String) weather[0].get("description"));
                    forecastData.setMainCondition((String) weather[0].get("main"));
                    forecastData.setWeatherIcon((String) weather[0].get("icon"));
                }

                // Wind data
                Map<String, Object> wind = (Map<String, Object>) item.get("wind");
                if (wind != null) {
                    forecastData.setWindSpeed(((Number) wind.get("speed")).doubleValue());
                    if (wind.get("deg") != null) {
                        forecastData.setWindDirection(((Number) wind.get("deg")).intValue());
                    }
                    if (wind.get("gust") != null) {
                        forecastData.setWindGust(((Number) wind.get("gust")).doubleValue());
                    }
                }

                // Visibility
                if (item.get("visibility") != null) {
                    forecastData.setVisibility(((Number) item.get("visibility")).doubleValue() / 1000); // Convert to km
                }

                // Clouds
                Map<String, Object> clouds = (Map<String, Object>) item.get("clouds");
                if (clouds != null) {
                    forecastData.setCloudiness(((Number) clouds.get("all")).intValue());
                }

                // Precipitation
                Map<String, Object> rain = (Map<String, Object>) item.get("rain");
                if (rain != null && rain.get("3h") != null) {
                    forecastData.setRainVolume(((Number) rain.get("3h")).doubleValue());
                }

                Map<String, Object> snow = (Map<String, Object>) item.get("snow");
                if (snow != null && snow.get("3h") != null) {
                    forecastData.setSnowVolume(((Number) snow.get("3h")).doubleValue());
                }

                // Probability of precipitation
                if (item.get("pop") != null) {
                    forecastData.setPrecipitationProbability(((Number) item.get("pop")).doubleValue() * 100);
                }

                forecastData.setCreatedAt(LocalDateTime.now());

                forecastList.add(forecastData);
            }

        } catch (Exception e) {
            logger.error("Error parsing forecast response", e);
            throw new WeatherServiceException("Failed to parse forecast data");
        }

        return forecastList;
    }

    /**
     * Convert ForecastData list to ForecastResponse DTO
     */
    private ForecastResponse convertToForecastResponse(List<ForecastData> forecastList, Map<String, Object> apiResponse) {
        ForecastResponse response = new ForecastResponse();

        if (!forecastList.isEmpty()) {
            ForecastData first = forecastList.get(0);
            response.setCityName(first.getCityName());
            response.setCountry(first.getCountry());
            response.setLatitude(first.getLatitude());
            response.setLongitude(first.getLongitude());
            response.setTimezone(first.getTimezone());
        }

        response.setHourlyForecasts(forecastList);
        response.setDailyForecasts(getDailyForecastSummary(forecastList));

        // API metadata
        if (apiResponse.get("cnt") != null) {
            response.setTotalForecasts(((Number) apiResponse.get("cnt")).intValue());
        }

        response.setGeneratedAt(LocalDateTime.now());

        return response;
    }

    /**
     * Get daily forecast summary from hourly data
     */
    private List<ForecastData> getDailyForecastSummary(List<ForecastData> hourlyForecasts) {
        Map<String, List<ForecastData>> groupedByDate = hourlyForecasts.stream()
                .collect(Collectors.groupingBy(f ->
                        f.getDateTime().toLocalDate().toString()));

        List<ForecastData> dailyForecasts = new ArrayList<>();

        for (Map.Entry<String, List<ForecastData>> entry : groupedByDate.entrySet()) {
            List<ForecastData> dayForecasts = entry.getValue();

            // Create summary for the day
            ForecastData dailySummary = new ForecastData();

            // Use first forecast as base
            ForecastData base = dayForecasts.get(0);
            dailySummary.setCityName(base.getCityName());
            dailySummary.setCountry(base.getCountry());
            dailySummary.setLatitude(base.getLatitude());
            dailySummary.setLongitude(base.getLongitude());
            dailySummary.setTimezone(base.getTimezone());

            // Set date to noon of that day
            dailySummary.setDateTime(base.getDateTime().toLocalDate().atTime(12, 0));

            // Calculate daily aggregates
            double minTemp = dayForecasts.stream().mapToDouble(ForecastData::getTemperature).min().orElse(0);
            double maxTemp = dayForecasts.stream().mapToDouble(ForecastData::getTemperature).max().orElse(0);
            double avgTemp = dayForecasts.stream().mapToDouble(ForecastData::getTemperature).average().orElse(0);

            dailySummary.setTempMin(minTemp);
            dailySummary.setTempMax(maxTemp);
            dailySummary.setTemperature(avgTemp);

            // Use most common weather condition
            Map<String, Long> conditionCounts = dayForecasts.stream()
                    .collect(Collectors.groupingBy(ForecastData::getMainCondition, Collectors.counting()));

            String mostCommonCondition = conditionCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Clear");

            // Find forecast with most common condition for description and icon
            ForecastData representativeForecast = dayForecasts.stream()
                    .filter(f -> mostCommonCondition.equals(f.getMainCondition()))
                    .findFirst()
                    .orElse(dayForecasts.get(0));

            dailySummary.setMainCondition(representativeForecast.getMainCondition());
            dailySummary.setDescription(representativeForecast.getDescription());
            dailySummary.setWeatherIcon(representativeForecast.getWeatherIcon());

            // Calculate other averages
            double avgHumidity = dayForecasts.stream().mapToDouble(ForecastData::getHumidity).average().orElse(0);
            double avgPressure = dayForecasts.stream().mapToDouble(ForecastData::getPressure).average().orElse(0);
            double avgWindSpeed = dayForecasts.stream().mapToDouble(ForecastData::getWindSpeed).average().orElse(0);

            dailySummary.setHumidity((int) Math.round(avgHumidity));
            dailySummary.setPressure((int) Math.round(avgPressure));
            dailySummary.setWindSpeed(avgWindSpeed);

            // Max precipitation probability for the day
            double maxPrecipitation = dayForecasts.stream()
                    .mapToDouble(ForecastData::getPrecipitationProbability)
                    .max().orElse(0);
            dailySummary.setPrecipitationProbability(maxPrecipitation);

            // Sum rain/snow volumes
            double totalRain = dayForecasts.stream()
                    .mapToDouble(f -> f.getRainVolume() != null ? f.getRainVolume() : 0)
                    .sum();
            double totalSnow = dayForecasts.stream()
                    .mapToDouble(f -> f.getSnowVolume() != null ? f.getSnowVolume() : 0)
                    .sum();

            if (totalRain > 0) dailySummary.setRainVolume(totalRain);
            if (totalSnow > 0) dailySummary.setSnowVolume(totalSnow);

            dailyForecasts.add(dailySummary);
        }

        // Sort by date and limit to 5 days
        return dailyForecasts.stream()
                .sorted(Comparator.comparing(ForecastData::getDateTime))
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * Convert temperature values to Fahrenheit
     */
    private ForecastResponse convertToFahrenheit(ForecastResponse forecast) {
        forecast.getHourlyForecasts().forEach(f -> {
            f.setTemperature(celsiusToFahrenheit(f.getTemperature()));
            f.setFeelsLike(celsiusToFahrenheit(f.getFeelsLike()));
            if (f.getTempMin() != null) f.setTempMin(celsiusToFahrenheit(f.getTempMin()));
            if (f.getTempMax() != null) f.setTempMax(celsiusToFahrenheit(f.getTempMax()));
        });

        forecast.getDailyForecasts().forEach(f -> {
            f.setTemperature(celsiusToFahrenheit(f.getTemperature()));
            f.setFeelsLike(celsiusToFahrenheit(f.getFeelsLike()));
            if (f.getTempMin() != null) f.setTempMin(celsiusToFahrenheit(f.getTempMin()));
            if (f.getTempMax() != null) f.setTempMax(celsiusToFahrenheit(f.getTempMax()));
        });

        forecast.setTemperatureUnit("°F");
        return forecast;
    }

    /**
     * Convert wind speed to mph
     */
    private ForecastResponse convertWindSpeedToMph(ForecastResponse forecast) {
        forecast.getHourlyForecasts().forEach(f -> {
            f.setWindSpeed(f.getWindSpeed() * 2.237); // m/s to mph
            if (f.getWindGust() != null) {
                f.setWindGust(f.getWindGust() * 2.237);
            }
        });

        forecast.getDailyForecasts().forEach(f -> {
            f.setWindSpeed(f.getWindSpeed() * 2.237);
            if (f.getWindGust() != null) {
                f.setWindGust(f.getWindGust() * 2.237);
            }
        });

        forecast.setWindSpeedUnit("mph");
        return forecast;
    }

    /**
     * Convert Celsius to Fahrenheit
     */
    private double celsiusToFahrenheit(double celsius) {
        return (celsius * 9.0 / 5.0) + 32.0;
    }

    /**
     * Get cached forecast data if available and recent
     */
    public Optional<ForecastResponse> getCachedForecast(String cityName, String userId) {
        List<ForecastData> cachedData = forecastDataRepository
                .findByCityNameAndUserIdAndCreatedAtAfterOrderByDateTimeAsc(
                        cityName, userId, LocalDateTime.now().minusHours(1));

        if (!cachedData.isEmpty()) {
            // Create mock API response for conversion
            Map<String, Object> mockResponse = new HashMap<>();
            mockResponse.put("cnt", cachedData.size());

            return Optional.of(convertToForecastResponse(cachedData, mockResponse));
        }

        return Optional.empty();
    }

    /**
     * Get weather forecast for specific date and time
     */
    public Optional<ForecastData> getForecastForDateTime(String cityName, String userId, LocalDateTime targetDateTime) {
        ForecastResponse forecast = get5DayForecastByCity(cityName, userId);

        // Find forecast closest to target date/time
        return forecast.getHourlyForecasts().stream()
                .min(Comparator.comparing(f ->
                        Math.abs(f.getDateTime().toEpochSecond(ZoneId.systemDefault().getRules().getOffset(f.getDateTime())) -
                                targetDateTime.toEpochSecond(ZoneId.systemDefault().getRules().getOffset(targetDateTime)))));
    }

    /**
     * Get precipitation forecast for next 24 hours
     */
    public List<ForecastData> getPrecipitationForecast(String cityName, String userId) {
        List<ForecastData> hourlyForecast = getHourlyForecast(cityName, userId);

        return hourlyForecast.stream()
                .filter(f -> f.getPrecipitationProbability() > 0 ||
                        (f.getRainVolume() != null && f.getRainVolume() > 0) ||
                        (f.getSnowVolume() != null && f.getSnowVolume() > 0))
                .collect(Collectors.toList());
    }

    /**
     * Get temperature trend analysis
     */
    public Map<String, Object> getTemperatureTrend(String cityName, String userId) {
        List<ForecastData> dailyForecast = getDailyForecast(cityName, userId);

        Map<String, Object> trend = new HashMap<>();

        if (dailyForecast.size() >= 2) {
            double firstDayTemp = dailyForecast.get(0).getTemperature();
            double lastDayTemp = dailyForecast.get(dailyForecast.size() - 1).getTemperature();

            double tempChange = lastDayTemp - firstDayTemp;

            trend.put("temperatureChange", tempChange);
            trend.put("trend", tempChange > 2 ? "warming" : tempChange < -2 ? "cooling" : "stable");

            // Find highest and lowest temperatures
            double highestTemp = dailyForecast.stream()
                    .mapToDouble(f -> f.getTempMax() != null ? f.getTempMax() : f.getTemperature())
                    .max().orElse(0);

            double lowestTemp = dailyForecast.stream()
                    .mapToDouble(f -> f.getTempMin() != null ? f.getTempMin() : f.getTemperature())
                    .min().orElse(0);

            trend.put("highestTemp", highestTemp);
            trend.put("lowestTemp", lowestTemp);
            trend.put("temperatureRange", highestTemp - lowestTemp);
        }

        return trend;
    }

    /**
     * Get weather outlook summary
     */
    public Map<String, Object> getWeatherOutlook(String cityName, String userId) {
        List<ForecastData> dailyForecast = getDailyForecast(cityName, userId);

        Map<String, Object> outlook = new HashMap<>();

        // Count weather conditions
        Map<String, Long> conditionCounts = dailyForecast.stream()
                .collect(Collectors.groupingBy(ForecastData::getMainCondition, Collectors.counting()));

        outlook.put("conditionBreakdown", conditionCounts);

        // Precipitation days
        long rainyDays = dailyForecast.stream()
                .filter(f -> f.getPrecipitationProbability() > 30)
                .count();

        outlook.put("rainyDays", rainyDays);
        outlook.put("clearDays", dailyForecast.size() - rainyDays);

        // Average conditions
        double avgTemp = dailyForecast.stream()
                .mapToDouble(ForecastData::getTemperature)
                .average().orElse(0);

        double avgHumidity = dailyForecast.stream()
                .mapToDouble(ForecastData::getHumidity)
                .average().orElse(0);

        outlook.put("averageTemperature", Math.round(avgTemp * 10.0) / 10.0);
        outlook.put("averageHumidity", Math.round(avgHumidity));

        return outlook;
    }
}
