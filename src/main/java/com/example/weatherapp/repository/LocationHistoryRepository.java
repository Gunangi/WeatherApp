package com.example.weatherapp.repository;

import com.example.weatherapp.model.LocationHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationHistoryRepository extends MongoRepository<LocationHistory, String> {

    List<LocationHistory> findByUserIdOrderBySearchedAtDesc(String userId);

    List<LocationHistory> findTop10ByUserIdOrderBySearchCountDescSearchedAtDesc(String userId);

    Optional<LocationHistory> findByUserIdAndCityNameIgnoreCase(String userId, String cityName);

    @Query("{ 'userId': ?0, 'searchedAt': { $gte: ?1 } }")
    List<LocationHistory> findByUserIdAndSearchedAfter(String userId, LocalDateTime date);

    void deleteByUserIdAndSearchedAtBefore(String userId, LocalDateTime date);

    long countByUserId(String userId);
}