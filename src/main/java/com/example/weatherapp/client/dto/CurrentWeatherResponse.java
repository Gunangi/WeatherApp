// src/main/java/com/weatherapp/client/dto/CurrentWeatherResponse.java
package com.example.weatherapp.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CurrentWeatherResponse {
    private List<Weather> weather;
    private Main main;
    private Wind wind;
    private Clouds clouds; // FIX: Added Clouds field
    private Sys sys;
    private int visibility;
    private long dt;
    private int timezone;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Weather {
        // FIX: Added main and icon fields
        private String main;
        private String description;
        private String icon;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Main {
        private double temp;
        @JsonProperty("feels_like")
        private double feels_like;
        private int pressure;
        private int humidity;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Wind {
        private double speed;
        // FIX: Added deg field for wind direction
        private double deg;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Clouds {
        // FIX: Added all field for cloud cover percentage
        private int all;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Sys {
        private long sunrise;
        private long sunset;
    }
}