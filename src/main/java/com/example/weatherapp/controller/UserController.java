package com.example.weatherapp.controller;


import com.example.weatherapp.dto.UserPreferencesDTO;
import com.example.weatherapp.model.User;
import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/preferences")
    public ResponseEntity<UserPreferences> getUserPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user.getPreferences());
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreferences> updateUserPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserPreferencesDTO preferencesDTO) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        UserPreferences updatedPreferences = userService.updateUserPreferences(user, preferencesDTO);
        return ResponseEntity.ok(updatedPreferences);
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        // Remove sensitive information
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody User userUpdate) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        User updatedUser = userService.updateUserProfile(user, userUpdate);
        // Remove sensitive information
        updatedUser.setPassword(null);
        return ResponseEntity.ok(updatedUser);
    }
}
