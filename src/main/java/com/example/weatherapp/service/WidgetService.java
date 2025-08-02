// src/main/java/com/example/weatherapp/service/WidgetService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.WidgetConfigDto;
import com.example.weatherapp.dto.WidgetDataDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.dto.AirQualityResponse;
import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.exception.InvalidRequestException;
import com.example.weatherapp.exception.UserNotFoundException;
import com.example.weatherapp.model.WidgetConfig;
import com.example.weatherapp.repository.WidgetConfigRepository;
import com.example.weatherapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WidgetService {

    private final WidgetConfigRepository widgetConfigRepository;
    private final UserRepository userRepository;
    private final WeatherService weatherService;
    private final AirQualityService airQualityService;
    private final ForecastService forecastService;

    public List<WidgetConfigDto> getUserWidgets(String userId) {
        validateUser(userId);

        List<WidgetConfig> widgets = widgetConfigRepository.findByUserIdOrderByOrderIndexAsc(userId);
        return widgets.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public WidgetConfigDto createWidget(String userId, WidgetConfigDto widgetConfigDto) {
        validateUser(userId);

        WidgetConfig widget = new WidgetConfig();
        widget.setUserId(userId);
        widget.setWidgetType(widgetConfigDto.getWidgetType());
        widget.setTitle(widgetConfigDto.getTitle());
        widget.setCity(widgetConfigDto.getCity());
        widget.setSize(widgetConfigDto.getSize());
        widget.setPosition(widgetConfigDto.getPosition());
        widget.setSettings(widgetConfigDto.getSettings());
        widget.setRefreshInterval(widgetConfigDto.getRefreshInterval());
        widget.setOrderIndex(widgetConfigDto.getOrderIndex());
        widget.setEnabled(widgetConfigDto.isEnabled());
        widget.setUpdatedAt(Instant.now());

        WidgetConfig updated = widgetConfigRepository.save(widget);
        log.info("Updated widget for user {}: {}", userId, widgetId);

        return mapToDto(updated);
    }

    public void deleteWidget(String userId, String widgetId) {
        validateUser(userId);

        WidgetConfig widget = widgetConfigRepository.findByIdAndUserId(widgetId, userId)
                .orElseThrow(() -> new InvalidRequestException("Widget not found"));

        widgetConfigRepository.delete(widget);
        log.info("Deleted widget for user {}: {}", userId, widgetId);
    }

    public List<WidgetDataDto> getWidgetData(String userId) {
        List<WidgetConfigDto> widgets = getUserWidgets(userId);

        return widgets.stream()
                .filter(WidgetConfigDto::isEnabled)
                .map(widget -> getWidgetDataForType(widget))
                .collect(Collectors.toList());
    }

    public WidgetDataDto getSpecificWidgetData(String userId, String widgetId) {
        validateUser(userId);

        WidgetConfig widget = widgetConfigRepository.findByIdAndUserId(widgetId, userId)
                .orElseThrow(() -> new InvalidRequestException("Widget not found"));

        return getWidgetDataForType(mapToDto(widget));
    }

    private WidgetDataDto getWidgetDataForType(WidgetConfigDto widget) {
        WidgetDataDto data = new WidgetDataDto();
        data.setWidgetId(widget.getId());
        data.setWidgetType(widget.getWidgetType());
        data.setTitle(widget.getTitle());
        data.setCity(widget.getCity());
        data.setLastUpdated(Instant.now());

        try {
            switch (widget.getWidgetType().toUpperCase()) {
                case "CURRENT_WEATHER":
                    WeatherResponse weather = weatherService.getWeatherForCity(widget.getCity(), widget.getUserId());
                    data.setData(Map.of(
                            "temperature", weather.getTemperature(),
                            "description", weather.getWeatherDescription(),
                            "humidity", weather.getHumidity(),
                            "windSpeed", weather.getWindSpeed(),
                            "icon", weather.getWeatherIcon()
                    ));
                    break;

                case "TEMPERATURE":
                    WeatherResponse tempWeather = weatherService.getWeatherForCity(widget.getCity(), widget.getUserId());
                    data.setData(Map.of(
                            "current", tempWeather.getTemperature(),
                            "feelsLike", tempWeather.getFeelsLike(),
                            "unit", "°C"
                    ));
                    break;

                case "AIR_QUALITY":
                    AirQualityResponse airQuality = airQualityService.getAirQualityForCity(widget.getCity());
                    data.setData(Map.of(
                            "aqi", airQuality.getAqi(),
                            "healthImpact", airQuality.getHealthImpact(),
                            "pm25", airQuality.getPm2_5(),
                            "pm10", airQuality.getPm10()
                    ));
                    break;

                case "FORECAST":
                    ForecastResponse forecast = forecastService.getForecastForCity(widget.getCity());
                    data.setData(Map.of(
                            "daily", forecast.getDaily().subList(0, Math.min(3, forecast.getDaily().size())),
                            "hourly", forecast.getHourly().subList(0, Math.min(6, forecast.getHourly().size()))
                    ));
                    break;

                case "UV_INDEX":
                    WeatherResponse uvWeather = weatherService.getWeatherForCity(widget.getCity(), widget.getUserId());
                    data.setData(Map.of(
                            "uvIndex", uvWeather.getUvIndex(),
                            "uvIndexText", uvWeather.getUvIndexText(),
                            "recommendation", getUvRecommendation(uvWeather.getUvIndex())
                    ));
                    break;

                case "WIND":
                    WeatherResponse windWeather = weatherService.getWeatherForCity(widget.getCity(), widget.getUserId());
                    data.setData(Map.of(
                            "speed", windWeather.getWindSpeed(),
                            "direction", windWeather.getWindDirection(),
                            "directionText", windWeather.getWindDirectionText()
                    ));
                    break;

                case "HUMIDITY":
                    WeatherResponse humidityWeather = weatherService.getWeatherForCity(widget.getCity(), widget.getUserId());
                    data.setData(Map.of(
                            "humidity", humidityWeather.getHumidity(),
                            "dewPoint", humidityWeather.getDewPoint(),
                            "comfort", getHumidityComfort(humidityWeather.getHumidity())
                    ));
                    break;

                case "SUNRISE_SUNSET":
                    WeatherResponse sunWeather = weatherService.getWeatherForCity(widget.getCity(), widget.getUserId());
                    data.setData(Map.of(
                            "sunrise", sunWeather.getSunrise(),
                            "sunset", sunWeather.getSunset(),
                            "dayLength", calculateDayLength(sunWeather.getSunrise(), sunWeather.getSunset())
                    ));
                    break;

                default:
                    log.warn("Unknown widget type: {}", widget.getWidgetType());
                    data.setData(Map.of("error", "Unknown widget type"));
            }
        } catch (Exception e) {
            log.error("Failed to fetch data for widget {}: {}", widget.getId(), e.getMessage());
            data.setData(Map.of("error", "Failed to fetch data"));
        }

        return data;
    }

    private String getUvRecommendation(double uvIndex) {
        if (uvIndex <= 2) return "Low risk - No protection needed";
        else if (uvIndex <= 5) return "Moderate risk - Some protection needed";
        else if (uvIndex <= 7) return "High risk - Protection essential";
        else if (uvIndex <= 10) return "Very high risk - Extra protection needed";
        else return "Extreme risk - Avoid sun exposure";
    }

    private String getHumidityComfort(int humidity) {
        if (humidity < 30) return "Very dry";
        else if (humidity < 40) return "Dry";
        else if (humidity < 60) return "Comfortable";
        else if (humidity < 70) return "Humid";
        else return "Very humid";
    }

    private long calculateDayLength(java.time.Instant sunrise, java.time.Instant sunset) {
        return java.time.Duration.between(sunrise, sunset).toHours();
    }

    private int getNextOrderIndex(String userId) {
        return (int) widgetConfigRepository.countByUserId(userId) + 1;
    }

    private void validateUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
    }

    private WidgetConfigDto mapToDto(WidgetConfig widget) {
        WidgetConfigDto dto = new WidgetConfigDto();
        dto.setId(widget.getId());
        dto.setUserId(widget.getUserId());
        dto.setWidgetType(widget.getWidgetType());
        dto.setTitle(widget.getTitle());
        dto.setCity(widget.getCity());
        dto.setSize(widget.getSize());
        dto.setPosition(widget.getPosition());
        dto.setSettings(widget.getSettings());
        dto.setRefreshInterval(widget.getRefreshInterval());
        dto.setOrderIndex(widget.getOrderIndex());
        dto.setEnabled(widget.isEnabled());
        dto.setCreatedAt(widget.getCreatedAt());
        dto.setUpdatedAt(widget.getUpdatedAt());
        return dto;
    }
}dgetConfigDto.getPosition());
        widget.setSettings(widgetConfigDto.getSettings());
        widget.setRefreshInterval(widgetConfigDto.getRefreshInterval());
        widget.setOrderIndex(getNextOrderIndex(userId));
        widget.setEnabled(true);
        widget.setCreatedAt(Instant.now());
        widget.setUpdatedAt(Instant.now());

WidgetConfig saved = widgetConfigRepository.save(widget);
        log.info("Created widget for user {}: {} - {}", userId, saved.getWidgetType(), saved.getTitle());

        return mapToDto(saved);
    }

public WidgetConfigDto updateWidget(String userId, String widgetId, WidgetConfigDto widgetConfigDto) {
    validateUser(userId);

    WidgetConfig widget = widgetConfigRepository.findByIdAndUserId(widgetId, userId)
            .orElseThrow(() -> new InvalidRequestException("Widget not found"));

    widget.setTitle(widgetConfigDto.getTitle());
    widget.setCity(widgetConfigDto.getCity());
    widget.setSize(widgetConfigDto.getSize());
    widget.setPosition(wi