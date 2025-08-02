package com.example.weatherapp.controller;

import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/{userId}/history")
    public ResponseEntity<List<LocationHistory>> getHistory(@PathVariable String userId) {
        return ResponseEntity.ok(locationService.getSearchHistory(userId));
    }

    @PostMapping("/{userId}/history")
    public ResponseEntity<Void> saveSearch(@PathVariable String userId, @RequestBody String city) {
        // Assuming the city is sent as a plain string in the body
        locationService.saveSearchHistory(userId, city);
        return ResponseEntity.ok().build();
    }
}