// src/main/java/com/example/weatherapp/service/UserService.java
package com.example.weatherapp.service;

import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherPreferences;
import com.example.weatherapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<WeatherPreferences> getUserPreferences(String userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return Optional.of(user.get().getPreferences());
        }
        return Optional.empty();
    }

    public boolean updateUserPreferences(String userId, WeatherPreferences preferences) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            User user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
            } else {
                // Create new user if not exists
                user = new User();
                user.setId(userId);
                user.setUsername("user_" + userId);
            }

            user.setPreferences(preferences);
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean createUser(String userId, WeatherPreferences preferences) {
        try {
            User user = new User();
            user.setId(userId);
            user.setUsername("user_" + userId);
            user.setPreferences(preferences);
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Optional<User> findUserById(String userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
