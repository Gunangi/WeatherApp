package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.repository.WeatherAlertRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final WeatherAlertRepository weatherAlertRepository;

    public List<WeatherAlert> getAlertsForCity(String city) {
        return weatherAlertRepository.findByCityIgnoreCase(city);
    }

    // In a real app, this would integrate with a push notification service (e.g., Firebase Cloud Messaging)
    public void sendPushNotification(String userId, String message) {
        System.out.println("Sending notification to user " + userId + ": " + message);
    }
}