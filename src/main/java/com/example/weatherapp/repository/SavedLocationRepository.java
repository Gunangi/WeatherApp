package com.example.weatherapp.repository;

import com.example.weatherapp.model.SavedLocation;
import com.example.weatherapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedLocationRepository extends JpaRepository<SavedLocation, Long> {
    List<SavedLocation> findByUser(User user);
    Optional<SavedLocation> findByUserAndIsDefaultTrue(User user);
}