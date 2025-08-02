// src/main/java/com/example/weatherapp/controller/FavoritesController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.dto.FavoriteLocationDto;
import com.example.weatherapp.service.FavoriteLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoritesController {

    private final FavoriteLocationService favoriteLocationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<FavoriteLocationDto>> getFavoriteLocations(@PathVariable String userId) {
        return ResponseEntity.ok(favoriteLocationService.getFavoriteLocations(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<FavoriteLocationDto> addFavoriteLocation(
            @PathVariable String userId,
            @RequestBody FavoriteLocationDto locationDto) {
        return ResponseEntity.ok(favoriteLocationService.addFavoriteLocation(userId, locationDto));
    }

    @DeleteMapping("/{userId}/{locationId}")
    public ResponseEntity<Void> removeFavoriteLocation(
            @PathVariable String userId,
            @PathVariable String locationId) {
        favoriteLocationService.removeFavoriteLocation(userId, locationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/{locationId}")
    public ResponseEntity<FavoriteLocationDto> updateFavoriteLocation(
            @PathVariable String userId,
            @PathVariable String locationId,
            @RequestBody FavoriteLocationDto locationDto) {
        return ResponseEntity.ok(favoriteLocationService.updateFavoriteLocation(userId, locationId, locationDto));
    }

    @GetMapping("/{userId}/weather")
    public ResponseEntity<List<FavoriteLocationDto>> getFavoriteLocationsWithWeather(@PathVariable String userId) {
        return ResponseEntity.ok(favoriteLocationService.getFavoriteLocationsWithWeather(userId));
    }
}