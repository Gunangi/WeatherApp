package com.example.weatherapp.service;

import com.example.weatherapp.dto.UserSettingsDto;
import com.example.weatherapp.exception.UserNotFoundException;
import com.example.weatherapp.model.User;
import com.example.weatherapp.model.UserPreferences;
import com.example.weatherapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserSettingsDto getUserSettings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        UserPreferences prefs = user.getPreferences();
        UserSettingsDto dto = new UserSettingsDto();
        dto.setTheme(prefs.getTheme());
        dto.setTemperatureUnit(prefs.getTemperatureUnit());
        dto.setRainAlerts(prefs.isRainAlerts());
        dto.setTemperatureThreshold(prefs.getTemperatureThreshold());
        return dto;
    }

    public void updateUserSettings(String userId, UserSettingsDto settingsDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        UserPreferences prefs = user.getPreferences();
        if (prefs == null) {
            prefs = new UserPreferences();
        }
        prefs.setTheme(settingsDto.getTheme());
        prefs.setTemperatureUnit(settingsDto.getTemperatureUnit());
        prefs.setRainAlerts(settingsDto.isRainAlerts());
        prefs.setTemperatureThreshold(settingsDto.getTemperatureThreshold());

        user.setPreferences(prefs);
        userRepository.save(user);
    }
}