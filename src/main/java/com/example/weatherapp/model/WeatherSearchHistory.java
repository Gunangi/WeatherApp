package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "weather_search_history")
public class WeatherSearchHistory {

    @Id
    private String id;
    private String username;
    private String city;
    private LocalDateTime searchTime;
    private WeatherData weatherResult;

    // Constructors
    public WeatherSearchHistory() {
    }

    public WeatherSearchHistory(String username, String city, LocalDateTime searchTime, WeatherData weatherResult) {
        this.username = username;
        this.city = city;
        this.searchTime = searchTime;
        this.weatherResult = weatherResult;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public LocalDateTime getSearchTime() {
        return searchTime;
    }

    public void setSearchTime(LocalDateTime searchTime) {
        this.searchTime = searchTime;
    }

    public WeatherData getWeatherResult() {
        return weatherResult;
    }

    public void setWeatherResult(WeatherData weatherResult) {
        this.weatherResult = weatherResult;
    }
}