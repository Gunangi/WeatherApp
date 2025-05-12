package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherReportRepository extends MongoRepository<WeatherReport, String> {
    // Find reports by location, sorted by creation time (most recent first)
    List<WeatherReport> findByLocationOrderByCreatedAtDesc(String location);

    // Find reports by user ID, sorted by creation time (most recent first)
    List<WeatherReport> findByUserIdOrderByCreatedAtDesc(String userId);

    // Geospatial query to find nearby reports within a given radius
    @Query("{ 'location_coordinates': { " +
            "$near: { " +
            "   $geometry: { " +
            "       type: 'Point', " +
            "       coordinates: [?0, ?1] " +
            "   }, " +
            "   $maxDistance: ?2 " +
            "} " +
            "}}")
    List<WeatherReport> findNearbyReports(double longitude, double latitude, double radius);
}