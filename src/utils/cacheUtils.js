/**
 * Cache utilities for weather app
 * Implements Redis-like caching functionality with fallback to memory storage
 */

class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.defaultTTL = 300; // 5 minutes in seconds
        this.isRedisAvailable = false;
        this.redisClient = null;

        // Initialize Redis connection if available
        this.initializeRedis();
    }

    /**
     * Initialize Redis connection
     */
    async initializeRedis() {
        try {
            // In a real app, you would connect to Redis here
            // For demo purposes, we'll simulate Redis unavailability
            console.log('Attempting to connect to Redis...');
            this.isRedisAvailable = false;
            console.log('Redis not available, using memory cache');
        } catch (error) {
            console.error('Redis connection failed:', error);
            this.isRedisAvailable = false;
        }
    }

    /**
     * Generate cache key with prefix
     */
    generateKey(prefix, identifier) {
        return `weather_app:${prefix}:${identifier}`;
    }

    /**
     * Set cache entry with TTL
     */
    async set(key, value, ttl = this.defaultTTL) {
        const cacheKey = typeof key === 'string' ? key : this.generateKey(key.prefix, key.identifier);

        try {
            if (this.isRedisAvailable) {
                // Redis implementation
                await this.redisClient.setex(cacheKey, ttl, JSON.stringify(value));
            } else {
                // Memory cache implementation
                const expiresAt = Date.now() + (ttl * 1000);
                this.memoryCache.set(cacheKey, {
                    value: JSON.stringify(value),
                    expiresAt
                });

                // Clean up expired entries
                this.cleanExpiredEntries();
            }

            console.log(`Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
            return true;
        } catch (error) {
            console.error('Cache SET error:', error);
            return false;
        }
    }

    /**
     * Get cache entry
     */
    async get(key) {
        const cacheKey = typeof key === 'string' ? key : this.generateKey(key.prefix, key.identifier);

        try {
            if (this.isRedisAvailable) {
                // Redis implementation
                const value = await this.redisClient.get(cacheKey);
                return value ? JSON.parse(value) : null;
            } else {
                // Memory cache implementation
                const entry = this.memoryCache.get(cacheKey);

                if (!entry) {
                    return null;
                }

                if (Date.now() > entry.expiresAt) {
                    this.memoryCache.delete(cacheKey);
                    return null;
                }

                console.log(`Cache HIT: ${cacheKey}`);
                return JSON.parse(entry.value);
            }
        } catch (error) {
            console.error('Cache GET error:', error);
            return null;
        }
    }

    /**
     * Delete cache entry
     */
    async delete(key) {
        const cacheKey = typeof key === 'string' ? key : this.generateKey(key.prefix, key.identifier);

        try {
            if (this.isRedisAvailable) {
                await this.redisClient.del(cacheKey);
            } else {
                this.memoryCache.delete(cacheKey);
            }

            console.log(`Cache DELETE: ${cacheKey}`);
            return true;
        } catch (error) {
            console.error('Cache DELETE error:', error);
            return false;
        }
    }

    /**
     * Check if key exists in cache
     */
    async exists(key) {
        const cacheKey = typeof key === 'string' ? key : this.generateKey(key.prefix, key.identifier);

        try {
            if (this.isRedisAvailable) {
                return await this.redisClient.exists(cacheKey);
            } else {
                const entry = this.memoryCache.get(cacheKey);
                if (!entry) return false;

                if (Date.now() > entry.expiresAt) {
                    this.memoryCache.delete(cacheKey);
                    return false;
                }

                return true;
            }
        } catch (error) {
            console.error('Cache EXISTS error:', error);
            return false;
        }
    }

    /**
     * Clear all cache entries
     */
    async clear() {
        try {
            if (this.isRedisAvailable) {
                await this.redisClient.flushdb();
            } else {
                this.memoryCache.clear();
            }

            console.log('Cache cleared');
            return true;
        } catch (error) {
            console.error('Cache CLEAR error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        try {
            if (this.isRedisAvailable) {
                const info = await this.redisClient.info('memory');
                return {
                    type: 'redis',
                    info: info
                };
            } else {
                const totalEntries = this.memoryCache.size;
                let validEntries = 0;
                let expiredEntries = 0;

                for (const [key, entry] of this.memoryCache.entries()) {
                    if (Date.now() > entry.expiresAt) {
                        expiredEntries++;
                    } else {
                        validEntries++;
                    }
                }

                return {
                    type: 'memory',
                    totalEntries,
                    validEntries,
                    expiredEntries,
                    memoryUsage: this.getMemoryUsage()
                };
            }
        } catch (error) {
            console.error('Cache STATS error:', error);
            return null;
        }
    }

    /**
     * Clean expired entries from memory cache
     */
    cleanExpiredEntries() {
        if (this.isRedisAvailable) return;

        const now = Date.now();
        for (const [key, entry] of this.memoryCache.entries()) {
            if (now > entry.expiresAt) {
                this.memoryCache.delete(key);
            }
        }
    }

    /**
     * Estimate memory usage of cache
     */
    getMemoryUsage() {
        let totalSize = 0;
        for (const [key, entry] of this.memoryCache.entries()) {
            totalSize += key.length * 2; // Unicode characters are 2 bytes
            totalSize += entry.value.length * 2;
            totalSize += 8; // timestamp
        }
        return `${(totalSize / 1024).toFixed(2)} KB`;
    }

    /**
     * Set cache entry with automatic key generation for weather data
     */
    async setWeatherData(location, data, ttl = 600) {
        const key = this.generateKey('weather', location.toLowerCase().replace(/\s+/g, '_'));
        return await this.set(key, {
            ...data,
            cachedAt: Date.now(),
            location
        }, ttl);
    }

    /**
     * Get weather data from cache
     */
    async getWeatherData(location) {
        const key = this.generateKey('weather', location.toLowerCase().replace(/\s+/g, '_'));
        return await this.get(key);
    }

    /**
     * Set forecast data in cache
     */
    async setForecastData(location, data, ttl = 1800) {
        const key = this.generateKey('forecast', location.toLowerCase().replace(/\s+/g, '_'));
        return await this.set(key, {
            ...data,
            cachedAt: Date.now(),
            location
        }, ttl);
    }

    /**
     * Get forecast data from cache
     */
    async getForecastData(location) {
        const key = this.generateKey('forecast', location.toLowerCase().replace(/\s+/g, '_'));
        return await this.get(key);
    }

    /**
     * Set air quality data in cache
     */
    async setAirQualityData(location, data, ttl = 900) {
        const key = this.generateKey('air_quality', location.toLowerCase().replace(/\s+/g, '_'));
        return await this.set(key, {
            ...data,
            cachedAt: Date.now(),
            location
        }, ttl);
    }

    /**
     * Get air quality data from cache
     */
    async getAirQualityData(location) {
        const key = this.generateKey('air_quality', location.toLowerCase().replace(/\s+/g, '_'));
        return await this.get(key);
    }

    /**
     * Cache geocoding results
     */
    async setGeocodingData(query, data, ttl = 86400) { // 24 hours
        const key = this.generateKey('geocoding', query.toLowerCase().replace(/\s+/g, '_'));
        return await this.set(key, data, ttl);
    }

    /**
     * Get geocoding data from cache
     */
    async getGeocodingData(query) {
        const key = this.generateKey('geocoding', query.toLowerCase().replace(/\s+/g, '_'));
        return await this.get(key);
    }

    /**
     * Cache user preferences
     */
    async setUserPreferences(userId, preferences, ttl = 86400) {
        const key = this.generateKey('user_prefs', userId);
        return await this.set(key, preferences, ttl);
    }

    /**
     * Get user preferences from cache
     */
    async getUserPreferences(userId) {
        const key = this.generateKey('user_prefs', userId);
        return await this.get(key);
    }

    /**
     * Batch get multiple keys
     */
    async mget(keys) {
        const results = {};

        for (const key of keys) {
            results[key] = await this.get(key);
        }

        return results;
    }

    /**
     * Batch set multiple key-value pairs
     */
    async mset(keyValuePairs, ttl = this.defaultTTL) {
        const results = {};

        for (const [key, value] of Object.entries(keyValuePairs)) {
            results[key] = await this.set(key, value, ttl);
        }

        return results;
    }

    /**
     * Get keys matching a pattern
     */
    async keys(pattern) {
        try {
            if (this.isRedisAvailable) {
                return await this.redisClient.keys(pattern);
            } else {
                const keys = Array.from(this.memoryCache.keys());
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return keys.filter(key => regex.test(key));
            }
        } catch (error) {
            console.error('Cache KEYS error:', error);
            return [];
        }
    }

    /**
     * Increment a numeric value in cache
     */
    async incr(key, amount = 1) {
        try {
            const current = await this.get(key) || 0;
            const newValue = current + amount;
            await this.set(key, newValue);
            return newValue;
        } catch (error) {
            console.error('Cache INCR error:', error);
            return null;
        }
    }

    /**
     * Set expiration for an existing key
     */
    async expire(key, ttl) {
        try {
            const value = await this.get(key);
            if (value !== null) {
                return await this.set(key, value, ttl);
            }
            return false;
        } catch (error) {
            console.error('Cache EXPIRE error:', error);
            return false;
        }
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Helper functions for common cache operations
export const cache = {
    // Basic operations
    set: (key, value, ttl) => cacheManager.set(key, value, ttl),
    get: (key) => cacheManager.get(key),
    delete: (key) => cacheManager.delete(key),
    exists: (key) => cacheManager.exists(key),
    clear: () => cacheManager.clear(),

    // Weather-specific operations
    setWeather: (location, data, ttl) => cacheManager.setWeatherData(location, data, ttl),
    getWeather: (location) => cacheManager.getWeatherData(location),

    setForecast: (location, data, ttl) => cacheManager.setForecastData(location, data, ttl),
    getForecast: (location) => cacheManager.getForecastData(location),

    setAirQuality: (location, data, ttl) => cacheManager.setAirQualityData(location, data, ttl),
    getAirQuality: (location) => cacheManager.getAirQualityData(location),

    setGeocoding: (query, data, ttl) => cacheManager.setGeocodingData(query, data, ttl),
    getGeocoding: (query) => cacheManager.getGeocodingData(query),

    // User-specific operations
    setUserPrefs: (userId, prefs, ttl) => cacheManager.setUserPreferences(userId, prefs, ttl),
    getUserPrefs: (userId) => cacheManager.getUserPreferences(userId),

    // Batch operations
    mget: (keys) => cacheManager.mget(keys),
    mset: (keyValuePairs, ttl) => cacheManager.mset(keyValuePairs, ttl),

    // Utility operations
    keys: (pattern) => cacheManager.keys(pattern),
    incr: (key, amount) => cacheManager.incr(key, amount),
    expire: (key, ttl) => cacheManager.expire(key, ttl),
    stats: () => cacheManager.getStats()
};

export default cacheManager;
