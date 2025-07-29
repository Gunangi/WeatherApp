package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWeatherData {
    private LocalDate date;
    private double tempMin;
    private double tempMax;
    private double tempMorning;
    private double tempDay;
    private double tempEvening;
    private double tempNight;
    private int humidity;
    private double windSpeed;
    private double windDirection;
    private double pressure;
    private String description;
    private String icon;
    private double rainProbability;
    private double rainVolume;
    private double snowVolume;
    private double uvIndex;
    private LocalDateTime sunrise;
    private LocalDateTime sunset;
    private String moonPhase;
}
