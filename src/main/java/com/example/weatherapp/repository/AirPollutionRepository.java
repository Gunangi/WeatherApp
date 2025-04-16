package com.example.weatherapp.repository;

import com.example.weatherapp.model.AirPollutionData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AirPollutionRepository extends MongoRepository<AirPollutionData, String> {
    List<AirPollutionData> findByLatitudeAndLongitude(double latitude, double longitude);
}
