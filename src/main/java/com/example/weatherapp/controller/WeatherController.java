// src/main/java/com/weatherapp/controller/WeatherController.java

package com.example.weatherapp.controller;

import com.example.weatherapp.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping("/current")
    public String getCurrentWeather(@RequestParam String city) {
        return weatherService.getCurrentWeather(city);
    }

    @GetMapping("/forecast")
    public String getForecast(@RequestParam String city) {
        return weatherService.getForecast(city);
    }

    @GetMapping("/air-pollution")
    public String getAirPollution(@RequestParam double lat, @RequestParam double lon) {
        return weatherService.getAirPollution(lat, lon);
    }
}