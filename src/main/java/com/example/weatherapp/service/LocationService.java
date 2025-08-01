package com.example.weatherapp.service;

import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.repository.LocationHistoryRepository;
import com.example.weatherapp.dto.LocationDto;
import com.example.weatherapp.exception.LocationNotFoundException;
import com.example.weatherapp.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class LocationService {

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.geocoding.url:http://api.openweathermap.org/geo/1.0}")
    private String geocodingBaseUrl;

    private static final int MAX_SEARCH_RESULTS = 5;
    private static final int MAX_LOCATION_HISTORY = 50;

    /**
     * Search for cities by name using OpenWeatherMap Geocoding API
     */
    public List<LocationDto> searchCitiesByName(String cityName) {
        if (cityName == null || cityName.trim().isEmpty()) {
            throw new InvalidRequestException("City name cannot be empty");
        }

        try {
            String url = String.format("%s/direct?q=%s&limit=%d&appid=%s",
                    geocodingBaseUrl, cityName.trim(), MAX_SEARCH_RESULTS, apiKey);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            List<LocationDto> locations = new ArrayList<>();

            if (jsonNode.isArray()) {
                for (JsonNode locationNode : jsonNode) {
                    LocationDto location = new LocationDto();
                    location.setCityName(locationNode.get("name").asText());
                    location.setLatitude(locationNode.get("lat").asDouble());
                    location.setLongitude(locationNode.get("lon").asDouble());
                    location.setCountryCode(locationNode.get("country").asText());

                    // Get state if available
                    if (locationNode.has("state")) {
                        location.setState(locationNode.get("state").asText());
                    }

                    // Create display name
                    String displayName = location.getCityName();
                    if (location.getState() != null && !location.getState().isEmpty()) {
                        displayName += ", " + location.getState();
                    }
                    displayName += ", " + location.getCountryCode();
                    location.setDisplayName(displayName);

                    locations.add(location);
                }
            }

            return locations;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 404) {
                throw new LocationNotFoundException("No locations found for: " + cityName);
            }
            throw new InvalidRequestException("Error searching for locations: " + e.getMessage());
        } catch (Exception e) {
            throw new InvalidRequestException("Error processing location search: " + e.getMessage());
        }
    }

    /**
     * Get location details by coordinates using reverse geocoding
     */
    public LocationDto getLocationByCoordinates(double latitude, double longitude) {
        try {
            String url = String.format("%s/reverse?lat=%f&lon=%f&limit=1&appid=%s",
                    geocodingBaseUrl, latitude, longitude, apiKey);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.isArray() && jsonNode.size() > 0) {
                JsonNode locationNode = jsonNode.get(0);

                LocationDto location = new LocationDto();
                location.setCityName(locationNode.get("name").asText());
                location.setLatitude(latitude);
                location.setLongitude(longitude);
                location.setCountryCode(locationNode.get("country").asText());

                if (locationNode.has("state")) {
                    location.setState(locationNode.get("state").asText());
                }

                // Create display name
                String displayName = location.getCityName();
                if (location.getState() != null && !location.getState().isEmpty()) {
                    displayName += ", " + location.getState();
                }
                displayName += ", " + location.getCountryCode();
                location.setDisplayName(displayName);

                return location;
            } else {
                throw new LocationNotFoundException("No location found for coordinates: " + latitude + ", " + longitude);
            }

        } catch (HttpClientErrorException e) {
            throw new InvalidRequestException("Error getting location by coordinates: " + e.getMessage());
        } catch (Exception e) {
            throw new InvalidRequestException("Error processing reverse geocoding: " + e.getMessage());
        }
    }

    /**
     * Save location to user's search history
     */
    public LocationHistory saveLocationToHistory(String userId, LocationDto locationDto) {
        // Check if location already exists in recent history
        List<LocationHistory> recentSearches = locationHistoryRepository
                .findByUserIdAndCityNameAndCountryCodeOrderBySearchedAtDesc(
                        userId, locationDto.getCityName(), locationDto.getCountryCode());

        LocationHistory locationHistory;

        if (!recentSearches.isEmpty()) {
            // Update existing entry
            locationHistory = recentSearches.get(0);
            locationHistory.setSearchedAt(LocalDateTime.now());
        } else {
            // Create new entry
            locationHistory = new LocationHistory();
            locationHistory.setUserId(userId);
            locationHistory.setCityName(locationDto.getCityName());
            locationHistory.setCountryCode(locationDto.getCountryCode());
            locationHistory.setState(locationDto.getState());
            locationHistory.setLatitude(locationDto.getLatitude());
            locationHistory.setLongitude(locationDto.getLongitude());
            locationHistory.setDisplayName(locationDto.getDisplayName());
            locationHistory.setSearchedAt(LocalDateTime.now());
            locationHistory.setIsFavorite(false);
        }

        LocationHistory saved = locationHistoryRepository.save(locationHistory);

        // Clean up old history entries (keep only recent MAX_LOCATION_HISTORY entries)
        cleanupLocationHistory(userId);

        return saved;
    }

    /**
     * Get user's location search history
     */
    public List<LocationDto> getLocationHistory(String userId) {
        List<LocationHistory> history = locationHistoryRepository
                .findByUserIdOrderBySearchedAtDesc(userId);

        return history.stream()
                .map(this::convertToLocationDto)
                .collect(Collectors.toList());
    }

    /**
     * Get user's recent searches (non-favorite)
     */
    public List<LocationDto> getRecentSearches(String userId, int limit) {
        List<LocationHistory> history = locationHistoryRepository
                .findByUserIdAndIsFavoriteOrderBySearchedAtDesc(userId, false);

        return history.stream()
                .limit(limit)
                .map(this::convertToLocationDto)
                .collect(Collectors.toList());
    }

    /**
     * Get user's favorite locations
     */
    public List<LocationDto> getFavoriteLocations(String userId) {
        List<LocationHistory> favorites = locationHistoryRepository
                .findByUserIdAndIsFavoriteOrderBySearchedAtDesc(userId, true);

        return favorites.stream()
                .map(this::convertToLocationDto)
                .collect(Collectors.toList());
    }

    /**
     * Mark location as favorite
     */
    public LocationHistory markAsFavorite(String userId, String cityName, String countryCode) {
        List<LocationHistory> locations = locationHistoryRepository
                .findByUserIdAndCityNameAndCountryCode(userId, cityName, countryCode);

        if (locations.isEmpty()) {
            throw new LocationNotFoundException("Location not found in history: " + cityName + ", " + countryCode);
        }

        LocationHistory location = locations.get(0);
        location.setIsFavorite(true);
        return locationHistoryRepository.save(location);
    }

    /**
     * Remove location from favorites
     */
    public LocationHistory removeFromFavorites(String userId, String cityName, String countryCode) {
        List<LocationHistory> locations = locationHistoryRepository
                .findByUserIdAndCityNameAndCountryCode(userId, cityName, countryCode);

        if (locations.isEmpty()) {
            throw new LocationNotFoundException("Location not found in history: " + cityName + ", " + countryCode);
        }

        LocationHistory location = locations.get(0);
        location.setIsFavorite(false);
        return locationHistoryRepository.save(location);
    }

    /**
     * Delete location from history
     */
    public void deleteFromHistory(String userId, String cityName, String countryCode) {
        List<LocationHistory> locations = locationHistoryRepository
                .findByUserIdAndCityNameAndCountryCode(userId, cityName, countryCode);

        if (!locations.isEmpty()) {
            locationHistoryRepository.deleteAll(locations);
        }
    }

    /**
     * Clear all location history for user
     */
    public void clearLocationHistory(String userId) {
        List<LocationHistory> history = locationHistoryRepository.findByUserId(userId);
        locationHistoryRepository.deleteAll(history);
    }

    /**
     * Get popular/trending locations (locations searched by many users)
     */
    public List<LocationDto> getPopularLocations(int limit) {
        // This would require aggregation to count searches by location
        // For now, return some popular cities
        List<LocationDto> popularCities = new ArrayList<>();

        // Add some popular cities manually (in real app, this would come from aggregated data)
        popularCities.add(createLocationDto("New York", "US", 40.7128, -74.0060, "New York"));
        popularCities.add(createLocationDto("London", "GB", 51.5074, -0.1278, "England"));
        popularCities.add(createLocationDto("Tokyo", "JP", 35.6762, 139.6503, "Tokyo"));
        popularCities.add(createLocationDto("Paris", "FR", 48.8566, 2.3522, "Île-de-France"));
        popularCities.add(createLocationDto("Sydney", "AU", -33.8688, 151.2093, "New South Wales"));

        return popularCities.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Validate coordinates
     */
    public boolean isValidCoordinates(double latitude, double longitude) {
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in km
    }

    /**
     * Get nearby cities within specified radius
     */
    public List<LocationDto> getNearbyCities(double latitude, double longitude, double radiusKm) {
        if (!isValidCoordinates(latitude, longitude)) {
            throw new InvalidRequestException("Invalid coordinates");
        }

        // Get all unique locations from history and filter by distance
        List<LocationHistory> allLocations = locationHistoryRepository.findAll();
        List<LocationDto> nearbyCities = new ArrayList<>();

        for (LocationHistory location : allLocations) {
            double distance = calculateDistance(latitude, longitude,
                    location.getLatitude(), location.getLongitude());

            if (distance <= radiusKm) {
                LocationDto dto = convertToLocationDto(location);
                dto.setDistanceKm(distance);
                nearbyCities.add(dto);
            }
        }

        // Sort by distance and remove duplicates
        return nearbyCities.stream()
                .distinct()
                .sorted((l1, l2) -> Double.compare(l1.getDistanceKm(), l2.getDistanceKm()))
                .collect(Collectors.toList());
    }

    // Helper methods

    private LocationDto convertToLocationDto(LocationHistory history) {
        LocationDto dto = new LocationDto();
        dto.setCityName(history.getCityName());
        dto.setCountryCode(history.getCountryCode());
        dto.setState(history.getState());
        dto.setLatitude(history.getLatitude());
        dto.setLongitude(history.getLongitude());
        dto.setDisplayName(history.getDisplayName());
        dto.setIsFavorite(history.getIsFavorite());
        dto.setLastSearched(history.getSearchedAt());
        return dto;
    }

    private LocationDto createLocationDto(String cityName, String countryCode,
                                          double latitude, double longitude, String state) {
        LocationDto dto = new LocationDto();
        dto.setCityName(cityName);
        dto.setCountryCode(countryCode);
        dto.setState(state);
        dto.setLatitude(latitude);
        dto.setLongitude(longitude);

        String displayName = cityName;
        if (state != null && !state.isEmpty()) {
            displayName += ", " + state;
        }
        displayName += ", " + countryCode;
        dto.setDisplayName(displayName);

        return dto;
    }

    private void cleanupLocationHistory(String userId) {
        List<LocationHistory> allHistory = locationHistoryRepository
                .findByUserIdOrderBySearchedAtDesc(userId);

        if (allHistory.size() > MAX_LOCATION_HISTORY) {
            List<LocationHistory> toDelete = allHistory.subList(MAX_LOCATION_HISTORY, allHistory.size());
            locationHistoryRepository.deleteAll(toDelete);
        }
    }
}