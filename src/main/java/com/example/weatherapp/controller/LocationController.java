package com.example.weatherapp.controller;

import com.example.weatherapp.model.SavedLocation;
import com.example.weatherapp.model.User;
import com.example.weatherapp.service.SavedLocationService;
import com.example.weatherapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/location")
public class LocationController {

    private final SavedLocationService locationService;
    private final UserService userService;

    public LocationController(SavedLocationService locationService, UserService userService) {
        this.locationService = locationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<SavedLocation>> getUserLocations(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        List<SavedLocation> locations = locationService.getUserLocations(user);
        return ResponseEntity.ok(locations);
    }

    @PostMapping
    public ResponseEntity<SavedLocation> saveLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SavedLocation location) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        SavedLocation savedLocation = locationService.saveLocation(user, location);
        return ResponseEntity.ok(savedLocation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavedLocation> updateLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SavedLocation location) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        location.setId(id);
        SavedLocation updatedLocation = locationService.updateLocation(user, location);
        return ResponseEntity.ok(updatedLocation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        locationService.deleteLocation(user, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/default")
    public ResponseEntity<SavedLocation> setDefaultLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        SavedLocation defaultLocation = locationService.setDefaultLocation(user, id);
        return ResponseEntity.ok(defaultLocation);
    }

    @GetMapping("/default")
    public ResponseEntity<SavedLocation> getDefaultLocation(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        SavedLocation defaultLocation = locationService.getDefaultLocation(user);
        return ResponseEntity.ok(defaultLocation);
    }
}