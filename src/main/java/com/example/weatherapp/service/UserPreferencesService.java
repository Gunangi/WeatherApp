package com.example.weatherapp.service;

import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;

    @Autowired
    public UserPreferencesService(UserPreferencesRepository preferencesRepository) {
        this.preferencesRepository = preferencesRepository;
    }

    public UserPreferences getUserPreferences(String username) {
        return preferencesRepository.findByUsername(username)
                .orElseGet(() -> {
                    UserPreferences newPreferences = new UserPreferences(username);
                    return preferencesRepository.save(newPreferences);
                });
    }

    public UserPreferences updateUserPreferences(String username, UserPreferences updatedPreferences) {
        UserPreferences preferences = getUserPreferences(username);

        // Update only non-null fields
        if (updatedPreferences.getTemperatureUnit() != null) {
            preferences.setTemperatureUnit(updatedPreferences.getTemperatureUnit());
        }
        if (updatedPreferences.getWindSpeedUnit() != null) {
            preferences.setWindSpeedUnit(updatedPreferences.getWindSpeedUnit());
        }
        if (updatedPreferences.getTimeFormat() != null) {
            preferences.setTimeFormat(updatedPreferences.getTimeFormat());
        }
        if (updatedPreferences.getTheme() != null) {
            preferences.setTheme(updatedPreferences.getTheme());
        }
        if (updatedPreferences.getDefaultLocation() != null) {
            preferences.setDefaultLocation(updatedPreferences.getDefaultLocation());
        }

        preferences.setNotificationsEnabled(updatedPreferences.isNotificationsEnabled());

        if (updatedPreferences.getForecastDays() > 0) {
            preferences.setForecastDays(updatedPreferences.getForecastDays());
        }

        return preferencesRepository.save(preferences);
    }
}