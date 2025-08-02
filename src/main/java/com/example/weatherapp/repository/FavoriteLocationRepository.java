// src/main/java/com/example/weatherapp/repository/FavoriteLocationRepository.java
package com.example.weatherapp.repository;

import com.example.weatherapp.model.FavoriteLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteLocationRepository extends MongoRepository<FavoriteLocation, String> {
    List<FavoriteLocation> findByUserIdOrderByOrderIndexAsc(String userId);
    Optional<FavoriteLocation> findByUserIdAndCityIgnoreCase(String userId, String city);
    Optional<FavoriteLocation> findByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
    void deleteByUserId(String userId);
}