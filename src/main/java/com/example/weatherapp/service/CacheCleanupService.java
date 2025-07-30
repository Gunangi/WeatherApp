package com.example.weatherapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class CacheCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(CacheCleanupService.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String WEATHER_CACHE_PREFIX = "weather:";
    private static final String FORECAST_CACHE_PREFIX = "forecast:";
    private static final String AIR_QUALITY_CACHE_PREFIX = "air_quality:";
    private static final String USER_PREFERENCES_PREFIX = "user_prefs:";
    private static final String LOCATION_CACHE_PREFIX = "location:";
    private static final String ANALYTICS_CACHE_PREFIX = "analytics:";

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanupExpiredCache() {
        logger.info("Starting scheduled cache cleanup at {}", LocalDateTime.now());

        try {
            cleanupWeatherCache();
            cleanupForecastCache();
            cleanupAirQualityCache();
            cleanupLocationCache();
            cleanupAnalyticsCache();

            logger.info("Cache cleanup completed successfully");
        } catch (Exception e) {
            logger.error("Error during cache cleanup: {}", e.getMessage(), e);
        }
    }

    // Run every 6 hours for deep cleanup
    @Scheduled(fixedRate = 21600000)
    public void deepCleanupCache() {
        logger.info("Starting deep cache cleanup at {}", LocalDateTime.now());

        try {
            cleanupOrphanedKeys();
            compactMemory();
            generateCacheReport();

            logger.info("Deep cache cleanup completed successfully");
        } catch (Exception e) {
            logger.error("Error during deep cache cleanup: {}", e.getMessage(), e);
        }
    }

    // Run daily at 2 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void dailyCacheMaintenanceTask() {
        logger.info("Starting daily cache maintenance at {}", LocalDateTime.now());

        try {
            cleanupUserPreferencesCache();
            optimizeCacheKeys();
            resetCacheStatistics();

            logger.info("Daily cache maintenance completed successfully");
        } catch (Exception e) {
            logger.error("Error during daily cache maintenance: {}", e.getMessage(), e);
        }
    }

    private void cleanupWeatherCache() {
        Set<String> weatherKeys = redisTemplate.keys(WEATHER_CACHE_PREFIX + "*");
        if (weatherKeys != null && !weatherKeys.isEmpty()) {
            int cleaned = 0;
            for (String key : weatherKeys) {
                Long ttl = redisTemplate.getExpire(key);
                if (ttl != null && ttl <= 0) {
                    redisTemplate.delete(key);
                    cleaned++;
                }
            }
            logger.debug("Cleaned {} expired weather cache entries", cleaned);
        }
    }

    private void cleanupForecastCache() {
        Set<String> forecastKeys = redisTemplate.keys(FORECAST_CACHE_PREFIX + "*");
        if (forecastKeys != null && !forecastKeys.isEmpty()) {
            int cleaned = 0;
            for (String key : forecastKeys) {
                Long ttl = redisTemplate.getExpire(key);
                if (ttl != null && ttl <= 0) {
                    redisTemplate.delete(key);
                    cleaned++;
                }
            }
            logger.debug("Cleaned {} expired forecast cache entries", cleaned);
        }
    }

    private void cleanupAirQualityCache() {
        Set<String> airQualityKeys = redisTemplate.keys(AIR_QUALITY_CACHE_PREFIX + "*");
        if (airQualityKeys != null && !airQualityKeys.isEmpty()) {
            int cleaned = 0;
            for (String key : airQualityKeys) {
                Long ttl = redisTemplate.getExpire(key);
                if (ttl != null && ttl <= 0) {
                    redisTemplate.delete(key);
                    cleaned++;
                }
            }
            logger.debug("Cleaned {} expired air quality cache entries", cleaned);
        }
    }

    private void cleanupLocationCache() {
        Set<String> locationKeys = redisTemplate.keys(LOCATION_CACHE_PREFIX + "*");
        if (locationKeys != null && !locationKeys.isEmpty()) {
            int cleaned = 0;
            for (String key : locationKeys) {
                Long ttl = redisTemplate.getExpire(key);
                // Location cache should expire after 24 hours
                if (ttl != null && ttl <= 0) {
                    redisTemplate.delete(key);
                    cleaned++;
                } else if (ttl != null && ttl > TimeUnit.DAYS.toSeconds(1)) {
                    redisTemplate.expire(key, Duration.ofDays(1));
                }
            }
            logger.debug("Cleaned {} expired location cache entries", cleaned);
        }
    }

    private void cleanupAnalyticsCache() {
        Set<String> analyticsKeys = redisTemplate.keys(ANALYTICS_CACHE_PREFIX + "*");
        if (analyticsKeys != null && !analyticsKeys.isEmpty()) {
            int cleaned = 0;
            for (String key : analyticsKeys) {
                Long ttl = redisTemplate.getExpire(key);
                // Analytics cache should expire after 7 days
                if (ttl != null && ttl <= 0) {
                    redisTemplate.delete(key);
                    cleaned++;
                } else if (ttl != null && ttl > TimeUnit.DAYS.toSeconds(7)) {
                    redisTemplate.expire(key, Duration.ofDays(7));
                }
            }
            logger.debug("Cleaned {} expired analytics cache entries", cleaned);
        }
    }

    private void cleanupUserPreferencesCache() {
        Set<String> userPrefKeys = redisTemplate.keys(USER_PREFERENCES_PREFIX + "*");
        if (userPrefKeys != null && !userPrefKeys.isEmpty()) {
            int cleaned = 0;
            for (String key : userPrefKeys) {
                Long ttl = redisTemplate.getExpire(key);
                // User preferences should expire after 30 days of inactivity
                if (ttl != null && ttl <= 0) {
                    redisTemplate.delete(key);
                    cleaned++;
                } else if (ttl != null && ttl > TimeUnit.DAYS.toSeconds(30)) {
                    redisTemplate.expire(key, Duration.ofDays(30));
                }
            }
            logger.debug("Cleaned {} expired user preference cache entries", cleaned);
        }
    }

    private void cleanupOrphanedKeys() {
        Set<String> allKeys = redisTemplate.keys("*");
        if (allKeys != null && !allKeys.isEmpty()) {
            int orphaned = 0;
            for (String key : allKeys) {
                // Check for keys without proper prefixes or malformed keys
                if (!hasValidPrefix(key)) {
                    redisTemplate.delete(key);
                    orphaned++;
                }
            }
            logger.debug("Cleaned {} orphaned cache keys", orphaned);
        }
    }

    private boolean hasValidPrefix(String key) {
        return key.startsWith(WEATHER_CACHE_PREFIX) ||
                key.startsWith(FORECAST_CACHE_PREFIX) ||
                key.startsWith(AIR_QUALITY_CACHE_PREFIX) ||
                key.startsWith(USER_PREFERENCES_PREFIX) ||
                key.startsWith(LOCATION_CACHE_PREFIX) ||
                key.startsWith(ANALYTICS_CACHE_PREFIX);
    }

    private void compactMemory() {
        try {
            // Trigger Redis memory optimization
            redisTemplate.execute(connection -> {
                connection.bgSave();
                return null;
            });
            logger.debug("Triggered Redis memory compaction");
        } catch (Exception e) {
            logger.warn("Could not trigger memory compaction: {}", e.getMessage());
        }
    }

    private void optimizeCacheKeys() {
        // Remove duplicate or similar keys
        Set<String> allKeys = redisTemplate.keys("*");
        if (allKeys != null) {
            logger.debug("Total cache keys before optimization: {}", allKeys.size());
            // Additional optimization logic can be added here
        }
    }

    private void resetCacheStatistics() {
        try {
            // Reset any cache statistics or counters
            redisTemplate.delete("cache:stats:*");
            logger.debug("Cache statistics reset");
        } catch (Exception e) {
            logger.warn("Could not reset cache statistics: {}", e.getMessage());
        }
    }

    private void generateCacheReport() {
        try {
            Set<String> allKeys = redisTemplate.keys("*");
            int totalKeys = allKeys != null ? allKeys.size() : 0;

            int weatherKeys = getKeyCount(WEATHER_CACHE_PREFIX);
            int forecastKeys = getKeyCount(FORECAST_CACHE_PREFIX);
            int airQualityKeys = getKeyCount(AIR_QUALITY_CACHE_PREFIX);
            int userPrefKeys = getKeyCount(USER_PREFERENCES_PREFIX);
            int locationKeys = getKeyCount(LOCATION_CACHE_PREFIX);
            int analyticsKeys = getKeyCount(ANALYTICS_CACHE_PREFIX);

            logger.info("Cache Report - Total: {}, Weather: {}, Forecast: {}, Air Quality: {}, User Prefs: {}, Location: {}, Analytics: {}",
                    totalKeys, weatherKeys, forecastKeys, airQualityKeys, userPrefKeys, locationKeys, analyticsKeys);

        } catch (Exception e) {
            logger.error("Error generating cache report: {}", e.getMessage());
        }
    }

    private int getKeyCount(String prefix) {
        Set<String> keys = redisTemplate.keys(prefix + "*");
        return keys != null ? keys.size() : 0;
    }

    public void manualCleanup(String keyPattern) {
        try {
            Set<String> keysToDelete = redisTemplate.keys(keyPattern);
            if (keysToDelete != null && !keysToDelete.isEmpty()) {
                redisTemplate.delete(keysToDelete);
                logger.info("Manually cleaned {} keys matching pattern: {}", keysToDelete.size(), keyPattern);
            }
        } catch (Exception e) {
            logger.error("Error during manual cleanup of pattern {}: {}", keyPattern, e.getMessage());
        }
    }

    public void clearAllCache() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushAll();
            logger.warn("All cache cleared manually");
        } catch (Exception e) {
            logger.error("Error clearing all cache: {}", e.getMessage());
        }
    }
}