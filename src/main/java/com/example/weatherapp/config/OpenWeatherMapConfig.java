package com.example.weatherapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenWeatherMapConfig {
    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    @Value("https://api.openweathermap.org/data/2.5")
    private String baseUrl;

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}
