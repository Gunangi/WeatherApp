package com.example.weatherapp.service;

import com.example.weatherapp.model.HistoricalWeather;
import com.example.weatherapp.repository.HistoricalWeatherRepository;
import com.example.weatherapp.exception.InvalidRequestException;
import com.example.weatherapp.exception.LocationNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HistoricalWeatherService {

    private static final Logger logger = LoggerFactory.getLogger(HistoricalWeatherService.class);

    @Autowired
    private HistoricalWeatherRepository historicalWeatherRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.historical.url:http://api.openweathermap.org/data/2.5}")
    private String historicalBaseUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int MAX_HISTORICAL_DAYS = 365; // Maximum days to fetch at once

    /**
     * Get historical weather data for a specific date and location
     */
    public HistoricalWeather getHistoricalWeather(double latitude, double longitude, LocalDate date) {
        // Check if data exists in database first
        Optional<HistoricalWeather> existingData = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDate(latitude, longitude, date);

        if (existingData.isPresent()) {
            return existingData.get();
        }

        // Fetch from API if not in database
        return fetchAndSaveHistoricalWeather(latitude, longitude, date);
    }

    /**
     * Get historical weather data for a date range
     */
    public List<HistoricalWeather> getHistoricalWeatherRange(double latitude, double longitude,
                                                             LocalDate startDate, LocalDate endDate) {

        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("Start date must be before end date");
        }

        if (startDate.until(endDate).getDays() > MAX_HISTORICAL_DAYS) {
            throw new InvalidRequestException("Date range cannot exceed " + MAX_HISTORICAL_DAYS + " days");
        }

        List<HistoricalWeather> result = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            try {
                HistoricalWeather weatherData = getHistoricalWeather(latitude, longitude, currentDate);
                if (weatherData != null) {
                    result.add(weatherData);
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch historical weather for date {}: {}", currentDate, e.getMessage());
            }
            currentDate = currentDate.plusDays(1);
        }

        return result;
    }

    /**
     * Get weather trends and statistics for a location
     */
    public Map<String, Object> getWeatherTrends(double latitude, double longitude, LocalDate startDate, LocalDate endDate) {
        List<HistoricalWeather> weatherData = getHistoricalWeatherRange(latitude, longitude, startDate, endDate);

        if (weatherData.isEmpty()) {
            throw new LocationNotFoundException("No historical weather data found for the specified location and date range");
        }

        Map<String, Object> trends = new HashMap<>();

        // Temperature statistics
        DoubleSummaryStatistics tempStats = weatherData.stream()
                .mapToDouble(HistoricalWeather::getAverageTemperature)
                .summaryStatistics();

        Map<String, Object> temperatureStats = new HashMap<>();
        temperatureStats.put("average", Math.round(tempStats.getAverage() * 100.0) / 100.0);
        temperatureStats.put("minimum", tempStats.getMin());
        temperatureStats.put("maximum", tempStats.getMax());
        temperatureStats.put("count", tempStats.getCount());
        trends.put("temperature", temperatureStats);

        // Humidity statistics
        DoubleSummaryStatistics humidityStats = weatherData.stream()
                .mapToDouble(HistoricalWeather::getAverageHumidity)
                .summaryStatistics();

        Map<String, Object> humidityStatsMap = new HashMap<>();
        humidityStatsMap.put("average", Math.round(humidityStats.getAverage() * 100.0) / 100.0);
        humidityStatsMap.put("minimum", humidityStats.getMin());
        humidityStatsMap.put("maximum", humidityStats.getMax());
        trends.put("humidity", humidityStatsMap);

        // Pressure statistics
        DoubleSummaryStatistics pressureStats = weatherData.stream()
                .mapToDouble(HistoricalWeather::getAveragePressure)
                .summaryStatistics();

        Map<String, Object> pressureStatsMap = new HashMap<>();
        pressureStatsMap.put("average", Math.round(pressureStats.getAverage() * 100.0) / 100.0);
        pressureStatsMap.put("minimum", pressureStats.getMin());
        pressureStatsMap.put("maximum", pressureStats.getMax());
        trends.put("pressure", pressureStatsMap);

        // Wind speed statistics
        DoubleSummaryStatistics windStats = weatherData.stream()
                .mapToDouble(HistoricalWeather::getAverageWindSpeed)
                .summaryStatistics();

        Map<String, Object> windStatsMap = new HashMap<>();
        windStatsMap.put("average", Math.round(windStats.getAverage() * 100.0) / 100.0);
        windStatsMap.put("minimum", windStats.getMin());
        windStatsMap.put("maximum", windStats.getMax());
        trends.put("windSpeed", windStatsMap);

        // Most common weather conditions
        Map<String, Long> conditionCounts = weatherData.stream()
                .collect(Collectors.groupingBy(HistoricalWeather::getDominantCondition, Collectors.counting()));

        String mostCommonCondition = conditionCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");

        trends.put("mostCommonCondition", mostCommonCondition);
        trends.put("conditionDistribution", conditionCounts);

        // Precipitation statistics
        double totalPrecipitation = weatherData.stream()
                .mapToDouble(HistoricalWeather::getTotalPrecipitation)
                .sum();

        long rainyDays = weatherData.stream()
                .mapToLong(w -> w.getTotalPrecipitation() > 0 ? 1 : 0)
                .sum();

        Map<String, Object> precipitationStats = new HashMap<>();
        precipitationStats.put("total", Math.round(totalPrecipitation * 100.0) / 100.0);
        precipitationStats.put("rainyDays", rainyDays);
        precipitationStats.put("averagePerDay", Math.round((totalPrecipitation / weatherData.size()) * 100.0) / 100.0);
        trends.put("precipitation", precipitationStats);

        return trends;
    }

    /**
     * Compare current weather with historical averages
     */
    public Map<String, Object> compareWithHistoricalAverages(double latitude, double longitude,
                                                             double currentTemperature, double currentHumidity, double currentPressure) {

        // Get historical data for the same month over past years
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusYears(5).withDayOfMonth(1);
        LocalDate endDate = today.minusYears(1).withDayOfMonth(today.lengthOfMonth());

        List<HistoricalWeather> historicalData = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDateBetweenOrderByDate(latitude, longitude, startDate, endDate)
                .stream()
                .filter(w -> w.getDate().getMonth() == today.getMonth())
                .collect(Collectors.toList());

        if (historicalData.isEmpty()) {
            throw new LocationNotFoundException("No historical data available for comparison");
        }

        Map<String, Object> comparison = new HashMap<>();

        // Temperature comparison
        double avgHistoricalTemp = historicalData.stream()
                .mapToDouble(HistoricalWeather::getAverageTemperature)
                .average()
                .orElse(0.0);

        Map<String, Object> tempComparison = new HashMap<>();
        tempComparison.put("current", currentTemperature);
        tempComparison.put("historicalAverage", Math.round(avgHistoricalTemp * 100.0) / 100.0);
        tempComparison.put("difference", Math.round((currentTemperature - avgHistoricalTemp) * 100.0) / 100.0);
        tempComparison.put("percentageDifference", Math.round(((currentTemperature - avgHistoricalTemp) / avgHistoricalTemp * 100) * 100.0) / 100.0);
        comparison.put("temperature", tempComparison);

        // Humidity comparison
        double avgHistoricalHumidity = historicalData.stream()
                .mapToDouble(HistoricalWeather::getAverageHumidity)
                .average()
                .orElse(0.0);

        Map<String, Object> humidityComparison = new HashMap<>();
        humidityComparison.put("current", currentHumidity);
        humidityComparison.put("historicalAverage", Math.round(avgHistoricalHumidity * 100.0) / 100.0);
        humidityComparison.put("difference", Math.round((currentHumidity - avgHistoricalHumidity) * 100.0) / 100.0);
        comparison.put("humidity", humidityComparison);

        // Pressure comparison
        double avgHistoricalPressure = historicalData.stream()
                .mapToDouble(HistoricalWeather::getAveragePressure)
                .average()
                .orElse(0.0);

        Map<String, Object> pressureComparison = new HashMap<>();
        pressureComparison.put("current", currentPressure);
        pressureComparison.put("historicalAverage", Math.round(avgHistoricalPressure * 100.0) / 100.0);
        pressureComparison.put("difference", Math.round((currentPressure - avgHistoricalPressure) * 100.0) / 100.0);
        comparison.put("pressure", pressureComparison);

        return comparison;
    }

    /**
     * Get weather patterns and cycles
     */
    public Map<String, Object> getWeatherPatterns(double latitude, double longitude, int years) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(years);

        List<HistoricalWeather> historicalData = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDateBetweenOrderByDate(latitude, longitude, startDate, endDate);

        if (historicalData.isEmpty()) {
            throw new LocationNotFoundException("No historical data available for pattern analysis");
        }

        Map<String, Object> patterns = new HashMap<>();

        // Monthly averages
        Map<String, DoubleSummaryStatistics> monthlyTemperatures = historicalData.stream()
                .collect(Collectors.groupingBy(
                        w -> w.getDate().getMonth().toString(),
                        Collectors.summarizingDouble(HistoricalWeather::getAverageTemperature)
                ));

        Map<String, Double> monthlyAvgTemps = new HashMap<>();
        monthlyTemperatures.forEach((month, stats) ->
                monthlyAvgTemps.put(month, Math.round(stats.getAverage() * 100.0) / 100.0)
        );
        patterns.put("monthlyAverageTemperatures", monthlyAvgTemps);

        // Seasonal patterns
        Map<String, List<HistoricalWeather>> seasonalData = historicalData.stream()
                .collect(Collectors.groupingBy(this::getSeason));

        Map<String, Double> seasonalAverages = new HashMap<>();
        seasonalData.forEach((season, data) -> {
            double avgTemp = data.stream()
                    .mapToDouble(HistoricalWeather::getAverageTemperature)
                    .average()
                    .orElse(0.0);
            seasonalAverages.put(season, Math.round(avgTemp * 100.0) / 100.0);
        });
        patterns.put("seasonalAverages", seasonalAverages);

        // Extreme weather days
        long extremeHotDays = historicalData.stream()
                .mapToLong(w -> w.getMaxTemperature() > 35.0 ? 1 : 0) // Days above 35°C
                .sum();

        long extremeColdDays = historicalData.stream()
                .mapToLong(w -> w.getMinTemperature() < 0.0 ? 1 : 0) // Days below 0°C
                .sum();

        long rainyDays = historicalData.stream()
                .mapToLong(w -> w.getTotalPrecipitation() > 0 ? 1 : 0)
                .sum();

        Map<String, Object> extremeWeather = new HashMap<>();
        extremeWeather.put("extremeHotDays", extremeHotDays);
        extremeWeather.put("extremeColdDays", extremeColdDays);
        extremeWeather.put("rainyDays", rainyDays);
        extremeWeather.put("totalDays", historicalData.size());
        patterns.put("extremeWeather", extremeWeather);

        return patterns;
    }

    /**
     * Get the best and worst weather days in history
     */
    public Map<String, Object> getWeatherExtremes(double latitude, double longitude, int years) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(years);

        List<HistoricalWeather> historicalData = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDateBetweenOrderByDate(latitude, longitude, startDate, endDate);

        if (historicalData.isEmpty()) {
            throw new LocationNotFoundException("No historical data available");
        }

        Map<String, Object> extremes = new HashMap<>();

        // Hottest day
        HistoricalWeather hottestDay = historicalData.stream()
                .max(Comparator.comparing(HistoricalWeather::getMaxTemperature))
                .orElse(null);

        if (hottestDay != null) {
            Map<String, Object> hottestDayData = new HashMap<>();
            hottestDayData.put("date", hottestDay.getDate());
            hottestDayData.put("temperature", hottestDay.getMaxTemperature());
            hottestDayData.put("condition", hottestDay.getDominantCondition());
            extremes.put("hottestDay", hottestDayData);
        }

        // Coldest day
        HistoricalWeather coldestDay = historicalData.stream()
                .min(Comparator.comparing(HistoricalWeather::getMinTemperature))
                .orElse(null);

        if (coldestDay != null) {
            Map<String, Object> coldestDayData = new HashMap<>();
            coldestDayData.put("date", coldestDay.getDate());
            coldestDayData.put("temperature", coldestDay.getMinTemperature());
            coldestDayData.put("condition", coldestDay.getDominantCondition());
            extremes.put("coldestDay", coldestDayData);
        }

        // Rainiest day
        HistoricalWeather rainiestDay = historicalData.stream()
                .max(Comparator.comparing(HistoricalWeather::getTotalPrecipitation))
                .orElse(null);

        if (rainiestDay != null) {
            Map<String, Object> rainiestDayData = new HashMap<>();
            rainiestDayData.put("date", rainiestDay.getDate());
            rainiestDayData.put("precipitation", rainiestDay.getTotalPrecipitation());
            rainiestDayData.put("condition", rainiestDay.getDominantCondition());
            extremes.put("rainiestDay", rainiestDayData);
        }

        // Windiest day
        HistoricalWeather windiestDay = historicalData.stream()
                .max(Comparator.comparing(HistoricalWeather::getMaxWindSpeed))
                .orElse(null);

        if (windiestDay != null) {
            Map<String, Object> windiestDayData = new HashMap<>();
            windiestDayData.put("date", windiestDay.getDate());
            windiestDayData.put("windSpeed", windiestDay.getMaxWindSpeed());
            windiestDayData.put("condition", windiestDay.getDominantCondition());
            extremes.put("windiestDay", windiestDayData);
        }

        return extremes;
    }

    /**
     * Fetch historical weather data from API and save to database
     */
    private HistoricalWeather fetchAndSaveHistoricalWeather(double latitude, double longitude, LocalDate date) {
        try {
            // Convert date to Unix timestamp
            long timestamp = date.atStartOfDay().toEpochSecond(java.time.ZoneOffset.UTC);

            String url = String.format("%s/onecall/timemachine?lat=%f&lon=%f&dt=%d&appid=%s&units=metric",
                    historicalBaseUrl, latitude, longitude, timestamp, apiKey);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            return parseAndSaveHistoricalWeather(jsonNode, latitude, longitude, date);

        } catch (HttpClientErrorException e) {
            logger.error("Failed to fetch historical weather data: {}", e.getMessage());
            throw new InvalidRequestException("Failed to fetch historical weather data");
        } catch (Exception e) {
            logger.error("Error processing historical weather data: {}", e.getMessage());
            throw new InvalidRequestException("Error processing historical weather data");
        }
    }

    /**
     * Parse API response and save to database
     */
    private HistoricalWeather parseAndSaveHistoricalWeather(JsonNode jsonNode, double latitude, double longitude, LocalDate date) {
        HistoricalWeather historicalWeather = new HistoricalWeather();
        historicalWeather.setLatitude(latitude);
        historicalWeather.setLongitude(longitude);
        historicalWeather.setDate(date);
        historicalWeather.setCreatedAt(LocalDateTime.now());

        if (jsonNode.has("current")) {
            JsonNode current = jsonNode.get("current");

            // Temperature data
            if (current.has("temp")) {
                double temp = current.get("temp").asDouble();
                historicalWeather.setAverageTemperature(temp);
                historicalWeather.setMinTemperature(temp); // Will be updated if hourly data available
                historicalWeather.setMaxTemperature(temp);
            }

            if (current.has("feels_like")) {
                historicalWeather.setFeelsLikeTemperature(current.get("feels_like").asDouble());
            }

            // Weather conditions
            if (current.has("weather") && current.get("weather").isArray() && current.get("weather").size() > 0) {
                JsonNode weather = current.get("weather").get(0);
                historicalWeather.setDominantCondition(weather.get("main").asText());
                historicalWeather.setWeatherDescription(weather.get("description").asText());
            }

            // Other meteorological data
            if (current.has("humidity")) {
                historicalWeather.setAverageHumidity(current.get("humidity").asDouble());
            }

            if (current.has("pressure")) {
                historicalWeather.setAveragePressure(current.get("pressure").asDouble());
            }

            if (current.has("wind_speed")) {
                historicalWeather.setAverageWindSpeed(current.get("wind_speed").asDouble());
                historicalWeather.setMaxWindSpeed(current.get("wind_speed").asDouble());
            }

            if (current.has("wind_deg")) {
                historicalWeather.setWindDirection(current.get("wind_deg").asInt());
            }

            if (current.has("visibility")) {
                historicalWeather.setVisibility(current.get("visibility").asDouble() / 1000.0); // Convert to km
            }

            if (current.has("uvi")) {
                historicalWeather.setUvIndex(current.get("uvi").asDouble());
            }
        }

        // Process hourly data if available for more accurate min/max values
        if (jsonNode.has("hourly")) {
            JsonNode hourly = jsonNode.get("hourly");
            processHourlyData(historicalWeather, hourly);
        }

        // Calculate precipitation from hourly data or daily summary
        if (jsonNode.has("current") && jsonNode.get("current").has("rain")) {
            JsonNode rain = jsonNode.get("current").get("rain");
            if (rain.has("1h")) {
                historicalWeather.setTotalPrecipitation(rain.get("1h").asDouble() * 24); // Estimate daily from hourly
            }
        } else if (jsonNode.has("current") && jsonNode.get("current").has("snow")) {
            JsonNode snow = jsonNode.get("current").get("snow");
            if (snow.has("1h")) {
                historicalWeather.setTotalPrecipitation(snow.get("1h").asDouble() * 24); // Estimate daily from hourly
            }
        }

        return historicalWeatherRepository.save(historicalWeather);
    }

    /**
     * Process hourly data to get accurate daily statistics
     */
    private void processHourlyData(HistoricalWeather historicalWeather, JsonNode hourlyData) {
        if (!hourlyData.isArray()) return;

        List<Double> temperatures = new ArrayList<>();
        List<Double> humidities = new ArrayList<>();
        List<Double> pressures = new ArrayList<>();
        List<Double> windSpeeds = new ArrayList<>();
        double totalPrecipitation = 0.0;
        Map<String, Integer> conditionCounts = new HashMap<>();

        for (JsonNode hour : hourlyData) {
            // Temperature
            if (hour.has("temp")) {
                temperatures.add(hour.get("temp").asDouble());
            }

            // Humidity
            if (hour.has("humidity")) {
                humidities.add(hour.get("humidity").asDouble());
            }

            // Pressure
            if (hour.has("pressure")) {
                pressures.add(hour.get("pressure").asDouble());
            }

            // Wind speed
            if (hour.has("wind_speed")) {
                windSpeeds.add(hour.get("wind_speed").asDouble());
            }

            // Precipitation
            if (hour.has("rain") && hour.get("rain").has("1h")) {
                totalPrecipitation += hour.get("rain").get("1h").asDouble();
            }
            if (hour.has("snow") && hour.get("snow").has("1h")) {
                totalPrecipitation += hour.get("snow").get("1h").asDouble();
            }

            // Weather conditions
            if (hour.has("weather") && hour.get("weather").isArray() && hour.get("weather").size() > 0) {
                String condition = hour.get("weather").get(0).get("main").asText();
                conditionCounts.put(condition, conditionCounts.getOrDefault(condition, 0) + 1);
            }
        }

        // Update temperature statistics
        if (!temperatures.isEmpty()) {
            historicalWeather.setMinTemperature(Collections.min(temperatures));
            historicalWeather.setMaxTemperature(Collections.max(temperatures));
            historicalWeather.setAverageTemperature(temperatures.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
        }

        // Update humidity statistics
        if (!humidities.isEmpty()) {
            historicalWeather.setAverageHumidity(humidities.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
        }

        // Update pressure statistics
        if (!pressures.isEmpty()) {
            historicalWeather.setAveragePressure(pressures.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
        }

        // Update wind statistics
        if (!windSpeeds.isEmpty()) {
            historicalWeather.setAverageWindSpeed(windSpeeds.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
            historicalWeather.setMaxWindSpeed(Collections.max(windSpeeds));
        }

        // Update precipitation
        historicalWeather.setTotalPrecipitation(totalPrecipitation);

        // Update dominant condition
        if (!conditionCounts.isEmpty()) {
            String dominantCondition = conditionCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Clear");
            historicalWeather.setDominantCondition(dominantCondition);
        }
    }

    /**
     * Delete old historical weather data to save storage
     */
    public void cleanupOldHistoricalData(int daysToKeep) {
        LocalDate cutoffDate = LocalDate.now().minusDays(daysToKeep);
        List<HistoricalWeather> oldData = historicalWeatherRepository.findByDateBefore(cutoffDate);

        if (!oldData.isEmpty()) {
            historicalWeatherRepository.deleteAll(oldData);
            logger.info("Cleaned up {} old historical weather records before {}", oldData.size(), cutoffDate);
        }
    }

    /**
     * Get available historical data date range for a location
     */
    public Map<String, LocalDate> getAvailableDateRange(double latitude, double longitude) {
        List<HistoricalWeather> data = historicalWeatherRepository
                .findByLatitudeAndLongitudeOrderByDate(latitude, longitude);

        if (data.isEmpty()) {
            return Map.of();
        }

        LocalDate earliest = data.get(0).getDate();
        LocalDate latest = data.get(data.size() - 1).getDate();

        return Map.of("earliest", earliest, "latest", latest);
    }

    /**
     * Get historical weather statistics for a specific month across multiple years
     */
    public Map<String, Object> getMonthlyHistoricalStats(double latitude, double longitude, int month, int years) {
        if (month < 1 || month > 12) {
            throw new InvalidRequestException("Month must be between 1 and 12");
        }

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(years);

        List<HistoricalWeather> monthlyData = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDateBetweenOrderByDate(latitude, longitude, startDate, endDate)
                .stream()
                .filter(w -> w.getDate().getMonthValue() == month)
                .collect(Collectors.toList());

        if (monthlyData.isEmpty()) {
            throw new LocationNotFoundException("No historical data available for the specified month");
        }

        Map<String, Object> stats = new HashMap<>();

        // Temperature statistics by year
        Map<Integer, DoubleSummaryStatistics> yearlyTemps = monthlyData.stream()
                .collect(Collectors.groupingBy(
                        w -> w.getDate().getYear(),
                        Collectors.summarizingDouble(HistoricalWeather::getAverageTemperature)
                ));

        Map<Integer, Double> yearlyAvgTemps = new HashMap<>();
        yearlyTemps.forEach((year, tempStats) ->
                yearlyAvgTemps.put(year, Math.round(tempStats.getAverage() * 100.0) / 100.0)
        );
        stats.put("yearlyAverageTemperatures", yearlyAvgTemps);

        // Overall statistics for the month
        DoubleSummaryStatistics overallTempStats = monthlyData.stream()
                .mapToDouble(HistoricalWeather::getAverageTemperature)
                .summaryStatistics();

        Map<String, Object> overallStats = new HashMap<>();
        overallStats.put("averageTemperature", Math.round(overallTempStats.getAverage() * 100.0) / 100.0);
        overallStats.put("minTemperature", overallTempStats.getMin());
        overallStats.put("maxTemperature", overallTempStats.getMax());

        double totalPrecipitation = monthlyData.stream()
                .mapToDouble(HistoricalWeather::getTotalPrecipitation)
                .sum();
        overallStats.put("totalPrecipitation", Math.round(totalPrecipitation * 100.0) / 100.0);
        overallStats.put("averagePrecipitation", Math.round((totalPrecipitation / monthlyData.size()) * 100.0) / 100.0);

        stats.put("overallStats", overallStats);
        stats.put("dataPoints", monthlyData.size());
        stats.put("yearsOfData", yearlyTemps.size());

        return stats;
    }

    /**
     * Helper method to determine season from date
     */
    private String getSeason(HistoricalWeather weather) {
        int month = weather.getDate().getMonthValue();

        if (month >= 3 && month <= 5) {
            return "Spring";
        } else if (month >= 6 && month <= 8) {
            return "Summer";
        } else if (month >= 9 && month <= 11) {
            return "Autumn";
        } else {
            return "Winter";
        }
    }

    /**
     * Check if historical data exists for a specific location and date range
     */
    public boolean hasHistoricalData(double latitude, double longitude, LocalDate startDate, LocalDate endDate) {
        List<HistoricalWeather> data = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDateBetween(latitude, longitude, startDate, endDate);
        return !data.isEmpty();
    }

    /**
     * Get data completeness percentage for a location and date range
     */
    public double getDataCompleteness(double latitude, double longitude, LocalDate startDate, LocalDate endDate) {
        long totalDays = startDate.until(endDate).getDays() + 1;
        long availableDays = historicalWeatherRepository
                .findByLatitudeAndLongitudeAndDateBetween(latitude, longitude, startDate, endDate)
                .size();

        return totalDays > 0 ? (double) availableDays / totalDays * 100.0 : 0.0;
    }
}