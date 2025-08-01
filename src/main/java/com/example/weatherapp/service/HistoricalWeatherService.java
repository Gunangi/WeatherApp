package com.example.weatherapp.service;

import com.example.weatherapp.model.HistoricalWeather;
import com.example.weatherapp.repository.HistoricalWeatherRepository;
import com.example.weatherapp.exception.InvalidRequestException;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HistoricalWeatherService {

    private static final Logger logger = LoggerFactory.getLogger(HistoricalWeatherService.class);

    private final HistoricalWeatherRepository historicalRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String historicalBaseUrl;

    public HistoricalWeatherService(HistoricalWeatherRepository historicalWeatherRepository,
                                    RestTemplate restTemplate,
                                    ObjectMapper objectMapper,
                                    @Value("${openweather.api.key}") String apiKey,
                                    @Value("${openweather.historical.url:http://api.openweathermap.org/data/2.5}") String historicalBaseUrl) {
        this.historicalRepo = historicalWeatherRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.historicalBaseUrl = historicalBaseUrl;
    }

    public HistoricalWeather getHistoricalWeather(double latitude, double longitude, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Check if data exists in the database first
        List<HistoricalWeather> existingData = historicalRepo
                .findByLatitudeAndLongitudeAndRecordedAtBetweenOrderByRecordedAtDesc(latitude, longitude, startOfDay, endOfDay);

        if (!existingData.isEmpty()) {
            // Return the first record for that day (or an average)
            return existingData.get(0);
        }

        // Fetch from API if not in database
        return fetchAndSaveHistoricalWeather(latitude, longitude, date);
    }

    public List<HistoricalWeather> getHistoricalWeatherRange(double latitude, double longitude,
                                                             LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("Start date must be before end date");
        }
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        return historicalRepo.findByLatitudeAndLongitudeAndRecordedAtBetweenOrderByRecordedAtDesc(
                latitude, longitude, startDateTime, endDateTime);
    }

    public Map<String, Object> getWeatherTrends(double latitude, double longitude, LocalDate startDate, LocalDate endDate) {
        List<HistoricalWeather> weatherData = getHistoricalWeatherRange(latitude, longitude, startDate, endDate);
        if (weatherData.isEmpty()) {
            throw new LocationNotFoundException("No historical data found for the specified range.");
        }

        Map<String, Object> trends = new HashMap<>();

        // Use the correct getter: getTemperature() instead of getAverageTemperature()
        DoubleSummaryStatistics tempStats = weatherData.stream()
                .mapToDouble(HistoricalWeather::getTemperature)
                .summaryStatistics();

        trends.put("averageTemperature", tempStats.getAverage());
        trends.put("minTemperature", tempStats.getMin());
        trends.put("maxTemperature", tempStats.getMax());

        // Use the correct getter: getWeatherMain() instead of getDominantCondition()
        Map<String, Long> conditionCounts = weatherData.stream()
                .collect(Collectors.groupingBy(HistoricalWeather::getWeatherMain, Collectors.counting()));
        trends.put("conditionDistribution", conditionCounts);

        return trends;
    }

    private HistoricalWeather fetchAndSaveHistoricalWeather(double latitude, double longitude, LocalDate date) {
        // This is a placeholder for your API fetching logic
        logger.info("Fetching historical data for {} from external API", date);
        HistoricalWeather hw = new HistoricalWeather();

        // FIX: Use the correct setters from the new model
        hw.setRecordedAt(date.atStartOfDay());
        hw.setLatitude(latitude);
        hw.setLongitude(longitude);
        hw.setTemperature(15.0); // Example data
        hw.setWeatherMain("Clear");
        hw.setRainfall(0.0);

        return historicalRepo.save(hw);
    }
}