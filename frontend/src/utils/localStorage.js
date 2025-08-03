// Local Storage Keys
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'weatherapp_user_preferences',
    LOCATION_HISTORY: 'weatherapp_location_history',
    FAVORITE_CITIES: 'weatherapp_favorite_cities',
    WEATHER_CACHE: 'weatherapp_weather_cache',
    THEME_PREFERENCE: 'weatherapp_theme',
    NOTIFICATION_SETTINGS: 'weatherapp_notification_settings',
    WIDGET_SETTINGS: 'weatherapp_widget_settings',
    LAST_LOCATION: 'weatherapp_last_location',
    CACHE_TIMESTAMPS: 'weatherapp_cache_timestamps',
    USER_SETTINGS_BACKUP: 'weatherapp_settings_backup'
};

// Cache duration in milliseconds
export const CACHE_DURATIONS = {
    CURRENT_WEATHER: 10 * 60 * 1000,    // 10 minutes
    FORECAST: 30 * 60 * 1000,           // 30 minutes
    AIR_QUALITY: 15 * 60 * 1000,        // 15 minutes
    HISTORICAL: 24 * 60 * 60 * 1000,    // 24 hours
    LOCATION_DATA: 7 * 24 * 60 * 60 * 1000 // 7 days
};

class LocalStorageManager {
    constructor() {
        this.isSupported = this.checkSupport();
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
    }

