package com.example.weatherapp.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AirQualityResponseDto {
    private List<AQData> list;

    @Data @JsonIgnoreProperties(ignoreUnknown = true) public static class AQData { private Main main; private Map<String, Double> components; }
    @Data @JsonIgnoreProperties(ignoreUnknown = true) public static class Main { private int aqi; }
}
