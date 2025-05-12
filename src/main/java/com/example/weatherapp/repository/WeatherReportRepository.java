package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherReportRepository extends MongoRepository<WeatherReport, String> {
    List<WeatherReport> findByLocationOrderByCreatedAtDesc(String location);
    List<WeatherReport> findByUserIdOrderByCreatedAtDesc(String userId);

    // Add MongoDB geospatial query to find reports within radius
    @Query("{'location': {$near: {$geometry: {type: 'Point', coordinates: [?0, ?1]}, $maxDistance: ?2}}}")
    List<WeatherReport> findNearbyReports(double lon, double lat, double radius);
}