package com.example.weatherapp.service;

import com.example.weatherapp.client.OpenWeatherMapClient;
import com.example.weatherapp.client.dto.ForecastResponseDto;
import com.example.weatherapp.client.dto.GeoCoordinates;
import com.example.weatherapp.client.dto.WeatherListItem;
import com.example.weatherapp.dto.ForecastResponse;
import com.example.weatherapp.dto.DailyForecastDto;
import com.example.weatherapp.dto.HourlyForecastDto;
import com.example.weatherapp.exception.LocationNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForecastService {

    private final OpenWeatherMapClient weatherClient;

    public ForecastResponse getForecastForCity(String city) {
        GeoCoordinates coords = weatherClient.getCoordinatesForCity(city)
                .orElseThrow(() -> new LocationNotFoundException("Could not find coordinates for city: " + city));

        ForecastResponseDto forecastData = weatherClient.getForecast(coords.getLat(), coords.getLon());

        return processForecastData(forecastData, city);
    }

    private ForecastResponse processForecastData(ForecastResponseDto data, String city) {
        ForecastResponse response = new ForecastResponse();
        response.setCity(city);
        response.setHourly(processHourlyForecast(data.getList()));
        response.setDaily(processDailyForecast(data.getList()));
        return response;
    }

    private List<HourlyForecastDto> processHourlyForecast(List<WeatherListItem> list) {
        // Return the next 8 intervals (24 hours)
        return list.stream().limit(8).map(item -> {
            HourlyForecastDto dto = new HourlyForecastDto();
            dto.setDateTime(Instant.ofEpochSecond(item.getDt()));
            dto.setTemperature(item.getMain().getTemp());
            dto.setDescription(item.getWeather().get(0).getDescription());
            dto.setIcon(item.getWeather().get(0).getIcon());
            return dto;
        }).collect(Collectors.toList());
    }

    private List<DailyForecastDto> processDailyForecast(List<WeatherListItem> list) {
        // Group 3-hour forecasts by day
        Map<LocalDate, List<WeatherListItem>> dailyData = list.stream()
                .collect(Collectors.groupingBy(item ->
                        Instant.ofEpochSecond(item.getDt()).atZone(ZoneId.of("UTC")).toLocalDate()));

        List<DailyForecastDto> dailyForecasts = new ArrayList<>();
        for (Map.Entry<LocalDate, List<WeatherListItem>> entry : dailyData.entrySet()) {
            if (dailyForecasts.size() >= 5) break; // Limit to 5 days

            DailyForecastDto dto = new DailyForecastDto();
            dto.setDate(entry.getKey());
            dto.setDayOfWeek(entry.getKey().getDayOfWeek().toString());

            // Calculate min/max temps for the day
            dto.setTempMin(entry.getValue().stream().mapToDouble(i -> i.getMain().getTemp_min()).min().orElse(0));
            dto.setTempMax(entry.getValue().stream().mapToDouble(i -> i.getMain().getTemp_max()).max().orElse(0));

            // Use the weather from midday for the description/icon
            WeatherListItem representativeItem = entry.getValue().stream()
                    .min((a, b) -> Math.abs(a.getDt_txt().getHour() - 12) - Math.abs(b.getDt_txt().getHour() - 12))
                    .orElse(entry.getValue().get(0));

            dto.setDescription(representativeItem.getWeather().get(0).getDescription());
            dto.setIcon(representativeItem.getWeather().get(0).getIcon());

            dailyForecasts.add(dto);
        }
        return dailyForecasts;
    }
}