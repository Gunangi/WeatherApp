package com.example.weatherapp.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    // Getters and setters
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

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getFeelsLike() {
        return feelsLike;
    }

    public void setFeelsLike(double feelsLike) {
        this.feelsLike = feelsLike;
    }

    public double getTempMin() {
        return tempMin;
    }

    public void setTempMin(double tempMin) {
        this.tempMin = tempMin;
    }

    public double getTempMax() {
        return tempMax;
    }

    public void setTempMax(double tempMax) {
        this.tempMax = tempMax;
    }

    public int getHumidity() {
        return humidity;
    }

    public void setHumidity(int humidity) {
        this.humidity = humidity;
    }

    public int getPressure() {
        return pressure;
    }

    public void setPressure(int pressure) {
        this.pressure = pressure;
    }

    public double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public int getWindDegree() {
        return windDegree;
    }

    public void setWindDegree(int windDegree) {
        this.windDegree = windDegree;
    }

    public double getWindGust() {
        return windGust;
    }

    public void setWindGust(double windGust) {
        this.windGust = windGust;
    }

    public int getClouds() {
        return clouds;
    }

    public void setClouds(int clouds) {
        this.clouds = clouds;
    }

    public int getVisibility() {
        return visibility;
    }

    public void setVisibility(int visibility) {
        this.visibility = visibility;
    }

    public long getSunrise() {
        return sunrise;
    }

    public void setSunrise(long sunrise) {
        this.sunrise = sunrise;
    }

    public long getSunset() {
        return sunset;
    }

    public void setSunset(long sunset) {
        this.sunset = sunset;
    }

    public long getDt() {
        return dt;
    }

    public void setDt(long dt) {
        this.dt = dt;
    }

    public int getTimezone() {
        return timezone;
    }

    public void setTimezone(int timezone) {
        this.timezone = timezone;
    }

    public List<Map<String, Object>> getWeather() {
        return weather;
    }

    public void setWeather(List<Map<String, Object>> weather) {
        this.weather = weather;
    }

    public Map<String, Object> getRain() {
        return rain;
    }

    public void setRain(Map<String, Object> rain) {
        this.rain = rain;
    }

    public Map<String, Object> getSnow() {
        return snow;
    }

    public void setSnow(Map<String, Object> snow) {
        this.snow = snow;
    }

    public Map<String, Object> getAirQuality() {
        return airQuality;
    }

    public void setAirQuality(Map<String, Object> airQuality) {
        this.airQuality = airQuality;
    }

    public List<Map<String, Object>> getHourlyForecast() {
        return hourlyForecast;
    }

    public void setHourlyForecast(List<Map<String, Object>> hourlyForecast) {
        this.hourlyForecast = hourlyForecast;
    }

    public List<Map<String, Object>> getDailyForecast() {
        return dailyForecast;
    }

    public void setDailyForecast(List<Map<String, Object>> dailyForecast) {
        this.dailyForecast = dailyForecast;
    }

    public List<Map<String, Object>> getHistoricalData() {
        return historicalData;
    }

    public void setHistoricalData(List<Map<String, Object>> historicalData) {
        this.historicalData = historicalData;
    }

    public List<Map<String, Object>> getAlerts() {
        return alerts;
    }

    public void setAlerts(List<Map<String, Object>> alerts) {
        this.alerts = alerts;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(LocalDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }
}