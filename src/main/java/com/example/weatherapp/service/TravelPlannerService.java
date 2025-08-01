package com.example.weatherapp.service;

import com.example.weatherapp.dto.TravelPlannerDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.ForecastData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TravelPlannerService {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private ForecastService forecastService;

    @Autowired
    private LocationService locationService;

    /**
     * Get comprehensive travel weather plan for multiple destinations
     */
    public TravelPlannerDto getTravelWeatherPlan(List<String> destinations,
                                                 LocalDate startDate,
                                                 LocalDate endDate) {
        TravelPlannerDto travelPlan = new TravelPlannerDto();
        travelPlan.setStartDate(startDate);
        travelPlan.setEndDate(endDate);
        travelPlan.setDestinations(new ArrayList<>());

        for (String destination : destinations) {
            TravelPlannerDto.DestinationWeather destWeather = getDestinationWeather(
                    destination, startDate, endDate);
            travelPlan.getDestinations().add(destWeather);
        }

        // Add travel recommendations
        travelPlan.setRecommendations(generateTravelRecommendations(travelPlan));
        travelPlan.setBestTravelDays(findBestTravelDays(travelPlan));

        return travelPlan;
    }

    /**
     * Get weather data for a specific destination within date range
     */
    private TravelPlannerDto.DestinationWeather getDestinationWeather(String destination,
                                                                      LocalDate startDate,
                                                                      LocalDate endDate) {
        TravelPlannerDto.DestinationWeather destWeather = new TravelPlannerDto.DestinationWeather();
        destWeather.setDestination(destination);
        destWeather.setDailyForecasts(new ArrayList<>());

        try {
            // Get location coordinates
            var location = locationService.getLocationByName(destination);
            destWeather.setLatitude(location.getLatitude());
            destWeather.setLongitude(location.getLongitude());

            // Get current weather
            WeatherResponse currentWeather = weatherService.getCurrentWeatherByLocation(
                    location.getLatitude(), location.getLongitude());
            destWeather.setCurrentWeather(currentWeather);

            // Get forecast for travel period
            ForecastResponse forecast = forecastService.getForecastByLocation(
                    location.getLatitude(), location.getLongitude(), 14); // 14-day forecast

            // Filter forecast for travel dates
            List<TravelPlannerDto.DailyTravelForecast> dailyForecasts = forecast.getDailyForecasts()
                    .stream()
                    .filter(daily -> {
                        LocalDate forecastDate = daily.getDate().toLocalDate();
                        return (forecastDate.isEqual(startDate) || forecastDate.isAfter(startDate)) &&
                                (forecastDate.isEqual(endDate) || forecastDate.isBefore(endDate));
                    })
                    .map(this::convertToDailyTravelForecast)
                    .collect(Collectors.toList());

            destWeather.setDailyForecasts(dailyForecasts);
            destWeather.setWeatherSummary(generateWeatherSummary(dailyForecasts));
            destWeather.setPackingRecommendations(generatePackingRecommendations(dailyForecasts));

        } catch (Exception e) {
            destWeather.setError("Unable to fetch weather data for " + destination);
        }

        return destWeather;
    }

    /**
     * Convert forecast data to travel-specific format
     */
    private TravelPlannerDto.DailyTravelForecast convertToDailyTravelForecast(ForecastData forecast) {
        TravelPlannerDto.DailyTravelForecast travelForecast = new TravelPlannerDto.DailyTravelForecast();
        travelForecast.setDate(forecast.getDate());
        travelForecast.setMaxTemperature(forecast.getMaxTemperature());
        travelForecast.setMinTemperature(forecast.getMinTemperature());
        travelForecast.setCondition(forecast.getCondition());
        travelForecast.setHumidity(forecast.getHumidity());
        travelForecast.setWindSpeed(forecast.getWindSpeed());
        travelForecast.setPrecipitationChance(forecast.getPrecipitationChance());
        travelForecast.setUvIndex(forecast.getUvIndex());

        // Travel-specific assessments
        travelForecast.setTravelScore(calculateTravelScore(forecast));
        travelForecast.setOutdoorActivities(getRecommendedActivities(forecast));
        travelForecast.setComfortLevel(calculateComfortLevel(forecast));

        return travelForecast;
    }

    /**
     * Calculate travel score (1-10) based on weather conditions
     */
    private int calculateTravelScore(ForecastData forecast) {
        int score = 10;

        // Temperature penalties
        if (forecast.getMaxTemperature() > 35 || forecast.getMaxTemperature() < 5) {
            score -= 3;
        } else if (forecast.getMaxTemperature() > 30 || forecast.getMaxTemperature() < 10) {
            score -= 1;
        }

        // Precipitation penalties
        if (forecast.getPrecipitationChance() > 70) {
            score -= 3;
        } else if (forecast.getPrecipitationChance() > 40) {
            score -= 1;
        }

        // Wind penalties
        if (forecast.getWindSpeed() > 20) {
            score -= 2;
        } else if (forecast.getWindSpeed() > 15) {
            score -= 1;
        }

        // Humidity penalties
        if (forecast.getHumidity() > 80) {
            score -= 1;
        }

        return Math.max(1, score);
    }

    /**
     * Get recommended outdoor activities based on weather
     */
    private List<String> getRecommendedActivities(ForecastData forecast) {
        List<String> activities = new ArrayList<>();

        if (forecast.getPrecipitationChance() < 30 && forecast.getWindSpeed() < 15) {
            activities.add("Sightseeing");
            activities.add("Walking tours");
        }

        if (forecast.getMaxTemperature() >= 20 && forecast.getMaxTemperature() <= 28
                && forecast.getPrecipitationChance() < 20) {
            activities.add("Outdoor dining");
            activities.add("Photography");
        }

        if (forecast.getMaxTemperature() >= 15 && forecast.getPrecipitationChance() < 40) {
            activities.add("Museum visits");
            activities.add("Shopping");
        }

        if (forecast.getPrecipitationChance() > 60) {
            activities.add("Indoor attractions");
            activities.add("Cafes and restaurants");
        }

        return activities;
    }

    /**
     * Calculate comfort level for travelers
     */
    private String calculateComfortLevel(ForecastData forecast) {
        int comfortScore = 0;

        // Temperature comfort
        if (forecast.getMaxTemperature() >= 18 && forecast.getMaxTemperature() <= 26) {
            comfortScore += 3;
        } else if (forecast.getMaxTemperature() >= 15 && forecast.getMaxTemperature() <= 30) {
            comfortScore += 2;
        } else {
            comfortScore += 1;
        }

        // Humidity comfort
        if (forecast.getHumidity() >= 40 && forecast.getHumidity() <= 60) {
            comfortScore += 2;
        } else if (forecast.getHumidity() >= 30 && forecast.getHumidity() <= 70) {
            comfortScore += 1;
        }

        // Precipitation comfort
        if (forecast.getPrecipitationChance() < 20) {
            comfortScore += 2;
        } else if (forecast.getPrecipitationChance() < 50) {
            comfortScore += 1;
        }

        if (comfortScore >= 6) return "Excellent";
        if (comfortScore >= 4) return "Good";
        if (comfortScore >= 2) return "Fair";
        return "Poor";
    }

    /**
     * Generate weather summary for destination
     */
    private String generateWeatherSummary(List<TravelPlannerDto.DailyTravelForecast> forecasts) {
        if (forecasts.isEmpty()) return "No weather data available";

        double avgMaxTemp = forecasts.stream()
                .mapToDouble(TravelPlannerDto.DailyTravelForecast::getMaxTemperature)
                .average().orElse(0);

        double avgMinTemp = forecasts.stream()
                .mapToDouble(TravelPlannerDto.DailyTravelForecast::getMinTemperature)
                .average().orElse(0);

        double avgPrecipitation = forecasts.stream()
                .mapToDouble(TravelPlannerDto.DailyTravelForecast::getPrecipitationChance)
                .average().orElse(0);

        return String.format("Average temperatures: %.1f°C - %.1f°C, %.0f%% chance of rain",
                avgMinTemp, avgMaxTemp, avgPrecipitation);
    }

    /**
     * Generate packing recommendations
     */
    private List<String> generatePackingRecommendations(List<TravelPlannerDto.DailyTravelForecast> forecasts) {
        Set<String> recommendations = new HashSet<>();

        double maxTemp = forecasts.stream()
                .mapToDouble(TravelPlannerDto.DailyTravelForecast::getMaxTemperature)
                .max().orElse(0);

        double minTemp = forecasts.stream()
                .mapToDouble(TravelPlannerDto.DailyTravelForecast::getMinTemperature)
                .min().orElse(0);

        double maxPrecipitation = forecasts.stream()
                .mapToDouble(TravelPlannerDto.DailyTravelForecast::getPrecipitationChance)
                .max().orElse(0);

        // Temperature-based recommendations
        if (maxTemp > 30) {
            recommendations.add("Light, breathable clothing");
            recommendations.add("Sun hat and sunglasses");
            recommendations.add("Sunscreen");
        }

        if (minTemp < 10) {
            recommendations.add("Warm jacket or coat");
            recommendations.add("Long pants");
        }

        if (maxTemp - minTemp > 15) {
            recommendations.add("Layered clothing");
        }

        // Precipitation-based recommendations
        if (maxPrecipitation > 50) {
            recommendations.add("Waterproof jacket");
            recommendations.add("Umbrella");
            recommendations.add("Waterproof shoes");
        }

        // General travel recommendations
        recommendations.add("Comfortable walking shoes");

        return new ArrayList<>(recommendations);
    }

    /**
     * Generate overall travel recommendations
     */
    private List<String> generateTravelRecommendations(TravelPlannerDto travelPlan) {
        List<String> recommendations = new ArrayList<>();

        // Analyze all destinations
        double avgTravelScore = travelPlan.getDestinations().stream()
                .flatMap(dest -> dest.getDailyForecasts().stream())
                .mapToInt(TravelPlannerDto.DailyTravelForecast::getTravelScore)
                .average().orElse(0);

        if (avgTravelScore >= 8) {
            recommendations.add("Excellent weather conditions expected for your trip!");
        } else if (avgTravelScore >= 6) {
            recommendations.add("Generally good weather conditions expected.");
        } else if (avgTravelScore >= 4) {
            recommendations.add("Mixed weather conditions - pack versatile clothing.");
        } else {
            recommendations.add("Challenging weather conditions expected - plan indoor activities.");
        }

        // Check for severe weather across destinations
        boolean severeWeatherExpected = travelPlan.getDestinations().stream()
                .flatMap(dest -> dest.getDailyForecasts().stream())
                .anyMatch(forecast -> forecast.getPrecipitationChance() > 80 ||
                        forecast.getWindSpeed() > 25);

        if (severeWeatherExpected) {
            recommendations.add("Monitor weather alerts during your trip.");
        }

        return recommendations;
    }

    /**
     * Find best travel days across all destinations
     */
    private List<LocalDate> findBestTravelDays(TravelPlannerDto travelPlan) {
        Map<LocalDate, Double> dateScores = new HashMap<>();

        // Calculate average score for each date across all destinations
        for (TravelPlannerDto.DestinationWeather destination : travelPlan.getDestinations()) {
            for (TravelPlannerDto.DailyTravelForecast forecast : destination.getDailyForecasts()) {
                LocalDate date = forecast.getDate().toLocalDate();
                dateScores.merge(date, (double) forecast.getTravelScore(),
                        (oldScore, newScore) -> (oldScore + newScore) / 2);
            }
        }

        // Return top 3 dates sorted by score
        return dateScores.entrySet().stream()
                .sorted(Map.Entry.<LocalDate, Double>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Compare weather between multiple destinations for a specific date
     */
    public Map<String, TravelPlannerDto.DailyTravelForecast> compareDestinationsForDate(
            List<String> destinations, LocalDate date) {
        Map<String, TravelPlannerDto.DailyTravelForecast> comparison = new HashMap<>();

        for (String destination : destinations) {
            TravelPlannerDto.DestinationWeather destWeather = getDestinationWeather(
                    destination, date, date);

            if (!destWeather.getDailyForecasts().isEmpty()) {
                comparison.put(destination, destWeather.getDailyForecasts().get(0));
            }
        }

        return comparison;
    }
}