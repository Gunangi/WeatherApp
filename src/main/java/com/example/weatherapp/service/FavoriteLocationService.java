// src/main/java/com/example/weatherapp/service/FavoriteLocationService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.FavoriteLocationDto;
import com.example.weatherapp.dto.WeatherResponse;
import com.example.weatherapp.exception.InvalidRequestException;
import com.example.weatherapp.exception.UserNotFoundException;
import com.example.weatherapp.model.FavoriteLocation;
import com.example.weatherapp.model.User;
import com.example.weatherapp.repository.FavoriteLocationRepository;
import com.example.weatherapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteLocationService {

    private final FavoriteLocationRepository favoriteLocationRepository;
    private final UserRepository userRepository;
    private final WeatherService weatherService;

    @Value("${weather.app.max-favorite-locations:10}")
    private int maxFavoriteLocations;

    public List<FavoriteLocationDto> getFavoriteLocations(String userId) {
        validateUser(userId);

        List<FavoriteLocation> favorites = favoriteLocationRepository.findByUserIdOrderByOrderIndexAsc(userId);
        return favorites.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FavoriteLocationDto addFavoriteLocation(String userId, FavoriteLocationDto locationDto) {
        validateUser(userId);

        // Check if user already has maximum number of favorites
        long currentCount = favoriteLocationRepository.countByUserId(userId);
        if (currentCount >= maxFavoriteLocations) {
            throw new InvalidRequestException("Maximum number of favorite locations (" + maxFavoriteLocations + ") reached");
        }

        // Check if location already exists in favorites
        Optional<FavoriteLocation> existing = favoriteLocationRepository
                .findByUserIdAndCityIgnoreCase(userId, locationDto.getCity());
        if (existing.isPresent()) {
            throw new InvalidRequestException("Location already exists in favorites");
        }

        FavoriteLocation favorite = new FavoriteLocation();
        favorite.setUserId(userId);
        favorite.setCity(locationDto.getCity());
        favorite.setCountry(locationDto.getCountry());
        favorite.setLatitude(locationDto.getLatitude());
        favorite.setLongitude(locationDto.getLongitude());
        favorite.setTimezone(locationDto.getTimezone());
        favorite.setNickname(locationDto.getNickname());
        favorite.setOrderIndex((int) currentCount + 1);
        favorite.setCreatedAt(Instant.now());
        favorite.setUpdatedAt(Instant.now());

        FavoriteLocation saved = favoriteLocationRepository.save(favorite);
        log.info("Added favorite location for user {}: {}", userId, locationDto.getCity());

        return mapToDto(saved);
    }

    public void removeFavoriteLocation(String userId, String locationId) {
        validateUser(userId);

        FavoriteLocation favorite = favoriteLocationRepository.findByIdAndUserId(locationId, userId)
                .orElseThrow(() -> new InvalidRequestException("Favorite location not found"));

        favoriteLocationRepository.delete(favorite);

        // Reorder remaining favorites
        reorderFavorites(userId);

        log.info("Removed favorite location for user {}: {}", userId, favorite.getCity());
    }

    public FavoriteLocationDto updateFavoriteLocation(String userId, String locationId, FavoriteLocationDto locationDto) {
        validateUser(userId);

        FavoriteLocation favorite = favoriteLocationRepository.findByIdAndUserId(locationId, userId)
                .orElseThrow(() -> new InvalidRequestException("Favorite location not found"));

        favorite.setNickname(locationDto.getNickname());
        favorite.setOrderIndex(locationDto.getOrderIndex());
        favorite.setUpdatedAt(Instant.now());

        FavoriteLocation updated = favoriteLocationRepository.save(favorite);
        log.info("Updated favorite location for user {}: {}", userId, favorite.getCity());

        return mapToDto(updated);
    }

    public List<FavoriteLocationDto> getFavoriteLocationsWithWeather(String userId) {
        List<FavoriteLocationDto> favorites = getFavoriteLocations(userId);

        return favorites.parallelStream()
                .map(favorite -> {
                    try {
                        WeatherResponse weather = weatherService.getWeatherForCity(favorite.getCity(), userId);
                        favorite.setCurrentWeather(weather);
                    } catch (Exception e) {
                        log.warn("Failed to fetch weather for favorite location {}: {}",
                                favorite.getCity(), e.getMessage());
                    }
                    return favorite;
                })
                .collect(Collectors.toList());
    }

    public void reorderFavorites(String userId, List<String> locationIds) {
        validateUser(userId);

        for (int i = 0; i < locationIds.size(); i++) {
            String locationId = locationIds.get(i);
            Optional<FavoriteLocation> favoriteOpt = favoriteLocationRepository.findByIdAndUserId(locationId, userId);

            if (favoriteOpt.isPresent()) {
                FavoriteLocation favorite = favoriteOpt.get();
                favorite.setOrderIndex(i + 1);
                favorite.setUpdatedAt(Instant.now());
                favoriteLocationRepository.save(favorite);
            }
        }

        log.info("Reordered favorite locations for user {}", userId);
    }

    private void validateUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
    }

    private void reorderFavorites(String userId) {
        List<FavoriteLocation> favorites = favoriteLocationRepository.findByUserIdOrderByOrderIndexAsc(userId);

        for (int i = 0; i < favorites.size(); i++) {
            FavoriteLocation favorite = favorites.get(i);
            favorite.setOrderIndex(i + 1);
            favorite.setUpdatedAt(Instant.now());
            favoriteLocationRepository.save(favorite);
        }
    }

    private FavoriteLocationDto mapToDto(FavoriteLocation favorite) {
        FavoriteLocationDto dto = new FavoriteLocationDto();
        dto.setId(favorite.getId());
        dto.setCity(favorite.getCity());
        dto.setCountry(favorite.getCountry());
        dto.setLatitude(favorite.getLatitude());
        dto.setLongitude(favorite.getLongitude());
        dto.setTimezone(favorite.getTimezone());
        dto.setNickname(favorite.getNickname());
        dto.setOrderIndex(favorite.getOrderIndex());
        dto.setCreatedAt(favorite.getCreatedAt());
        dto.setUpdatedAt(favorite.getUpdatedAt());
        return dto;
    }
}
