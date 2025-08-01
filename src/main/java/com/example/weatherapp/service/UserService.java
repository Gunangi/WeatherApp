package com.example.weatherapp.service;

import com.example.weatherapp.model.User;
import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.model.LocationHistory;
import com.example.weatherapp.repository.UserRepository;
import com.example.weatherapp.repository.LocationHistoryRepository;
import com.example.weatherapp.dto.UserSettingsDto;
import com.example.weatherapp.exception.UserNotFoundException;
import com.example.weatherapp.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new user with default preferences
     */
    public User createUser(String email, String password, String firstName, String lastName) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new InvalidRequestException("User with email " + email + " already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);

        // Set default preferences
        UserPreferences defaultPreferences = new UserPreferences();
        defaultPreferences.setTemperatureUnit("CELSIUS");
        defaultPreferences.setWindSpeedUnit("MPS");
        defaultPreferences.setPressureUnit("HPA");
        defaultPreferences.setTimeFormat("24H");
        defaultPreferences.setTheme("LIGHT");
        defaultPreferences.setNotificationsEnabled(true);
        defaultPreferences.setSevereWeatherAlerts(true);
        defaultPreferences.setRainAlerts(false);
        defaultPreferences.setTemperatureThresholdAlerts(false);
        defaultPreferences.setMinTemperatureThreshold(0.0);
        defaultPreferences.setMaxTemperatureThreshold(35.0);

        user.setPreferences(defaultPreferences);
        user.setFavoriteCities(new HashSet<>());

        return userRepository.save(user);
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find user by ID
     */
    public User findById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
    }

    /**
     * Update user profile information
     */
    public User updateProfile(String userId, String firstName, String lastName) {
        User user = findById(userId);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Update user preferences
     */
    public User updatePreferences(String userId, UserSettingsDto settingsDto) {
        User user = findById(userId);
        UserPreferences preferences = user.getPreferences();

        if (preferences == null) {
            preferences = new UserPreferences();
        }

        // Update temperature unit
        if (settingsDto.getTemperatureUnit() != null) {
            preferences.setTemperatureUnit(settingsDto.getTemperatureUnit());
        }

        // Update wind speed unit
        if (settingsDto.getWindSpeedUnit() != null) {
            preferences.setWindSpeedUnit(settingsDto.getWindSpeedUnit());
        }

        // Update pressure unit
        if (settingsDto.getPressureUnit() != null) {
            preferences.setPressureUnit(settingsDto.getPressureUnit());
        }

        // Update time format
        if (settingsDto.getTimeFormat() != null) {
            preferences.setTimeFormat(settingsDto.getTimeFormat());
        }

        // Update theme
        if (settingsDto.getTheme() != null) {
            preferences.setTheme(settingsDto.getTheme());
        }

        // Update notification settings
        if (settingsDto.getNotificationsEnabled() != null) {
            preferences.setNotificationsEnabled(settingsDto.getNotificationsEnabled());
        }

        if (settingsDto.getSevereWeatherAlerts() != null) {
            preferences.setSevereWeatherAlerts(settingsDto.getSevereWeatherAlerts());
        }

        if (settingsDto.getRainAlerts() != null) {
            preferences.setRainAlerts(settingsDto.getRainAlerts());
        }

        if (settingsDto.getTemperatureThresholdAlerts() != null) {
            preferences.setTemperatureThresholdAlerts(settingsDto.getTemperatureThresholdAlerts());
        }

        if (settingsDto.getMinTemperatureThreshold() != null) {
            preferences.setMinTemperatureThreshold(settingsDto.getMinTemperatureThreshold());
        }

        if (settingsDto.getMaxTemperatureThreshold() != null) {
            preferences.setMaxTemperatureThreshold(settingsDto.getMaxTemperatureThreshold());
        }

        user.setPreferences(preferences);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Add city to user's favorites
     */
    public User addFavoriteCity(String userId, String cityName, String countryCode, double latitude, double longitude) {
        User user = findById(userId);
        Set<String> favoriteCities = user.getFavoriteCities();
        if (favoriteCities == null) {
            favoriteCities = new HashSet<>();
        }

        String cityKey = cityName + "," + countryCode;
        favoriteCities.add(cityKey);
        user.setFavoriteCities(favoriteCities);
        user.setUpdatedAt(LocalDateTime.now());

        // Also add to location history
        LocationHistory locationHistory = new LocationHistory();
        locationHistory.setUserId(userId);
        locationHistory.setCityName(cityName);
        locationHistory.setCountryCode(countryCode);
        locationHistory.setLatitude(latitude);
        locationHistory.setLongitude(longitude);
        locationHistory.setSearchedAt(LocalDateTime.now());
        locationHistory.setIsFavorite(true);
        locationHistoryRepository.save(locationHistory);

        return userRepository.save(user);
    }

    /**
     * Remove city from user's favorites
     */
    public User removeFavoriteCity(String userId, String cityName, String countryCode) {
        User user = findById(userId);
        Set<String> favoriteCities = user.getFavoriteCities();
        if (favoriteCities != null) {
            String cityKey = cityName + "," + countryCode;
            favoriteCities.remove(cityKey);
            user.setFavoriteCities(favoriteCities);
            user.setUpdatedAt(LocalDateTime.now());

            // Update location history
            List<LocationHistory> histories = locationHistoryRepository.findByUserIdAndCityNameAndCountryCode(
                    userId, cityName, countryCode);
            for (LocationHistory history : histories) {
                history.setIsFavorite(false);
                locationHistoryRepository.save(history);
            }
        }
        return userRepository.save(user);
    }

    /**
     * Get user's favorite cities
     */
    public Set<String> getFavoriteCities(String userId) {
        User user = findById(userId);
        return user.getFavoriteCities() != null ? user.getFavoriteCities() : new HashSet<>();
    }

    /**
     * Get user's location history
     */
    public List<LocationHistory> getLocationHistory(String userId) {
        findById(userId); // Validate user exists
        return locationHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
    }

    /**
     * Get user's favorite locations from history
     */
    public List<LocationHistory> getFavoriteLocations(String userId) {
        findById(userId); // Validate user exists
        return locationHistoryRepository.findByUserIdAndIsFavoriteOrderBySearchedAtDesc(userId, true);
    }

    /**
     * Update user's last login time
     */
    public void updateLastLogin(String userId) {
        User user = findById(userId);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Deactivate user account
     */
    public void deactivateUser(String userId) {
        User user = findById(userId);
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Change user password
     */
    public void changePassword(String userId, String oldPassword, String newPassword) {
        User user = findById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new InvalidRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Get all active users (admin function)
     */
    public List<User> getAllActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    /**
     * Get user statistics
     */
    public long getTotalUserCount() {
        return userRepository.count();
    }

    public long getActiveUserCount() {
        return userRepository.countByActiveTrue();
    }

    /**
     * Validate user credentials
     */
    public boolean validateCredentials(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.isActive() && passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }
}