    // Check if localStorage is supported
    checkSupport() {
        try {
            const test = '__localStorage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage is not supported:', error);
            return false;
        }
    }

    // Generic set method with error handling
    set(key, value, expiry = null) {
        if (!this.isSupported) {
            console.warn('localStorage not supported, using memory fallback');
            return this.setMemoryFallback(key, value, expiry);
        }

        try {
            const data = {
                value,
                timestamp: Date.now(),
                expiry: expiry ? Date.now() + expiry : null
            };

            const serialized = JSON.stringify(data);

            // Check storage size
            if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
                this.cleanupOldData();
            }

            window.localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Failed to save to localStorage (${key}):`, error);

            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                try {
                    window.localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now(), expiry }));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save after cleanup:', retryError);
                }
            }

            return false;
        }
    }

    // Generic get method with expiry check
    get(key, defaultValue = null) {
        if (!this.isSupported) {
            return this.getMemoryFallback(key, defaultValue);
        }

        try {
            const item = window.localStorage.getItem(key);
            if (!item) return defaultValue;

            const data = JSON.parse(item);

            // Check if data has expired
            if (data.expiry && Date.now() > data.expiry) {
                this.remove(key);
                return defaultValue;
            }

            return data.value;
        } catch (error) {
            console.error(`Failed to get from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    // Remove item
    remove(key) {
        if (!this.isSupported) {
            return this.removeMemoryFallback(key);
        }

        try {
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to remove from localStorage (${key}):`, error);
            return false;
        }
    }

    // Clear all app data
    clear() {
        if (!this.isSupported) {
            this.clearMemoryFallback();
            return;
        }

        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                window.localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }

    // User Preferences Management
    getUserPreferences() {
        return this.get(STORAGE_KEYS.USER_PREFERENCES, {
            temperatureUnit: 'celsius',
            windSpeedUnit: 'mps',
            pressureUnit: 'hpa',
            distanceUnit: 'km',
            timeFormat: '24h',
            language: 'en',
            autoLocation: true,
            showNotifications: true,
            refreshInterval: 300000, // 5 minutes
            defaultLocation: null
        });
    }

    saveUserPreferences(preferences) {
        const current = this.getUserPreferences();
        const updated = { ...current, ...preferences };
        return this.set(STORAGE_KEYS.USER_PREFERENCES, updated);
    }

    // Location History Management
    getLocationHistory() {
        return this.get(STORAGE_KEYS.LOCATION_HISTORY, []);
    }

    addToLocationHistory(location) {
        const history = this.getLocationHistory();

        // Remove if already exists to avoid duplicates
        const filtered = history.filter(item =>
            item.name !== location.name || item.country !== location.country
        );

        // Add to beginning and limit to 20 items
        const updated = [location, ...filtered].slice(0, 20);

        return this.set(STORAGE_KEYS.LOCATION_HISTORY, updated);
    }

    clearLocationHistory() {
        return this.remove(STORAGE_KEYS.LOCATION_HISTORY);
    }

    // Favorite Cities Management
    getFavoriteCities() {
        return this.get(STORAGE_KEYS.FAVORITE_CITIES, []);
    }

    addFavoriteCity(city) {
        const favorites = this.getFavoriteCities();

        // Check if already exists
        const exists = favorites.some(fav =>
            fav.name === city.name && fav.country === city.country
        );

        if (!exists) {
            const updated = [...favorites, { ...city, addedAt: Date.now() }];
            return this.set(STORAGE_KEYS.FAVORITE_CITIES, updated);
        }

        return true;
    }

    removeFavoriteCity(cityName, country) {
        const favorites = this.getFavoriteCities();
        const updated = favorites.filter(city =>
            city.name !== cityName || city.country !== country
        );
        return this.set(STORAGE_KEYS.FAVORITE_CITIES, updated);
    }

    // Weather Data Caching
    cacheWeatherData(locationKey, weatherData, dataType = 'current') {
        const cacheKey = `${STORAGE_KEYS.WEATHER_CACHE}_${locationKey}_${dataType}`;
        const duration = CACHE_DURATIONS[dataType.toUpperCase()] || CACHE_DURATIONS.CURRENT_WEATHER;

        return this.set(cacheKey, weatherData, duration);
    }

    getCachedWeatherData(locationKey, dataType = 'current') {
        const cacheKey = `${STORAGE_KEYS.WEATHER_CACHE}_${locationKey}_${dataType}`;
        return this.get(cacheKey);
    }

    // Theme Management
    getTheme() {
        return this.get(STORAGE_KEYS.THEME_PREFERENCE, 'light');
    }

    saveTheme(theme) {
        return this.set(STORAGE_KEYS.THEME_PREFERENCE, theme);
    }

    // Widget Settings Management
    getWidgetSettings() {
        return this.get(STORAGE_KEYS.WIDGET_SETTINGS, {
            layout: 'grid',
            widgets: ['current-weather', 'forecast', 'air-quality'],
            positions: {},
            sizes: {}
        });
    }

    saveWidgetSettings(settings) {
        const current = this.getWidgetSettings();
        const updated = { ...current, ...settings };
        return this.set(STORAGE_KEYS.WIDGET_SETTINGS, updated);
    }

    // Last Location Management
    getLastLocation() {
        return this.get(STORAGE_KEYS.LAST_LOCATION);
    }

    saveLastLocation(location) {
        return this.set(STORAGE_KEYS.LAST_LOCATION, {
            ...location,
            timestamp: Date.now()
        });
    }

    // Backup and Restore
    createBackup() {
        if (!this.isSupported) return null;

        try {
            const backup = {
                timestamp: Date.now(),
                version: '1.0',
                data: {}
            };

            Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
                const data = window.localStorage.getItem(storageKey);
                if (data) {
                    backup.data[key] = data;
                }
            });

            const backupString = JSON.stringify(backup);
            this.set(STORAGE_KEYS.USER_SETTINGS_BACKUP, backup);

            return backupString;
        } catch (error) {
            console.error('Failed to create backup:', error);
            return null;
        }
    }

    restoreBackup(backupString) {
        if (!this.isSupported) return false;

        try {
            const backup = JSON.parse(backupString);

            if (!backup.data || !backup.version) {
                throw new Error('Invalid backup format');
            }

            Object.entries(backup.data).forEach(([key, value]) => {
                const storageKey = STORAGE_KEYS[key];
                if (storageKey) {
                    window.localStorage.setItem(storageKey, value);
                }
            });

            return true;
        } catch (error) {
            console.error('Failed to restore backup:', error);
            return false;
        }
    }

    // Storage Management
    getStorageSize() {
        if (!this.isSupported) return 0;

        let total = 0;
        for (let key in window.localStorage) {
            if (window.localStorage.hasOwnProperty(key)) {
                total += window.localStorage[key].length + key.length;
            }
        }
        return total;
    }

    getStorageInfo() {
        if (!this.isSupported) {
            return { supported: false };
        }

        const size = this.getStorageSize();
        const itemCount = Object.keys(window.localStorage).length;

        return {
            supported: true,
            totalSize: size,
            totalSizeFormatted: this.formatBytes(size),
            itemCount,
            maxSize: this.maxStorageSize,
            maxSizeFormatted: this.formatBytes(this.maxStorageSize),
            usage: (size / this.maxStorageSize) * 100
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Cleanup old data
    cleanupOldData() {
        if (!this.isSupported) return;

        try {
            const keys = Object.keys(window.localStorage);
            const now = Date.now();

            keys.forEach(key => {
                try {
                    const item = window.localStorage.getItem(key);
                    if (item) {
                        const data = JSON.parse(item);
                        if (data.expiry && now > data.expiry) {
                            window.localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // Invalid JSON, remove the item
                    window.localStorage.removeItem(key);
                }
            });

            // If still over limit, remove oldest cache entries
            if (this.getStorageSize() > this.maxStorageSize) {
                this.cleanupOldestCache();
            }
        } catch (error) {
            console.error('Failed to cleanup old data:', error);
        }
    }

    cleanupOldestCache() {
        const keys = Object.keys(window.localStorage);
        const cacheKeys = keys.filter(key => key.includes('_cache_'));

        // Sort by timestamp and remove oldest
        const cacheEntries = cacheKeys.map(key => {
            try {
                const data = JSON.parse(window.localStorage.getItem(key));
                return { key, timestamp: data.timestamp || 0 };
            } catch {
                return { key, timestamp: 0 };
            }
        }).sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 25% of cache entries
        const toRemove = Math.ceil(cacheEntries.length * 0.25);
        cacheEntries.slice(0, toRemove).forEach(entry => {
            window.localStorage.removeItem(entry.key);
        });
    }

    // Memory fallback for when localStorage is not available
    memoryStorage = new Map();

    setMemoryFallback(key, value, expiry) {
        this.memoryStorage.set(key, {
            value,
            timestamp: Date.now(),
            expiry: expiry ? Date.now() + expiry : null
        });
        return true;
    }

    getMemoryFallback(key, defaultValue) {
        const item = this.memoryStorage.get(key);
        if (!item) return defaultValue;

        if (item.expiry && Date.now() > item.expiry) {
            this.memoryStorage.delete(key);
            return defaultValue;
        }

        return item.value;
    }

    removeMemoryFallback(key) {
        return this.memoryStorage.delete(key);
    }

    clearMemoryFallback() {
        this.memoryStorage.clear();
    }

    // Export/Import functionality
    exportData() {
        const backup = this.createBackup();
        if (!backup) return null;

        const blob = new Blob([backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const success = this.restoreBackup(e.target.result);
                    resolve(success);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Validate data integrity
    validateData(key, data) {
        try {
            switch (key) {
                case STORAGE_KEYS.USER_PREFERENCES:
                    return this.validateUserPreferences(data);
                case STORAGE_KEYS.FAVORITE_CITIES:
                    return Array.isArray(data) && data.every(city =>
                        city.name && city.country && typeof city.lat === 'number' && typeof city.lon === 'number'
                    );
                case STORAGE_KEYS.LOCATION_HISTORY:
                    return Array.isArray(data);
                default:
                    return true;
            }
        } catch (error) {
            console.error('Data validation error:', error);
            return false;
        }
    }

    validateUserPreferences(prefs) {
        const required = ['temperatureUnit', 'windSpeedUnit', 'pressureUnit', 'distanceUnit'];
        return required.every(key => key in prefs);
    }
}

// Create singleton instance with a different name to avoid conflicts
const storageManager = new LocalStorageManager();

// Export the manager as default and named export
export default storageManager;
export { storageManager };

// Convenience functions
export const getUserPreferences = () => storageManager.getUserPreferences();
export const saveUserPreferences = (prefs) => storageManager.saveUserPreferences(prefs);
export const getLocationHistory = () => storageManager.getLocationHistory();
export const addToLocationHistory = (location) => storageManager.addToLocationHistory(location);
export const getFavoriteCities = () => storageManager.getFavoriteCities();
export const addFavoriteCity = (city) => storageManager.addFavoriteCity(city);
export const removeFavoriteCity = (name, country) => storageManager.removeFavoriteCity(name, country);
export const cacheWeatherData = (key, data, type) => storageManager.cacheWeatherData(key, data, type);
export const getCachedWeatherData = (key, type) => storageManager.getCachedWeatherData(key, type);
export const getTheme = () => storageManager.getTheme();
export const saveTheme = (theme) => storageManager.saveTheme(theme);
export const getStorageInfo = () => storageManager.getStorageInfo();
export const exportData = () => storageManager.exportData();
export const importData = (file) => storageManager.importData(file);