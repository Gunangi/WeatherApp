import { useState, useEffect } from 'react';


/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial value if key doesn't exist
 * @returns {[value, setValue, removeValue]} - Array with current value, setter, and remover
 */
export const useLocalStorage = (key, initialValue) => {
    // State to store our value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);

            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (valueToStore === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Function to remove the item from localStorage
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {

            /**
             * Custom hook for managing localStorage with React state
             * @param {string} key - The localStorage key
             * @param {*} initialValue - The initial value if key doesn't exist
             * @returns {[value, setValue, removeValue]} - Array with current value, setter, and remover
             */
            export const useLocalStorage = (key, initialValue) => {
                // State to store our value
                const [storedValue, setStoredValue] = useState(() => {
                    try {
                        // Get from local storage by key
                        const item = window.localStorage.getItem(key);

                        // Parse stored json or if none return initialValue
                        return item ? JSON.parse(item) : initialValue;
                    } catch (error) {
                        // If error also return initialValue
                        console.error(`Error reading localStorage key "${key}":`, error);
                        return initialValue;
                    }
                });

                // Return a wrapped version of useState's setter function that persists the new value to localStorage
                const setValue = (value) => {
                    try {
                        // Allow value to be a function so we have the same API as useState
                        const valueToStore = value instanceof Function ? value(storedValue) : value;

                        // Save state
                        setStoredValue(valueToStore);

                        // Save to local storage
                        if (valueToStore === undefined) {
                            window.localStorage.removeItem(key);
                        } else {
                            window.localStorage.setItem(key, JSON.stringify(valueToStore));
                        }
                    } catch (error) {
                        console.error(`Error setting localStorage key "${key}":`, error);
                    }
                };

                // Function to remove the item from localStorage
                const removeValue = () => {
                    try {
                        window.localStorage.removeItem(key);
                        setStoredValue(initialValue);
                    } catch (error) {
                        console.error(`Error removing localStorage key "${key}":`, error);
                    }
                };

                // Listen for changes to the localStorage key from other tabs/windows
                useEffect(() => {
                    const handleStorageChange = (e) => {
                        if (e.key === key && e.newValue !== null) {
                            try {
                                setStoredValue(JSON.parse(e.newValue));
                            } catch (error) {
                                console.error(`Error parsing localStorage value for key "${key}":`, error);
                            }
                        } else if (e.key === key && e.newValue === null) {
                            // Key was removed
                            setStoredValue(initialValue);
                        }
                    };

                    window.addEventListener('storage', handleStorageChange);

                    return () => {
                        window.removeEventListener('storage', handleStorageChange);
                    };
                }, [key, initialValue]);

                return [storedValue, setValue, removeValue];
            };

            /**
             * Hook for managing user preferences in localStorage
             * @returns {object} - Object with preferences and methods to manage them
             */
            export const useUserPreferences = () => {
                const [preferences, setPreferences, removePreferences] = useLocalStorage('user_preferences', {
                    theme: 'light',
                    temperatureUnit: 'celsius',
                    windSpeedUnit: 'ms',
                    pressureUnit: 'hpa',
                    language: 'en',
                    defaultLocation: null,
                    autoDetectLocation: true,
                    notifications: {
                        enabled: true,
                        weatherAlerts: true,
                        customAlerts: true,
                        airQuality: true
                    }
                });

                const updatePreference = (key, value) => {
                    setPreferences(prev => ({
                        ...prev,
                        [key]: value
                    }));
                };

                const updateNestedPreference = (parentKey, childKey, value) => {
                    setPreferences(prev => ({
                        ...prev,
                        [parentKey]: {
                            ...prev[parentKey],
                            [childKey]: value
                        }
                    }));
                };

                const resetPreferences = () => {
                    removePreferences();
                };

                return {
                    preferences,
                    updatePreference,
                    updateNestedPreference,
                    resetPreferences,
                    setPreferences
                };
            };

            /**
             * Hook for managing favorite cities in localStorage
             * @returns {object} - Object with favorites and methods to manage them
             */
            export const useFavoriteCities = () => {
                const [favorites, setFavorites] = useLocalStorage('favorite_cities', []);

                const addFavorite = (city) => {
                    if (!favorites.find(fav => fav.id === city.id)) {
                        setFavorites(prev => [...prev, {
                            ...city,
                            addedAt: new Date().toISOString()
                        }]);
                        return true;
                    }
                    return false;
                };

                const removeFavorite = (cityId) => {
                    setFavorites(prev => prev.filter(fav => fav.id !== cityId));
                };

                const isFavorite = (cityId) => {
                    return favorites.some(fav => fav.id === cityId);
                };

                const updateFavorite = (cityId, updates) => {
                    setFavorites(prev => prev.map(fav =>
                        fav.id === cityId ? { ...fav, ...updates } : fav
                    ));
                };

                const clearFavorites = () => {
                    setFavorites([]);
                };

                return {
                    favorites,
                    addFavorite,
                    removeFavorite,
                    isFavorite,
                    updateFavorite,
                    clearFavorites,
                    count: favorites.length
                };
            };

            /**
             * Hook for managing search history in localStorage
             * @param {number} maxItems - Maximum number of items to keep in history
             * @returns {object} - Object with search history and methods to manage it
             */
            export const useSearchHistory = (maxItems = 10) => {
                const [history, setHistory] = useLocalStorage('search_history', []);

                const addToHistory = (searchItem) => {
                    setHistory(prev => {
                        // Remove if already exists
                        const filtered = prev.filter(item =>
                            item.query !== searchItem.query || item.location !== searchItem.location
                        );

                        // Add to beginning
                        const newHistory = [{
                            ...searchItem,
                            timestamp: new Date().toISOString()
                        }, ...filtered];

                        // Limit to maxItems
                        return newHistory.slice(0, maxItems);
                    });
                };

                const removeFromHistory = (index) => {
                    setHistory(prev => prev.filter((_, i) => i !== index));
                };

                const clearHistory = () => {
                    setHistory([]);
                };

                const getRecentSearches = (limit = 5) => {
                    return history.slice(0, limit);
                };

                return {
                    history,
                    addToHistory,
                    removeFromHistory,
                    clearHistory,
                    getRecentSearches,
                    count: history.length
                };
            };

            /**
             * Hook for managing weather alerts cache
             * @returns {object} - Object with cached alerts and methods to manage them
             */
            export const useWeatherAlertsCache = () => {
                const [cachedAlerts, setCachedAlerts] = useLocalStorage('weather_alerts_cache', {
                    alerts: [],
                    lastUpdated: null,
                    location: null
                });

                const updateAlertsCache = (alerts, location) => {
                    setCachedAlerts({
                        alerts,
                        location,
                        lastUpdated: new Date().toISOString()
                    });
                };

                const isAlertsCacheValid = (location, maxAgeMinutes = 30) => {
                    if (!cachedAlerts.lastUpdated || cachedAlerts.location !== location) {
                        return false;
                    }

                    const lastUpdated = new Date(cachedAlerts.lastUpdated);
                    const now = new Date();
                    const diffMinutes = (now - lastUpdated) / (1000 * 60);

                    return diffMinutes < maxAgeMinutes;
                };

                const getCachedAlerts = (location) => {
                    if (isAlertsCacheValid(location)) {
                        return cachedAlerts.alerts;
                    }
                    return null;
                };

                const clearAlertsCache = () => {
                    setCachedAlerts({
                        alerts: [],
                        lastUpdated: null,
                        location: null
                    });
                };

                return {
                    cachedAlerts,
                    updateAlertsCache,
                    isAlertsCacheValid,
                    getCachedAlerts,
                    clearAlertsCache
                };
            };

            /**
             * Hook for managing app settings with versioning
             * @returns {object} - Object with settings and methods to manage them
             */
            export const useAppSettings = () => {
                const [settings, setSettings] = useLocalStorage('app_settings', {
                    version: '1.0.0',
                    theme: 'light',
                    autoRefresh: true,
                    refreshInterval: 300000, // 5 minutes
                    units: {
                        temperature: 'celsius',
                        wind: 'ms',
                        pressure: 'hpa',
                        distance: 'km'
                    },
                    ui: {
                        showAdvancedMetrics: false,
                        compactMode: false,
                        showAnimations: true
                    },
                    privacy: {
                        shareLocation: true,
                        saveSearchHistory: true,
                        analytics: false
                    }
                });

                const updateSetting = (path, value) => {
                    const keys = path.split('.');
                    setSettings(prev => {
                        const newSettings = {...prev};
                        let current = newSettings;

                        for (let i = 0; i < keys.length - 1; i++) {
                            current[keys[i]] = {...current[keys[i]]};
                            current = current[keys[i]];
                        }

                        current[keys[keys.length - 1]] = value;
                        return newSettings;
                    });
                };

                const getSetting = (path, defaultValue = null) => {
                    const keys = path.split('.');
                    let current = settings;

                    for (const key of keys) {
                        if (current && typeof current === 'object' && key in current) {
                            current = current[key];
                        } else {
                            return defaultValue;
                        }
                    }

                    return current;
                };

                const resetSettings = () => {
                    setSettings({
                        version: '1.0.0',
                        theme: 'light',
                        autoRefresh: true,
                        refreshInterval: 300000,
                        units: {
                            temperature: 'celsius',
                            wind: 'ms',
                            pressure: 'hpa',
                            distance: 'km'
                        },
                        ui: {
                            showAdvancedMetrics: false,
                            compactMode: false,
                            showAnimations: true
                        },
                        privacy: {
                            shareLocation: true,
                            saveSearchHistory: true,
                            analytics: false
                        }
                    });
                };

                return {
                    settings,
                    updateSetting,
                    getSetting,
                    resetSettings,
                    setSettings
                };
            };
            export default useLocalStorage;