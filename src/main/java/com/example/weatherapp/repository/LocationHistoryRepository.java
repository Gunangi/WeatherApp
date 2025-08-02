package com.example.weatherapp.repository;

import com.example.weatherapp.model.LocationHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LocationHistoryRepository extends MongoRepository<LocationHistory, String> {
    List<LocationHistory> findByUserIdOrderBySearchTimestampDesc(String userId);
}