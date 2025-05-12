package com.example.weatherapp.config;

public class OpenWeatherMapConfig {
    private final String apiKey;
    private final String baseUrl;

    public OpenWeatherMapConfig(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}