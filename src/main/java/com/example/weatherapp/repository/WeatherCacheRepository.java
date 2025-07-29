package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherCache;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherCacheRepository extends MongoRepository<WeatherCache, String> {

    /**
     * Find valid (non-expired) cache entry by key and data type
     */
    @Query("{ 'cacheKey': ?0, 'dataType': ?1, 'expiresAt': { $gte: ?2 } }")
    Optional<WeatherCache> findValidCacheEntry(String cacheKey, String dataType, LocalDateTime now);

    /**
     * Find all cache entries for a specific location
     */
    List<WeatherCache> findByLocationId(String locationId);

    /**
     * Find all expired cache entries
     */
    @Query("{ 'expiresAt': { $lt: ?0 } }")
    List<WeatherCache> findExpiredEntries(LocalDateTime now);

    /**
     * Find cache entries by data type
     */
    List<WeatherCache> findByDataType(String dataType);

    /**
     * Find most accessed cache entries
     */
    @Query("{ 'expiresAt': { $gte: ?0 } }")
    List<WeatherCache> findValidEntriesOrderByAccessCount(LocalDateTime now);

    /**
     * Delete expired cache entries
     */
    @Query(value = "{ 'expiresAt': { $lt: ?0 } }", delete = true)
    long deleteExpiredEntries(LocalDateTime now);

    /**
     * Delete all cache entries for a location
     */
    long deleteByLocationId(String locationId);

    /**
     * Count valid cache entries
     */
    @Query(value = "{ 'expiresAt': { $gte: ?0 } }", count = true)
    long countValidEntries(LocalDateTime now);

    /**
     * Count expired cache entries
     */
    @Query(value = "{ 'expiresAt': { $lt: ?0 } }", count = true)
    long countExpiredEntries(LocalDateTime now);
}
