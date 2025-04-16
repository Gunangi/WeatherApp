package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherData;
import com.example.weatherapp.model.WeatherSearchHistory;
import com.example.weatherapp.repository.WeatherHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WeatherHistoryService {

    private final WeatherHistoryRepository historyRepository;
    private final WeatherService weatherService;

    @Autowired
    public WeatherHistoryService(WeatherHistoryRepository historyRepository, WeatherService weatherService) {
        this.historyRepository = historyRepository;
        this.weatherService = weatherService;
    }

    public WeatherSearchHistory saveSearch(String username, String city) {
        // Get current weather data for the city
        WeatherData weatherData = weatherService.getWeather(city);

        // Create history entry
        WeatherSearchHistory history = new WeatherSearchHistory();
        history.setUsername(username);
        history.setCity(city);
        history.setSearchTime(LocalDateTime.now());
        history.setWeatherResult(weatherData);

        return historyRepository.save(history);
    }

    public List<WeatherSearchHistory> getUserSearchHistory(String username) {
        return historyRepository.findByUsername(
                username,
                Sort.by(Sort.Direction.DESC, "searchTime")
        );
    }

    public boolean deleteSearchHistory(String id, String username) {
        Optional<WeatherSearchHistory> historyOptional = historyRepository.findById(id);

        if (historyOptional.isPresent()) {
            WeatherSearchHistory history = historyOptional.get();

            // Check if the history entry belongs to the user
            if (history.getUsername().equals(username)) {
                historyRepository.deleteById(id);
                return true;
            }
        }

        return false;
    }

    public void clearUserHistory(String username) {
        historyRepository.deleteByUsername(username);
    }
}