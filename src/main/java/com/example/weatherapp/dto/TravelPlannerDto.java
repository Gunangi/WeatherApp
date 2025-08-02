package com.example.weatherapp.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class TravelPlannerDto {
    private List<Destination> destinations;
}

@Data
class Destination {
    private String city;
    private LocalDate startDate;
    private LocalDate endDate;
    private Map<LocalDate, WeatherResponse> weatherForecast;
    private List<String> activities;
    private List<LocalDate> bestTravelDays;
    private List<LocalDate> worstTravelDays;
    private String temperatureUnit;
    private String windSpeedUnit;
}
