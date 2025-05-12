package com.example.weatherapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.weatherapp")
public class WeatherAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(WeatherAppApplication.class, args);
    }
}