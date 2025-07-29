package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherCache;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class WeatherCacheService {

    @Autowired
    private MongoTemplate mongoTemplate;

    private static final int DEFAULT_CACHE_MINUTES = 15;

    /**
     * Get cached weather data if it exists and is not expired
     */
    public Optional<String> getCachedWeatherData(String cacheKey, String dataType) {
        Query query = new Query();
        query.addCriteria(Criteria.where("cacheKey").is(cacheKey)
                .and("dataType").is(dataType)
                .and("expiresAt").gte(LocalDateTime.now()));

        WeatherCache cachedData = mongoTemplate.findOne(query, WeatherCache.class);

        if (cachedData != null) {
            // Increment access count
            cachedData.setAccessCount(cachedData.getAccessCount() + 1);
            mongoTemplate.save(cachedData);
            return Optional.of(cachedData.getWeatherData());
        }

        return Optional.empty();
    }

    /**
     * Cache weather data with expiration
     */
    public void cacheWeatherData(String cacheKey, String weatherData, String dataType, String locationId) {
        cacheWeatherData(cacheKey, weatherData, dataType, locationId, DEFAULT_CACHE_MINUTES);
    }

    /**
     * Cache weather data with custom expiration time
     */
    public void cacheWeatherData(String cacheKey, String weatherData, String dataType,
                                 String locationId, int expirationMinutes) {

        // Remove existing cache for this key
        removeCachedData(cacheKey, dataType);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(expirationMinutes);

        WeatherCache cache = WeatherCache.builder()
                .cacheKey(cacheKey)
                .weatherData(weatherData)
                .dataType(dataType)
                .locationId(locationId)
                .cachedAt(now)
                .expiresAt(expiresAt)
                .accessCount(0L)
                .build();

        mongoTemplate.save(cache);
    }

    /**
     * Remove specific cached data
     */
    public void removeCachedData(String cacheKey, String dataType) {
        Query query = new Query();
        query.addCriteria(Criteria.where("cacheKey").is(cacheKey)
                .and("dataType").is(dataType));

        mongoTemplate.remove(query, WeatherCache.class);
    }

    /**
     * Clear all expired cache entries
     */
    public long clearExpiredCache() {
        Query query = new Query();
        query.addCriteria(Criteria.where("expiresAt").lt(LocalDateTime.now()));

        return mongoTemplate.remove(query, WeatherCache.class).getDeletedCount();
    }

    /**
     * Clear all cache for a specific location
     */
    public long clearLocationCache(String locationId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("locationId").is(locationId));

        return mongoTemplate.remove(query, WeatherCache.class).getDeletedCount();
    }

    /**
     * Get cache statistics
     */
    public CacheStats getCacheStats() {
        long totalEntries = mongoTemplate.count(new Query(), WeatherCache.class);

        Query expiredQuery = new Query();
        expiredQuery.addCriteria(Criteria.where("expiresAt").lt(LocalDateTime.now()));
        long expiredEntries = mongoTemplate.count(expiredQuery, WeatherCache.class);

        Query validQuery = new Query();
        validQuery.addCriteria(Criteria.where("expiresAt").gte(LocalDateTime.now()));
        long validEntries = mongoTemplate.count(validQuery, WeatherCache.class);

        return CacheStats.builder()
                .totalEntries(totalEntries)
                .validEntries(validEntries)
                .expiredEntries(expiredEntries)
                .hitRate(calculateHitRate())
                .build();
    }

    private double calculateHitRate() {
        // This is a simplified hit rate calculation
        // In a real implementation, you'd track hits vs misses
        return 0.85; // Placeholder
    }

    /**
     * Generate cache key for weather data
     */
    public String generateCacheKey(String city, String dataType) {
        return String.format("%s_%s", city.toLowerCase().replaceAll("\\s+", "_"), dataType);
    }

    /**
     * Generate cache key for coordinate-based data
     */
    public String generateCacheKey(double lat, double lon, String dataType) {
        return String.format("%.4f_%.4f_%s", lat, lon, dataType);
    }

    // Inner class for cache statistics
    public static class CacheStats {
        private long totalEntries;
        private long validEntries;
        private long expiredEntries;
        private double hitRate;

        public static CacheStatsBuilder builder() {
            return new CacheStatsBuilder();
        }

        // Builder pattern implementation
        public static class CacheStatsBuilder {
            private CacheStats stats = new CacheStats();

            public CacheStatsBuilder totalEntries(long totalEntries) {
                stats.totalEntries = totalEntries;
                return this;
            }

            public CacheStatsBuilder validEntries(long validEntries) {
                stats.validEntries = validEntries;
                return this;
            }

            public CacheStatsBuilder expiredEntries(long expiredEntries) {
                stats.expiredEntries = expiredEntries;
                return this;
            }

            public CacheStatsBuilder hitRate(double hitRate) {
                stats.hitRate = hitRate;
                return this;
            }

            public CacheStats build() {
                return stats;
            }
        }

        // Getters
        public long getTotalEntries() { return totalEntries; }
        public long getValidEntries() { return validEntries; }
        public long getExpiredEntries() { return expiredEntries; }
        public double getHitRate() { return hitRate; }
    }
}