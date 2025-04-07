package com.example.weatherapp.service;


import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.WeatherResponse;
import com.example.weatherapp.repository.WeatherRepository;
import org.apache.catalina.Store;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    @Value(value = "38b64d931ea106a38a71f9ec1643ba9d")
    private String apiKey;

    private final WeatherRepository weatherRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public WeatherService(WeatherRepository weatherRepository, RestTemplate restTemplate) {
        this.weatherRepository = weatherRepository;
        this.restTemplate = restTemplate;
    }

    public WeatherData getWeather(String city) {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("https://api.openweathermap.org/data/2.5/weather?q=");
        stringBuilder.append(city);
        stringBuilder.append("&appid=");
        stringBuilder.append(apiKey);
        stringBuilder.append("&units=metric");
        String url = stringBuilder.toString();

        WeatherResponse response = restTemplate.getForObject(url, WeatherResponse.class);

        if (response == null || response.getWeather().isEmpty()) {
            return null;
        }

        WeatherData data = new WeatherData();
        data.setCity(response.getName());
        data.setTemperature(response.getMain().getTemp());
        data.setCondition(response.getWeather().getFirst().getMain());
        data.setDescription(response.getWeather().getFirst().getDescription());
        data.setHumidity(response.getMain().getHumidity());
        data.setWindSpeed(response.getWind().getSpeed());
        data.setIcon(response.getWeather().getFirst().getIcon());

        return data;
    }

    public WeatherData saveWeatherData(WeatherData data) {
        return weatherRepository.save(data);
    }
}
