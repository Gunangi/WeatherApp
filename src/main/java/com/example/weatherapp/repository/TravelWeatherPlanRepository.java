package com.example.weatherapp.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TravelWeatherPlanRepository extends MongoRepository<TravelWeatherPlan, String> {

    List<TravelWeatherPlan> findByUserIdOrderByCreatedAtDesc(String userId);

    List<TravelWeatherPlan> findByUserIdAndIsActiveTrue(String userId);

    List<TravelWeatherPlan> findByUserIdAndStartDateGreaterThanEqual(String userId, LocalDate date);

    List<TravelWeatherPlan> findByUserIdAndEndDateLessThanEqual(String userId, LocalDate date);
}
