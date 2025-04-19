package com.example.weatherapp.repository;


import com.example.weatherapp.model.SavedLocation;
import com.example.weatherapp.model.User;
import com.example.weatherapp.model.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, Long> {
    List<WeatherAlert> findByUser(User user);
    List<WeatherAlert> findByUserAndIsActiveTrue(User user);
    List<WeatherAlert> findByUserAndIsReadFalse(User user);
    List<WeatherAlert> findByLocation(SavedLocation location);
    List<WeatherAlert> findByEndTimeBefore(LocalDateTime date);
}