package com.example.weatherapp.controller;

import com.example.weatherapp.dto.UserSettingsDto;
import com.example.weatherapp.model.User;
import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.service.UserService;
import com.example.weatherapp.exception.UserNotFoundException;
import com.example.weatherapp.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Email;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(
            @Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "User registered successfully",
                            "userId", savedUser.getId(),
                            "username", savedUser.getUsername()
                    ));
        } catch (InvalidRequestException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Registration failed"));
        }
    }

    /**
     * User login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestParam @NotBlank String username,
            @RequestParam @NotBlank String password) {
        try {
            Map<String, Object> loginResult = userService.authenticateUser(username, password);
            return ResponseEntity.ok(loginResult);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Login failed"));
        }
    }

    /**
     * Get user profile
     */
    @GetMapping("/{userId}/profile")
    public ResponseEntity<User> getUserProfile(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);
            // Remove sensitive information
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update user profile
     */
    @PutMapping("/{userId}/profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @PathVariable String userId,
            @Valid @RequestBody User updatedUser) {
        try {
            User user = userService.updateUserProfile(userId, updatedUser);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", user
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (InvalidRequestException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Profile update failed"));
        }
    }

    /**
     * Delete user account
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User account deleted successfully"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Account deletion failed"));
        }
    }

    /**
     * Get user preferences
     */
    @GetMapping("/{userId}/preferences")
    public ResponseEntity<UserPreferences> getUserPreferences(@PathVariable String userId) {
        try {
            UserPreferences preferences = userService.getUserPreferences(userId);
            return ResponseEntity.ok(preferences);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update user preferences
     */
    @PutMapping("/{userId}/preferences")
    public ResponseEntity<Map<String, Object>> updateUserPreferences(
            @PathVariable String userId,
            @Valid @RequestBody UserPreferences preferences) {
        try {
            UserPreferences updatedPreferences = userService.updateUserPreferences(userId, preferences);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Preferences updated successfully",
                    "preferences", updatedPreferences
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Preferences update failed"));
        }
    }

    /**
     * Get user's location history
     */
    @GetMapping("/{userId}/location-history")
    public ResponseEntity<List<LocationHistory>> getUserLocationHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<LocationHistory> history = userService.getUserLocationHistory(userId, limit);
            return ResponseEntity.ok(history);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add location to user's history
     */
    @PostMapping("/{userId}/location-history")
    public ResponseEntity<Map<String, Object>> addLocationToHistory(
            @PathVariable String userId,
            @RequestBody Map<String, String> locationData) {
        try {
            String city = locationData.get("city");
            String country = locationData.get("country");
            Double latitude = Double.valueOf(locationData.get("latitude"));
            Double longitude = Double.valueOf(locationData.get("longitude"));

            LocationHistory history = userService.addLocationToHistory(userId, city, country, latitude, longitude);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Location added to history",
                    "location", history
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to add location"));
        }
    }

    /**
     * Remove location from user's history
     */
    @DeleteMapping("/{userId}/location-history/{locationId}")
    public ResponseEntity<Map<String, Object>> removeLocationFromHistory(
            @PathVariable String userId,
            @PathVariable String locationId) {
        try {
            userService.removeLocationFromHistory(userId, locationId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Location removed from history"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User or location not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to remove location"));
        }
    }

    /**
     * Get user's favorite cities
     */
    @GetMapping("/{userId}/favorites")
    public ResponseEntity<List<String>> getUserFavoriteCities(@PathVariable String userId) {
        try {
            List<String> favorites = userService.getUserFavoriteCities(userId);
            return ResponseEntity.ok(favorites);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add city to user's favorites
     */
    @PostMapping("/{userId}/favorites")
    public ResponseEntity<Map<String, Object>> addCityToFavorites(
            @PathVariable String userId,
            @RequestBody Map<String, String> cityData) {
        try {
            String city = cityData.get("city");
            userService.addCityToFavorites(userId, city);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "City added to favorites"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to add favorite"));
        }
    }

    /**
     * Remove city from user's favorites
     */
    @DeleteMapping("/{userId}/favorites/{city}")
    public ResponseEntity<Map<String, Object>> removeCityFromFavorites(
            @PathVariable String userId,
            @PathVariable String city) {
        try {
            userService.removeCityFromFavorites(userId, city);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "City removed from favorites"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to remove favorite"));
        }
    }

    /**
     * Update user's notification settings
     */
    @PutMapping("/{userId}/notifications")
    public ResponseEntity<Map<String, Object>> updateNotificationSettings(
            @PathVariable String userId,
            @RequestBody Map<String, Object> notificationSettings) {
        try {
            userService.updateNotificationSettings(userId, notificationSettings);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification settings updated"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to update settings"));
        }
    }

    /**
     * Get user's notification settings
     */
    @GetMapping("/{userId}/notifications")
    public ResponseEntity<Map<String, Object>> getNotificationSettings(@PathVariable String userId) {
        try {
            Map<String, Object> settings = userService.getNotificationSettings(userId);
            return ResponseEntity.ok(settings);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Change user password
     */
    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable String userId,
            @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            userService.changePassword(userId, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password changed successfully"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (InvalidRequestException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Password change failed"));
        }
    }

    /**
     * Reset password request
     */
    @PostMapping("/password-reset-request")
    public ResponseEntity<Map<String, Object>> requestPasswordReset(
            @RequestParam @Email String email) {
        try {
            userService.requestPasswordReset(email);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset email sent"
            ));
        } catch (UserNotFoundException e) {
            // Don't reveal if email exists for security
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "If the email exists, a reset link has been sent"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to process request"));
        }
    }

    /**
     * Reset password with token
     */
    @PostMapping("/password-reset")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam @NotBlank String token,
            @RequestParam @NotBlank String newPassword) {
        try {
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset successfully"
            ));
        } catch (InvalidRequestException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Password reset failed"));
        }
    }

    /**
     * Get user dashboard data
     */
    @GetMapping("/{userId}/dashboard")
    public ResponseEntity<Map<String, Object>> getUserDashboard(@PathVariable String userId) {
        try {
            Map<String, Object> dashboardData = userService.getUserDashboard(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update user's theme preference
     */
    @PutMapping("/{userId}/theme")
    public ResponseEntity<Map<String, Object>> updateThemePreference(
            @PathVariable String userId,
            @RequestParam @NotBlank String theme) {
        try {
            userService.updateThemePreference(userId, theme);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Theme preference updated"
            ));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to update theme"));
        }
    }

    /**
     * Get user activity log
     */
    @GetMapping("/{userId}/activity")
    public ResponseEntity<List<Map<String, Object>>> getUserActivity(
            @PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<Map<String, Object>> activity = userService.getUserActivity(userId, limit);
            return ResponseEntity.ok(activity);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export user data
     */
    @GetMapping("/{userId}/export")
    public ResponseEntity<Map<String, Object>> exportUserData(@PathVariable String userId) {
        try {
            Map<String, Object> userData = userService.exportUserData(userId);
            return ResponseEntity.ok(userData);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "User Service",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}