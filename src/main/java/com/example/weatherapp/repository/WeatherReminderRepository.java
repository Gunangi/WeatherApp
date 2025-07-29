package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherReminder;
import com.example.weatherapp.model.ReminderType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface WeatherReminderRepository extends MongoRepository<WeatherReminder, String> {

    List<WeatherReminder> findByUserIdAndIsActiveTrue(String userId);

    List<WeatherReminder> findByIsActiveTrueAndScheduledTime(LocalTime scheduledTime);

    List<WeatherReminder> findByReminderTypeAndIsActiveTrue(ReminderType reminderType);

    List<WeatherReminder> findByUserIdAndLocationId(String userId, String locationId);
}