package com.example.weatherapp.service;

import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherPreferences;
import com.example.weatherapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WeatherPreferencesRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;



    // Constructor injection instead of @Autowired
    public UserService(UserRepository userRepository,
                       WeatherPreferencesRepository preferenceRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // Check if username is already taken
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        // Check if email is already in use
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Create default weather preferences
        User savedUser = userRepository.save(user);

        WeatherPreferences defaultPreference = new WeatherPreferences();
        defaultPreference.setUserId(savedUser.getId());
        defaultPreference.setTemperatureUnit("celsius");
        defaultPreference.setWindSpeedUnit("m/s");
        defaultPreference.setTimeFormat("24h");
        defaultPreference.setTheme("system");
        defaultPreference.setNotificationsEnabled(false);
        defaultPreference.setForecastDays(5);

        preferenceRepository.save(defaultPreference);

        return savedUser;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(String userId, User userDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());

        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    public boolean changePassword(String username, String currentPassword, String newPassword) {
        Optional<User> userOptional = findByUsername(username);
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();
        // Check if current password matches
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    public Optional<WeatherPreferences> getUserPreferences(String username) {
        Optional<User> userOptional = findByUsername(username);
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        String userId = userOptional.get().getId();
        return preferenceRepository.findByUserId(userId);
    }

    public WeatherPreferences updateUserPreferences(String username, WeatherPreferences preferences) {
        Optional<User> userOptional = findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        String userId = userOptional.get().getId();
        Optional<WeatherPreferences> existing = preferenceRepository.findByUserId(userId);

        if (existing.isPresent()) {
            WeatherPreferences existingPref = existing.get();
            existingPref.setTemperatureUnit(preferences.getTemperatureUnit());
            existingPref.setWindSpeedUnit(preferences.getWindSpeedUnit());
            existingPref.setTimeFormat(preferences.getTimeFormat());
            existingPref.setTheme(preferences.getTheme());
            existingPref.setDefaultLocation(preferences.getDefaultLocation());
            existingPref.setNotificationsEnabled(preferences.isNotificationsEnabled());
            existingPref.setForecastDays(preferences.getForecastDays());

            return preferenceRepository.save(existingPref);
        } else {
            preferences.setUserId(userId);
            return preferenceRepository.save(preferences);
        }
    }

    public void updateNotificationPreference(String username, boolean enabled) {
        Optional<User> userOptional = findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        user.setNotificationsEnabled(enabled);
        userRepository.save(user);

        // Also update the notification preference in the preferences object
        String userId = user.getId();
        Optional<WeatherPreferences> preferencesOptional = preferenceRepository.findByUserId(userId);

        if (preferencesOptional.isPresent()) {
            WeatherPreferences prefs = preferencesOptional.get();
            prefs.setNotificationsEnabled(enabled);
            preferenceRepository.save(prefs);
        }
    }

    public void updateLastLogin(String username) {
        Optional<User> userOptional = findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    public User authenticate(String username, String rawPassword) {
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isPresent() && passwordEncoder.matches(rawPassword, user.get().getPassword())) {
            return user.orElse(null);
        }

        return null;
    }
}
