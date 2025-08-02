package com.example.weatherapp.service;

import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.repository.LocationHistoryRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationHistoryRepository locationHistoryRepository;

    public void saveSearchHistory(String userId, String city) {
        LocationHistory history = new LocationHistory();
        history.setUserId(userId);
        history.setCity(city);
        history.setSearchTimestamp(Instant.now());
        locationHistoryRepository.save(history);
    }

    public List<LocationHistory> getSearchHistory(String userId) {
        return locationHistoryRepository.findByUserIdOrderBySearchTimestampDesc(userId);
    }
}