package com.example.weatherapp.service;

import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.repository.LocationHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LocationService {

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private FavoriteLocationRepository favoriteLocationRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${openweathermap.api.key}")
    private String apiKey;

    private static final String GEOCODING_API_URL = "http://api.openweathermap.org/geo/1.0/";
    private static final int MAX_HISTORY_ITEMS = 50;

    public List<LocationSearchResult> searchLocations(String query, int limit) {
        try {
            String url = String.format("%sdirect?q=%s&limit=%d&appid=%s",
                    GEOCODING_API_URL, query, limit, apiKey);

            // This would return an array of location objects from OpenWeatherMap
            LocationSearchResult[] results = restTemplate.getForObject(url, LocationSearchResult[].class);

            return List.of(results != null ? results : new LocationSearchResult[0]);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search locations", e);
        }
    }

    public LocationSearchResult reverseGeocode(double lat, double lon) {
        try {
            String url = String.format("%sreverse?lat=%f&lon=%f&limit=1&appid=%s",
                    GEOCODING_API_URL, lat, lon, apiKey);

            LocationSearchResult[] results = restTemplate.getForObject(url, LocationSearchResult[].class);

            if (results != null && results.length > 0) {
                return results[0];
            }

            throw new RuntimeException("Location not found for coordinates");
        } catch (Exception e) {
            throw new RuntimeException("Failed to reverse geocode location", e);
        }
    }

    public void saveLocationToHistory(String userId, LocationSearchResult location, boolean isGpsDetected) {
        Optional<LocationHistory> existing = locationHistoryRepository
                .findByUserIdAndCityNameIgnoreCase(userId, location.getName());

        if (existing.isPresent()) {
            LocationHistory history = existing.get();
            history.setSearchCount(history.getSearchCount() + 1);
            history.setSearchedAt(LocalDateTime.now());
            locationHistoryRepository.save(history);
        } else {
            LocationHistory newHistory = new LocationHistory();
            newHistory.setUserId(userId);
            newHistory.setCityName(location.getName());
            newHistory.setLatitude(location.getLatitude());
            newHistory.setLongitude(location.getLongitude());
            newHistory.setCountry(location.getCountry());
            newHistory.setState(location.getState());
            newHistory.setSearchedAt(LocalDateTime.now());
            newHistory.setSearchCount(1);
            newHistory.setGpsDetected(isGpsDetected);

            locationHistoryRepository.save(newHistory);

            // Clean up old history items if exceeded limit
            cleanupLocationHistory(userId);
        }
    }

    public List<LocationHistory> getLocationHistory(String userId) {
        return locationHistoryRepository.findTop10ByUserIdOrderBySearchCountDescSearchedAtDesc(userId);
    }

    public FavoriteLocation addToFavorites(String userId, LocationSearchResult location, String nickname) {
        // Check if already exists
        if (favoriteLocationRepository.existsByUserIdAndCityNameIgnoreCase(userId, location.getName())) {
            throw new RuntimeException("Location already in favorites");
        }

        // Check if this should be the default location (first favorite)
        boolean isDefault = favoriteLocationRepository.countByUserId(userId) == 0;

        FavoriteLocation favorite = FavoriteLocation.builder()
                .userId(userId)
                .cityName(location.getName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .nickname(nickname != null ? nickname : location.getName())
                .country(location.getCountry())
                .state(location.getState())
                .isDefault(isDefault)
                .addedAt(LocalDateTime.now())
                .build();

        return favoriteLocationRepository.save(favorite);
    }

    public List<FavoriteLocation> getFavoriteLocations(String userId) {
        return favoriteLocationRepository.findByUserIdOrderByAddedAtDesc(userId);
    }

    public void removeFromFavorites(String userId, String favoriteId) {
        Optional<FavoriteLocation> favorite = favoriteLocationRepository.findById(favoriteId);

        if (favorite.isPresent() && favorite.get().getUserId().equals(userId)) {
            favoriteLocationRepository.deleteById(favoriteId);

            // If this was the default location, set another as default
            if (favorite.get().isDefault()) {
                List<FavoriteLocation> remaining = favoriteLocationRepository.findByUserIdOrderByAddedAtDesc(userId);
                if (!remaining.isEmpty()) {
                    FavoriteLocation newDefault = remaining.get(0);
                    newDefault.setDefault(true);
                    favoriteLocationRepository.save(newDefault);
                }
            }
        }
    }

    public void setDefaultLocation(String userId, String favoriteId) {
        // Remove default from current default location
        Optional<FavoriteLocation> currentDefault = favoriteLocationRepository.findByUserIdAndIsDefaultTrue(userId);
        currentDefault.ifPresent(location -> {
            location.setDefault(false);
            favoriteLocationRepository.save(location);
        });

        // Set new default
        Optional<FavoriteLocation> newDefault = favoriteLocationRepository.findById(favoriteId);
        if (newDefault.isPresent() && newDefault.get().getUserId().equals(userId)) {
            FavoriteLocation location = newDefault.get();
            location.setDefault(true);
            favoriteLocationRepository.save(location);
        }
    }

    private void cleanupLocationHistory(String userId) {
        List<LocationHistory> allHistory = locationHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);

        if (allHistory.size() > MAX_HISTORY_ITEMS) {
            List<LocationHistory> toDelete = allHistory.subList(MAX_HISTORY_ITEMS, allHistory.size());
            locationHistoryRepository.deleteAll(toDelete);
        }
    }
}
