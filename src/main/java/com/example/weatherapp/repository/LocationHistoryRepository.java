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

    /**
     * Find all location history for a specific user, ordered by most recent
     */
    List<LocationHistory> findByUserIdOrderByLastAccessedDesc(String userId);

    /**
     * Find recent location history for a user (limit results)
     */
    @Query("{'userId': ?0}")
    List<LocationHistory> findTop10ByUserIdOrderByLastAccessedDesc(String userId);

    /**
     * Find a specific location in user's history
     */
    Optional<LocationHistory> findByUserIdAndLocation(String userId, String location);

    /**
     * Find location history by coordinates
     */
    @Query("{'userId': ?0, 'coordinates.latitude': ?1, 'coordinates.longitude': ?2}")
    Optional<LocationHistory> findByUserIdAndCoordinates(String userId, Double latitude, Double longitude);

    /**
     * Find favorite locations for a user
     */
    List<LocationHistory> findByUserIdAndIsFavoriteOrderByLastAccessedDesc(String userId, Boolean isFavorite);

    /**
     * Find frequently accessed locations (by access count)
     */
    @Query("{'userId': ?0, 'accessCount': {$gte: ?1}}")
    List<LocationHistory> findFrequentLocations(String userId, Integer minAccessCount);

    /**
     * Find locations accessed within a date range
     */
    List<LocationHistory> findByUserIdAndLastAccessedBetweenOrderByLastAccessedDesc(
            String userId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find locations by search query (partial match)
     */
    @Query("{'userId': ?0, 'location': {$regex: ?1, $options: 'i'}}")
    List<LocationHistory> findByUserIdAndLocationContaining(String userId, String searchQuery);

    /**
     * Find locations by country
     */
    List<LocationHistory> findByUserIdAndCountryOrderByLastAccessedDesc(String userId, String country);

    /**
     * Find locations by state/region
     */
    List<LocationHistory> findByUserIdAndStateOrderByLastAccessedDesc(String userId, String state);

    /**
     * Find locations by city
     */
    List<LocationHistory> findByUserIdAndCityOrderByLastAccessedDesc(String userId, String city);

    /**
     * Find all unique countries in user's history
     */
    @Query(value = "{'userId': ?0}", fields = "{'country': 1}")
    List<LocationHistory> findDistinctCountriesByUserId(String userId);

    /**
     * Find recently added locations
     */
    List<LocationHistory> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find locations with specific timezone
     */
    List<LocationHistory> findByUserIdAndTimezoneOrderByLastAccessedDesc(String userId, String timezone);

    /**
     * Count total locations for a user
     */
    long countByUserId(String userId);

    /**
     * Count favorite locations for a user
     */
    long countByUserIdAndIsFavorite(String userId, Boolean isFavorite);

    /**
     * Find most frequently accessed location for a user
     */
    Optional<LocationHistory> findTopByUserIdOrderByAccessCountDesc(String userId);

    /**
     * Find locations accessed more than N times
     */
    @Query("{'userId': ?0, 'accessCount': {$gt: ?1}}")
    List<LocationHistory> findPopularLocations(String userId, Integer accessThreshold);

    /**
     * Delete old location history entries
     */
    void deleteByUserIdAndLastAccessedBefore(String userId, LocalDateTime cutoffDate);

    /**
     * Delete non-favorite locations with low access count
     */
    @Query(value = "{'userId': ?0, 'isFavorite': false, 'accessCount': {$lt: ?1}}", delete = true)
    void deleteUnpopularLocations(String userId, Integer accessThreshold);

    /**
     * Find locations within a radius of given coordinates
     */
    @Query("{'userId': ?0, " +
            "'coordinates.latitude': {$gte: ?1, $lte: ?2}, " +
            "'coordinates.longitude': {$gte: ?3, $lte: ?4}}")
    List<LocationHistory> findNearbyLocations(
            String userId,
            Double minLat,
            Double maxLat,
            Double minLon,
            Double maxLon
    );

    /**
     * Update access count and last accessed time
     */
    @Query("{'userId': ?0, 'location': ?1}")
    Optional<LocationHistory> findForUpdate(String userId, String location);

    /**
     * Find locations with notes/descriptions
     */
    @Query("{'userId': ?0, 'notes': {$exists: true, $ne: null, $ne: ''}}")
    List<LocationHistory> findLocationsWithNotes(String userId);

    /**
     * Check if location exists in user's history
     */
    boolean existsByUserIdAndLocation(String userId, String location);

    /**
     * Find locations by custom tags
     */
    @Query("{'userId': ?0, 'tags': {$in: [?1]}}")
    List<LocationHistory> findByUserIdAndTag(String userId, String tag);

    /**
     * Find all tags used by a user
     */
    @Query(value = "{'userId': ?0, 'tags': {$exists: true, $ne: []}}",
            fields = "{'tags': 1}")
    List<LocationHistory> findUserTags(String userId);
}