package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherSearchHistory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherHistoryRepository extends MongoRepository<WeatherSearchHistory, String> {
    List<WeatherSearchHistory> findByUsername(String username, Sort sort);
    void deleteByUsername(String username);
}