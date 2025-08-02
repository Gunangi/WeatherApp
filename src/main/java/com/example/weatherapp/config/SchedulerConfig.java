package com.example.weatherapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    // Example scheduler to periodically fetch new weather data
    @Scheduled(fixedRate = 3600000) // every hour
    public void updateWeatherData() {
        // In a real app, you would call a service to update weather data for all tracked cities
        System.out.println("Scheduled task: Fetching latest weather data...");
    }
}