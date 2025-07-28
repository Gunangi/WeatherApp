package com.example.weatherapp.service;

import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherPreferences;
import com.example.weatherapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection instead of @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        // In a real application, you would add logic here for password hashing
        // and validation (e.g., check if username or email already exists).
        return userRepository.save(user);
    }

    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }

    public Optional<WeatherPreferences> getUserPreferences(String userId) {
        return userRepository.findById(userId).map(User::getPreferences);
    }

    public Optional<User> updateUserPreferences(String userId, WeatherPreferences preferences) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPreferences(preferences);
            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }
}