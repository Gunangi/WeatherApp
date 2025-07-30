// src/main/java/com/example/weatherapp/controller/LocationController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.dto.LocationSearchResult;
import com.example.weatherapp.model.FavoriteLocation;
import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:3000")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/search")
    public ResponseEntity<List<LocationSearchResult>> searchLocations(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<LocationSearchResult> results = locationService.searchLocations(query, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/reverse")
    public ResponseEntity<LocationSearchResult> reverseGeocode(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            LocationSearchResult result = locationService.reverseGeocode(lat, lon);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/favorites/{userId}")
    public ResponseEntity<List<FavoriteLocation>> getFavoriteLocations(@PathVariable String userId) {
        List<FavoriteLocation> favorites = locationService.getFavoriteLocations(userId);
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/favorites/{userId}")
    public ResponseEntity<FavoriteLocation> addToFavorites(
            @PathVariable String userId,
            @RequestBody @Valid LocationSearchResult location,
            @RequestParam(required = false) String nickname) {
        try {
            FavoriteLocation favorite = locationService.addToFavorites(userId, location, nickname);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/favorites/{userId}/{favoriteId}")
    public ResponseEntity<String> removeFromFavorites(
            @PathVariable String userId,
            @PathVariable String favoriteId) {
        try {
            locationService.removeFromFavorites(userId, favoriteId);
            return ResponseEntity.ok("{\"message\":\"Location removed from favorites\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to remove from favorites\"}");
        }
    }

    @PutMapping("/favorites/{userId}/{favoriteId}/default")
    public ResponseEntity<String> setDefaultLocation(
            @PathVariable String userId,
            @PathVariable String favoriteId) {
        try {
            locationService.setDefaultLocation(userId, favoriteId);
            return ResponseEntity.ok("{\"message\":\"Default location updated\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to set default location\"}");
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<LocationHistory>> getLocationHistory(@PathVariable String userId) {
        List<LocationHistory> history = locationService.getLocationHistory(userId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/history/{userId}")
    public ResponseEntity<String> saveToHistory(
            @PathVariable String userId,
            @RequestBody LocationSearchResult location,
            @RequestParam(defaultValue = "false") boolean isGpsDetected) {
        try {
            locationService.saveLocationToHistory(userId, location, isGpsDetected);
            return ResponseEntity.ok("{\"message\":\"Location saved to history\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to save to history\"}");
        }
    }

    @DeleteMapping("/history/{userId}")
    public ResponseEntity<String> clearLocationHistory(@PathVariable String userId) {
        try {
            locationService.clearLocationHistory(userId);
            return ResponseEntity.ok("{\"message\":\"Location history cleared\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to clear history\"}");
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<LocationSearchResult>> getNearbyLocations(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "50") int radiusKm) {
        try {
            List<LocationSearchResult> nearbyLocations = locationService.getNearbyLocations(lat, lon, radiusKm);
            return ResponseEntity.ok(nearbyLocations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validateLocation(@RequestParam String location) {
        try {
            boolean isValid = locationService.validateLocation(location);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }
}