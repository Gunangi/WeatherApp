package com.example.weatherapp.controller;

import com.example.weatherapp.dto.LocationDto;
import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired
    private LocationService locationService;

    /**
     * Search for locations by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<LocationDto>> searchLocations(
            @RequestParam String query,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<LocationDto> locations = locationService.searchLocations(query, limit);
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get coordinates from city name (geocoding)
     */
    @GetMapping("/geocode")
    public ResponseEntity<LocationDto> getCoordinates(@RequestParam String city) {
        try {
            LocationDto location = locationService.getCoordinatesByCity(city);
            return ResponseEntity.ok(location);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get city name from coordinates (reverse geocoding)
     */
    @GetMapping("/reverse-geocode")
    public ResponseEntity<LocationDto> getCityFromCoordinates(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            LocationDto location = locationService.getCityFromCoordinates(lat, lon);
            return ResponseEntity.ok(location);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get user's location history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<LocationHistory>> getLocationHistory(@PathVariable String userId) {
        try {
            List<LocationHistory> history = locationService.getLocationHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add location to user's history
     */
    @PostMapping("/history/{userId}")
    public ResponseEntity<LocationHistory> addToHistory(
            @PathVariable String userId,
            @Valid @RequestBody LocationDto locationDto) {
        try {
            LocationHistory savedLocation = locationService.addToHistory(userId, locationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLocation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove location from user's history
     */
    @DeleteMapping("/history/{userId}/{locationId}")
    public ResponseEntity<Void> removeFromHistory(
            @PathVariable String userId,
            @PathVariable String locationId) {
        try {
            locationService.removeFromHistory(userId, locationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user's favorite locations
     */
    @GetMapping("/favorites/{userId}")
    public ResponseEntity<List<LocationHistory>> getFavoriteLocations(@PathVariable String userId) {
        try {
            List<LocationHistory> favorites = locationService.getFavoriteLocations(userId);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add location to favorites
     */
    @PostMapping("/favorites/{userId}")
    public ResponseEntity<LocationHistory> addToFavorites(
            @PathVariable String userId,
            @Valid @RequestBody LocationDto locationDto) {
        try {
            LocationHistory favoriteLocation = locationService.addToFavorites(userId, locationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(favoriteLocation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove location from favorites
     */
    @DeleteMapping("/favorites/{userId}/{locationId}")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable String userId,
            @PathVariable String locationId) {
        try {
            locationService.removeFromFavorites(userId, locationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get nearby locations based on coordinates
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<LocationDto>> getNearbyLocations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") int radius) {
        try {
            List<LocationDto> nearbyLocations = locationService.getNearbyLocations(lat, lon, radius);
            return ResponseEntity.ok(nearbyLocations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validate location coordinates
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateLocation(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            boolean isValid = locationService.validateCoordinates(lat, lon);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}