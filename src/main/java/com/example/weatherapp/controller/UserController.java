package com.example.weatherapp.controller;

import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherPreferences;
import com.example.weatherapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend
public class UserController {

    private final UserService userService;

    // Constructor injection instead of @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
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