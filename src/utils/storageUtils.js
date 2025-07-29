// src/utils/storageUtils.js
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants.js';

class StorageManager {
    constructor() {
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    }

    checkLocalStorageAvailability() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    // Generic storage methods
    setItem(key, value) {
        if (!this.isLocalStorageAvailable) {
            console.warn('localStorage not available');
            return false;
        }

        try {
            const serializedValue = JSON.stringify({
                data: value,
                timestamp: Date.now()
            });
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            return parsed.data;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        if (!this.isLocalStorageAvailable) return false;

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    clear() {
        if (!this.isLocalStorageAvailable) return false;

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // User preferences methods
    getUserPreferences() {
        return this.getItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_SETTINGS);
    }

    setUserPreferences(preferences) {
        const currentPrefs = this.getUserPreferences();
        const updatedPrefs = { ...currentPrefs, ...preferences };
        return this.setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
    }

    // Theme methods
    getTheme() {
        return this.getItem(STORAGE_KEYS.THEME, 'auto');
    }

    setTheme(theme) {
        return this.setItem(STORAGE_KEYS.THEME, theme);
    }

    // Units methods
    getUnits() {
        return this.getItem(STORAGE_KEYS.UNITS, {
            temperature: 'celsius',
            windSpeed: 'metric',
            pressure: 'hPa'
        });
    }

    setUnits(units) {
        const currentUnits = this.getUnits();
        const updatedUnits = { ...currentUnits, ...units };
        return this.setItem(STORAGE_KEYS.UNITS, updatedUnits);
    }

    // Favorites methods
    getFavorites() {
        return this.getItem(STORAGE_KEYS.FAVORITES, []);
    }

    addFavorite(city) {
        const favorites = this.getFavorites();
        const existingIndex = favorites.findIndex(fav =>
            fav.lat === city.lat && fav.lon === city.lon
        );

        if (existingIndex === -1) {
            const updatedFavorites = [...favorites, {
                ...city,
                addedAt: Date.now()
            }];
            return this.setItem(STORAGE_KEYS.FAVORITES, updatedFavorites);
        }
        return false; // Already exists
    }

    removeFavorite(city) {
        const favorites = this.getFavorites();
        const updatedFavorites = favorites.filter(fav =>
            !(fav.lat === city.lat && fav.lon === city.lon)
        );
        return this.setItem(STORAGE_KEYS.FAVORITES, updatedFavorites);
    }

    isFavorite(city) {
        const favorites = this.getFavorites();
        return favorites.some(fav =>
            fav.lat === city.lat && fav.lon === city.lon
        );
    }

    // Search history methods
    getSearchHistory() {
        return this.getItem(STORAGE_KEYS.SEARCH_HISTORY, []);
    }

    addToSearchHistory(city) {
        const history = this.getSearchHistory();
        const existingIndex = history.findIndex(item =>
            item.lat === city.lat && item.lon === city.lon
        );

        let updatedHistory;
        if (existingIndex !== -1) {
            // Move to front if exists
            updatedHistory = [
                { ...city, searchedAt: Date.now() },
                ...history.filter((_, index) => index !== existingIndex)
            ];
        } else {
            // Add to front
            updatedHistory = [
                { ...city, searchedAt: Date.now() },
                ...history
            ];
        }

        // Keep only last 20 searches
        updatedHistory = updatedHistory.slice(0, 20);
        return this.setItem(STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
    }

    clearSearchHistory() {
        return this.setItem(STORAGE_KEYS.SEARCH_HISTORY, []);
    }

    // Last location methods
    getLastLocation() {
        return this.getItem(STORAGE_KEYS.LAST_LOCATION, null);
    }

    setLastLocation(location) {
        return this.setItem(STORAGE_KEYS.LAST_LOCATION, {
            ...location,
            timestamp: Date.now()
        });
    }

    // Notification settings methods
    getNotificationSettings() {
        const prefs = this.getUserPreferences();
        return prefs.notifications || DEFAULT_SETTINGS.notifications;
    }

    setNotificationSettings(settings) {
        const prefs = this.getUserPreferences();
        const updatedPrefs = {
            ...prefs,
            notifications: { ...prefs.notifications, ...settings }
        };
        return this.setUserPreferences(updatedPrefs);
    }

    // Export/Import methods
    exportData() {
        if (!this.isLocalStorageAvailable) return null;

        const data = {};
        Object.values(STORAGE_KEYS).forEach(key => {
            const value = this.getItem(key);
            if (value !== null) {
                data[key] = value;
            }
        });

        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data
        };
    }

    importData(importData) {
        if (!this.isLocalStorageAvailable || !importData || !importData.data) {
            return false;
        }

        try {
            Object.entries(importData.data).forEach(([key, value]) => {
                if (Object.values(STORAGE_KEYS).includes(key)) {
                    this.setItem(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Cleanup methods
    cleanupOldData(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
        if (!this.isLocalStorageAvailable) return;

        const now = Date.now();

        // Clean up search history
        const history = this.getSearchHistory();
        const validHistory = history.filter(item =>
            now - item.searchedAt < maxAge
        );
        if (validHistory.length !== history.length) {
            this.setItem(STORAGE_KEYS.SEARCH_HISTORY, validHistory);
        }

        // Clean up favorites (remove very old ones without recent activity)
        const favorites = this.getFavorites();
        const validFavorites = favorites.filter(item =>
            now - item.addedAt < maxAge * 3 // Keep favorites longer
        );
        if (validFavorites.length !== favorites.length) {
            this.setItem(STORAGE_KEYS.FAVORITES, validFavorites);
        }
    }

    // Storage size methods
    getStorageSize() {
        if (!this.isLocalStorageAvailable) return 0;

        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    getStorageSizeFormatted() {
        const bytes = this.getStorageSize();
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Migration methods
    migrateData(fromVersion, toVersion) {
        // Handle data migration between versions
        console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);

        // Example migration logic
        if (fromVersion < '1.1' && toVersion >= '1.1') {
            // Migrate old theme setting
            const oldTheme = localStorage.getItem('theme');
            if (oldTheme) {
                this.setTheme(oldTheme);
                localStorage.removeItem('theme');
            }
        }
    }
}

// Create singleton instance
const storageManager = new StorageManager();

// Export individual functions for easier use
export const setItem = (key, value) => storageManager.setItem(key, value);
export const getItem = (key, defaultValue) => storageManager.getItem(key, defaultValue);
export const removeItem = (key) => storageManager.removeItem(key);
export const clear = () => storageManager.clear();

export const getUserPreferences = () => storageManager.getUserPreferences();
export const setUserPreferences = (prefs) => storageManager.setUserPreferences(prefs);

export const getTheme = () => storageManager.getTheme();
export const setTheme = (theme) => storageManager.setTheme(theme);

export const getUnits = () => storageManager.getUnits();
export const setUnits = (units) => storageManager.setUnits(units);

export const getFavorites = () => storageManager.getFavorites();
export const addFavorite = (city) => storageManager.addFavorite(city);
export const removeFavorite = (city) => storageManager.removeFavorite(city);
export const isFavorite = (city) => storageManager.isFavorite(city);

export const getSearchHistory = () => storageManager.getSearchHistory();
export const addToSearchHistory = (city) => storageManager.addToSearchHistory(city);
export const clearSearchHistory = () => storageManager.clearSearchHistory();

export const getLastLocation = () => storageManager.getLastLocation();
export const setLastLocation = (location) => storageManager.setLastLocation(location);

export const getNotificationSettings = () => storageManager.getNotificationSettings();
export const setNotificationSettings = (settings) => storageManager.setNotificationSettings(settings);

export const exportData = () => storageManager.exportData();
export const importData = (data) => storageManager.importData(data);

export const cleanupOldData = (maxAge) => storageManager.cleanupOldData(maxAge);
export const getStorageSize = () => storageManager.getStorageSize();
export const getStorageSizeFormatted = () => storageManager.getStorageSizeFormatted();

export default storageManager;