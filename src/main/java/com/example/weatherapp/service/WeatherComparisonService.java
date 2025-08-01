package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherComparisonDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.repository.WeatherDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WeatherComparisonService {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private WeatherDataRepository weatherDataRepository;

    /**
     * Compare weather data between multiple cities
     */
    public WeatherComparisonDto compareWeatherBetweenCities(List<String> cityNames) {
        List<WeatherResponse> weatherDataList = new ArrayList<>();

        for (String cityName : cityNames) {
            try {
                WeatherResponse weather = weatherService.getCurrentWeather(cityName);
                weatherDataList.add(weather);
            } catch (Exception e) {
                // Log error and continue with other cities
                System.err.println("Failed to fetch weather for " + cityName + ": " + e.getMessage());
            }
        }

        return buildComparisonResult(weatherDataList);
    }

    /**
     * Build comprehensive comparison result
     */
    private WeatherComparisonDto buildComparisonResult(List<WeatherResponse> weatherDataList) {
        WeatherComparisonDto comparison = new WeatherComparisonDto();
        comparison.setCities(weatherDataList);
        comparison.setComparisonTime(LocalDateTime.now());

        if (!weatherDataList.isEmpty()) {
            comparison.setHottestCity(findHottestCity(weatherDataList));
            comparison.setColdestCity(findColdestCity(weatherDataList));
            comparison.setMostHumidCity(findMostHumidCity(weatherDataList));
            comparison.setLeastHumidCity(findLeastHumidCity(weatherDataList));
            comparison.setWindiestCity(findWindiestCity(weatherDataList));
            comparison.setCalmestCity(findCalmestCity(weatherDataList));
            comparison.setHighestPressureCity(findHighestPressureCity(weatherDataList));
            comparison.setLowestPressureCity(findLowestPressureCity(weatherDataList));
            comparison.setBestVisibilityCity(findBestVisibilityCity(weatherDataList));
            comparison.setWorstVisibilityCity(findWorstVisibilityCity(weatherDataList));

            // Calculate statistics
            comparison.setTemperatureStats(calculateTemperatureStats(weatherDataList));
            comparison.setHumidityStats(calculateHumidityStats(weatherDataList));
            comparison.setWindStats(calculateWindStats(weatherDataList));
            comparison.setPressureStats(calculatePressureStats(weatherDataList));

            // Generate recommendations
            comparison.setRecommendations(generateComparisonRecommendations(weatherDataList));
        }

        return comparison;
    }

    private WeatherResponse findHottestCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .max(Comparator.comparing(WeatherResponse::getTemperature))
                .orElse(null);
    }

    private WeatherResponse findColdestCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .min(Comparator.comparing(WeatherResponse::getTemperature))
                .orElse(null);
    }

    private WeatherResponse findMostHumidCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .max(Comparator.comparing(WeatherResponse::getHumidity))
                .orElse(null);
    }

    private WeatherResponse findLeastHumidCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .min(Comparator.comparing(WeatherResponse::getHumidity))
                .orElse(null);
    }

    private WeatherResponse findWindiestCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .max(Comparator.comparing(WeatherResponse::getWindSpeed))
                .orElse(null);
    }

    private WeatherResponse findCalmestCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .min(Comparator.comparing(WeatherResponse::getWindSpeed))
                .orElse(null);
    }

    private WeatherResponse findHighestPressureCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .max(Comparator.comparing(WeatherResponse::getPressure))
                .orElse(null);
    }

    private WeatherResponse findLowestPressureCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .min(Comparator.comparing(WeatherResponse::getPressure))
                .orElse(null);
    }

    private WeatherResponse findBestVisibilityCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .max(Comparator.comparing(WeatherResponse::getVisibility))
                .orElse(null);
    }

    private WeatherResponse findWorstVisibilityCity(List<WeatherResponse> weatherList) {
        return weatherList.stream()
                .min(Comparator.comparing(WeatherResponse::getVisibility))
                .orElse(null);
    }

    private Map<String, Double> calculateTemperatureStats(List<WeatherResponse> weatherList) {
        DoubleSummaryStatistics stats = weatherList.stream()
                .mapToDouble(WeatherResponse::getTemperature)
                .summaryStatistics();

        Map<String, Double> tempStats = new HashMap<>();
        tempStats.put("average", stats.getAverage());
        tempStats.put("max", stats.getMax());
        tempStats.put("min", stats.getMin());
        tempStats.put("range", stats.getMax() - stats.getMin());
        return tempStats;
    }

    private Map<String, Double> calculateHumidityStats(List<WeatherResponse> weatherList) {
        DoubleSummaryStatistics stats = weatherList.stream()
                .mapToDouble(WeatherResponse::getHumidity)
                .summaryStatistics();

        Map<String, Double> humidityStats = new HashMap<>();
        humidityStats.put("average", stats.getAverage());
        humidityStats.put("max", stats.getMax());
        humidityStats.put("min", stats.getMin());
        humidityStats.put("range", stats.getMax() - stats.getMin());
        return humidityStats;
    }

    private Map<String, Double> calculateWindStats(List<WeatherResponse> weatherList) {
        DoubleSummaryStatistics stats = weatherList.stream()
                .mapToDouble(WeatherResponse::getWindSpeed)
                .summaryStatistics();

        Map<String, Double> windStats = new HashMap<>();
        windStats.put("average", stats.getAverage());
        windStats.put("max", stats.getMax());
        windStats.put("min", stats.getMin());
        windStats.put("range", stats.getMax() - stats.getMin());
        return windStats;
    }

    private Map<String, Double> calculatePressureStats(List<WeatherResponse> weatherList) {
        DoubleSummaryStatistics stats = weatherList.stream()
                .mapToDouble(WeatherResponse::getPressure)
                .summaryStatistics();

        Map<String, Double> pressureStats = new HashMap<>();
        pressureStats.put("average", stats.getAverage());
        pressureStats.put("max", stats.getMax());
        pressureStats.put("min", stats.getMin());
        pressureStats.put("range", stats.getMax() - stats.getMin());
        return pressureStats;
    }

    private List<String> generateComparisonRecommendations(List<WeatherResponse> weatherList) {
        List<String> recommendations = new ArrayList<>();

        WeatherResponse hottest = findHottestCity(weatherList);
        WeatherResponse coldest = findColdestCity(weatherList);
        WeatherResponse windiest = findWindiestCity(weatherList);

        if (hottest != null && coldest != null) {
            double tempDiff = hottest.getTemperature() - coldest.getTemperature();
            if (tempDiff > 10) {
                recommendations.add("Significant temperature variation between cities. " +
                        hottest.getCityName() + " is " + String.format("%.1f", tempDiff) +
                        "°C warmer than " + coldest.getCityName());
            }
        }

        if (windiest != null && windiest.getWindSpeed() > 10) {
            recommendations.add("High wind speeds in " + windiest.getCityName() +
                    " (" + windiest.getWindSpeed() + " m/s). Consider indoor activities.");
        }

        // Check for extreme weather conditions
        for (WeatherResponse weather : weatherList) {
            if (weather.getTemperature() > 35) {
                recommendations.add("Extreme heat in " + weather.getCityName() +
                        ". Stay hydrated and avoid prolonged sun exposure.");
            }
            if (weather.getTemperature() < 0) {
                recommendations.add("Freezing temperatures in " + weather.getCityName() +
                        ". Dress warmly and be cautious of icy conditions.");
            }
            if (weather.getHumidity() > 80) {
                recommendations.add("High humidity in " + weather.getCityName() +
                        ". May feel warmer than actual temperature.");
            }
        }

        return recommendations;
    }

    /**
     * Get historical comparison data for trend analysis
     */
    public List<WeatherComparisonDto> getHistoricalComparison(List<String> cityNames, int days) {
        List<WeatherComparisonDto> historicalComparisons = new ArrayList<>();

        for (int i = 0; i < days; i++) {
            LocalDateTime targetDate = LocalDateTime.now().minusDays(i);
            List<WeatherResponse> dayWeatherData = new ArrayList<>();

            for (String cityName : cityNames) {
                List<WeatherData> historicalData = weatherDataRepository
                        .findByCityNameAndTimestampBetween(
                                cityName,
                                targetDate.toLocalDate().atStartOfDay(),
                                targetDate.toLocalDate().atTime(23, 59, 59)
                        );

                if (!historicalData.isEmpty()) {
                    WeatherData weatherData = historicalData.get(0);
                    WeatherResponse response = convertToWeatherResponse(weatherData);
                    dayWeatherData.add(response);
                }
            }

            if (!dayWeatherData.isEmpty()) {
                WeatherComparisonDto comparison = buildComparisonResult(dayWeatherData);
                comparison.setComparisonTime(targetDate);
                historicalComparisons.add(comparison);
            }
        }

        return historicalComparisons;
    }

    private WeatherResponse convertToWeatherResponse(WeatherData weatherData) {
        WeatherResponse response = new WeatherResponse();
        response.setCityName(weatherData.getCityName());
        response.setTemperature(weatherData.getTemperature());
        response.setFeelsLike(weatherData.getFeelsLike());
        response.setHumidity(weatherData.getHumidity());
        response.setWindSpeed(weatherData.getWindSpeed());
        response.setPressure(weatherData.getPressure());
        response.setVisibility(weatherData.getVisibility());
        response.setDescription(weatherData.getDescription());
        response.setTimestamp(weatherData.getTimestamp());
        return response;
    }
}