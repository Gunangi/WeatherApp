package com.example.weatherapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.weatherapp.model.WeatherData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class WeatherAPIClient {

    @Value("38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    @Value("https://api.openweathermap.org/data/2.5/weather")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherData fetchWeatherFromAPI(String city) {
        try {
            String uri = apiUrl + "?q=" + city + "&appid=" + apiKey + "&units=metric";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .GET()
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());

            WeatherData data = new WeatherData();
            data.setCity(root.path("name").asText());
            data.setTemperature(root.path("main").path("temp").asDouble());
            data.setHumidity(root.path("main").path("humidity").asInt());
            data.setWindSpeed(root.path("wind").path("speed").asDouble());
            data.setCondition(root.path("weather").get(0).path("main").asText());
            data.setDescription(root.path("weather").get(0).path("description").asText());
            data.setIcon(root.path("weather").get(0).path("icon").asText());

            return data;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

