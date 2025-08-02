package com.example.weatherapp.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ForecastResponseDto {
    private List<WeatherListItem> list;
}