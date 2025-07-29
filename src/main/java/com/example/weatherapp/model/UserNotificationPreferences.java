package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNotificationPreferences {
    private boolean enablePushNotifications;
    private boolean enableEmailNotifications;
    private boolean enableSMSNotifications;

    private boolean dailyWeatherSummary;
    private LocalTime dailySummaryTime;

    private boolean severWeatherAlerts;
    private boolean rainAlerts;
    private boolean temperatureAlerts;
    private boolean airQualityAlerts;

    private List<String> quietHours; // ["22:00", "07:00"]
    private List<String> preferredContactMethods;

    private boolean locationBasedAlerts;
    private double locationRadius; // in kilometers
}
