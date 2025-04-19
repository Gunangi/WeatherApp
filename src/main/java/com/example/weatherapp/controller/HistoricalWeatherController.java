package com.example.weatherapp.controller;


import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/historical")
public class HistoricalWeatherController {

    @Value("${weather.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    public Map getHistoricalWeather(@RequestParam double lat, @RequestParam double lon, @RequestParam long timestamp) {
        String url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=" + lat + "&lon=" + lon + "&dt=" + timestamp + "&appid=" + apiKey + "&units=metric";
        return restTemplate.getForObject(url, Map.class);
    }
}
