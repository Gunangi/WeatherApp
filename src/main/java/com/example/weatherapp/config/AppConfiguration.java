package com.example.weatherapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
public class AppConfiguration {
    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    @Value("https://api.openweathermap.org/data/2.5")
    private String baseUrl;

    @Bean
    @Primary
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);  // 5 seconds
        requestFactory.setReadTimeout(5000);     // 5 seconds

        return new RestTemplate(requestFactory);
    }

    @Bean
    public OpenWeatherMapConfig openWeatherMapConfig() {
        return new OpenWeatherMapConfig(apiKey, baseUrl);
    }
}
