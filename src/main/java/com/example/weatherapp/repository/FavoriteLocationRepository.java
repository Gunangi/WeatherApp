package com.example.weatherapp.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteLocationRepository extends MongoRepository<FavoriteLocation, String> {

    List<FavoriteLocation> findByUserIdOrderByAddedAtDesc(String userId);

    Optional<FavoriteLocation> findByUserIdAndIsDefaultTrue(String userId);

    Optional<FavoriteLocation> findByUserIdAndCityNameIgnoreCase(String userId, String cityName);

    List<FavoriteLocation> findByUserIdAndCityNameContainingIgnoreCase(String userId, String cityName);

    long countByUserId(String userId);

    boolean existsByUserIdAndCityNameIgnoreCase(String userId, String cityName);
}