// src/main/java/com/weatherapp/controller/UserController.java

package com.example.weatherapp.controller;

import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherPreferences;
import com.example.weatherapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users") // Base path for all endpoints in this controller
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/preferences")
    public ResponseEntity<WeatherPreferences> getUserPreferences(@PathVariable String userId) {
        return userService.getUserPreferences(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<User> updateUserPreferences(@PathVariable String userId, @RequestBody WeatherPreferences preferences) {
        return userService.updateUserPreferences(userId, preferences)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
