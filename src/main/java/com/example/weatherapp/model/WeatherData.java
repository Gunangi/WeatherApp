package com.example.weatherapp.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WeatherData {

    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private double temperature;
    private double feelsLike;
    private double tempMin;
    private double tempMax;
    private int humidity;
    private int pressure;
    private double windSpeed;
    private int windDegree;
    private double windGust;
    private int clouds;
    private int visibility;
    private long sunrise;
    private long sunset;
    private long dt; // Data calculation time
    private int timezone;

    private List<Map<String, Object>> weather = new ArrayList<>();
    private Map<String, Object> main = new HashMap<>();
    private Map<String, Object> wind = new HashMap<>();

    private Map<String, Object> rain;
    private Map<String, Object> snow;

    // Air quality data (if available)
    private Map<String, Object> airQuality;

    // Hourly forecast data
    private List<Map<String, Object>> hourlyForecast;

    // Daily forecast data
    private List<Map<String, Object>> dailyForecast;

    // Historical data
    private List<Map<String, Object>> historicalData;

    // Alerts
    private List<Map<String, Object>> alerts;

    // Timestamp when this data was fetched
    private LocalDateTime fetchedAt;

    public WeatherData() {
        this.fetchedAt = LocalDateTime.now();
    }

    // Add getWeather() method
    public List<Map<String, Object>> getWeather() {
        return weather;
    }

    public void setWeather(List<Map<String, Object>> weather) {
        this.weather = weather;
    }

    // Add getMain() method
    public Map<String, Object> getMain() {
        return main;
    }

    public void setMain(Map<String, Object> main) {
        this.main = main;
    }

    // Add getWind() method
    public Map<String, Object> getWind() {
        return wind;
    }

    public void setWind(Map<String, Object> wind) {
        this.wind = wind;
    }

    // Existing getters and setters remain the same...
    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    // Additional helper methods for main data
    public double getMainTemperature() {
        Object temp = main.get("temp");
        return temp instanceof Number ? ((Number) temp).doubleValue() : 0.0;
    }

    public double getMainFeelsLike() {
        Object feelsLike = main.get("feels_like");
        return feelsLike instanceof Number ? ((Number) feelsLike).doubleValue() : 0.0;
    }

    public double getMainTempMin() {
        Object tempMin = main.get("temp_min");
        return tempMin instanceof Number ? ((Number) tempMin).doubleValue() : 0.0;
    }

    public double getMainTempMax() {
        Object tempMax = main.get("temp_max");
        return tempMax instanceof Number ? ((Number) tempMax).doubleValue() : 0.0;
    }

    public int getMainHumidity() {
        Object humidity = main.get("humidity");
        return humidity instanceof Number ? ((Number) humidity).intValue() : 0;
    }

    public int getMainPressure() {
        Object pressure = main.get("pressure");
        return pressure instanceof Number ? ((Number) pressure).intValue() : 0;
    }

    // Helper methods for wind data
    public double getWindSpeed() {
        Object speed = wind.get("speed");
        return speed instanceof Number ? ((Number) speed).doubleValue() : 0.0;
    }

    public int getWindDegree() {
        Object deg = wind.get("deg");
        return deg instanceof Number ? ((Number) deg).intValue() : 0;
    }

    public double getWindGust() {
        Object gust = wind.get("gust");
        return gust instanceof Number ? ((Number) gust).doubleValue() : 0.0;
    }
}