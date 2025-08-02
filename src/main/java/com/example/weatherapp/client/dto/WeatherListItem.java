package com.example.weatherapp.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherListItem {
    private long dt;
    private Main main;
    private List<Weather> weather;
    @JsonProperty("dt_txt")
    private DtTxt dt_txt;

    @Data @JsonIgnoreProperties(ignoreUnknown = true) public static class Main { private double temp; private double temp_min; private double temp_max; }
    @Data @JsonIgnoreProperties(ignoreUnknown = true) public static class Weather { private String description; private String icon; }

    // Custom class to parse dt_txt and extract hour
    public static class DtTxt {
        private String text;
        private int hour;

        public void setDt_txt(String text) {
            this.text = text;
            this.hour = LocalDateTime.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")).getHour();
        }
        public int getHour() { return hour; }
    }
}