// src/hooks/useWeather.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from '../context/LocationContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import {
    getCurrentWeather,
    setCurrentWeather,
    getForecast,
    setForecast,
    getAirQuality,
    setAirQuality
} from '../utils/cacheUtils.js';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Custom hook for managing weather data
 * @param {Object} options - Hook options
 * @returns {Object} Weather data and methods
 */
export function useWeather(options = {}) {
    const {
        autoRefresh = true,
        refreshInterval = 10 * 60 * 1000, // 10 minutes
        includeAirQuality = true,
        includeForecast = true,
        enableNotifications = true
    } = options;

    const { selectedLocation } = useLocation();
    const { checkWeatherConditions } = useNotifications();

    // State
    const [weatherData, setWeatherData] = useState({
        current: null,
        forecast: null,
        airQuality: null,
        alerts: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Refs
    const refreshTimer = useRef(null);
    const abortController = useRef(null);

    /**
     * Fetch current weather data
     */
    const fetchCurrentWeather = useCallback(async (location) => {
        if (!location) return null;

        try {
            // Check cache first
            const cached = getCurrentWeather(location);
            if (cached) {
                return cached;
            }

            // Fetch from API
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`,
                {
                    signal: abortController.current?.signal,
                    timeout: API_CONFIG.TIMEOUT
                }
            );

            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            setCurrentWeather(location, data);

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }
            throw error;
        }
    }, []);

    /**
     * Fetch forecast data
     */
    const fetchForecast = useCallback(async (location) => {
        if (!location || !includeForecast) return null;

        try {
            // Check cache first
            const cached = getForecast(location);
            if (cached) {
                return cached;
            }

            // Fetch from API
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`,
                {
                    signal: abortController.current?.signal,
                    timeout: API_CONFIG.TIMEOUT
                }
            );

            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            setForecast(location, data);

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }
            throw error;
        }
    }, [includeForecast]);

    /**
     * Fetch air quality data
     */
    const fetchAirQuality = useCallback(async (location) => {
        if (!location || !includeAirQuality) return null;

        try {
            // Check cache first
            const cached = getAirQuality(location);
            if (cached) {
                return cached;
            }

            // Fetch from API
            const response = await fetch(
                `${API_CONFIG.AIR_QUALITY_URL}?lat=${location.lat}&lon=${location.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
                {
                    signal: abortController.current?.signal,
                    timeout: API_CONFIG.TIMEOUT
                }
            );

            if (!response.ok) {
                throw new Error(`Air Quality API error: ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            setAirQuality(location, data);

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }
            throw error;
        }
    }, [includeAirQuality]);

    /**
     * Fetch all weather data
     */
    const fetchWeatherData = useCallback(async (location = selectedLocation, force = false) => {
        if (!location) {
            setError('No location provided');
            return;
        }

        // Cancel previous request
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setIsLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [current, forecast, airQuality] = await Promise.allSettled([
                fetchCurrentWeather(location),
                fetchForecast(location),
                fetchAirQuality(location)
            ]);

            const newWeatherData = {
                current: current.status === 'fulfilled' ? current.value : null,
                forecast: forecast.status === 'fulfilled' ? forecast.value : null,
                airQuality: airQuality.status === 'fulfilled' ? airQuality.value : null,
                alerts: [],
                location: location.displayName || location.name
            };

            // Check for alerts in current weather
            if (newWeatherData.current?.alerts) {
                newWeatherData.alerts = newWeatherData.current.alerts;
            }

            setWeatherData(newWeatherData);
            setLastUpdate(Date.now());

            // Check weather conditions for notifications
            if (enableNotifications) {
                checkWeatherConditions(newWeatherData);
            }

            // Log any failed requests
            if (current.status === 'rejected') {
                console.error('Failed to fetch current weather:', current.reason);
            }
            if (forecast.status === 'rejected') {
                console.error('Failed to fetch forecast:', forecast.reason);
            }
            if (airQuality.status === 'rejected') {
                console.error('Failed to fetch air quality:', airQuality.reason);
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching weather data:', error);
                setError(error.message || ERROR_MESSAGES.API_ERROR);
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedLocation, fetchCurrentWeather, fetchForecast, fetchAirQuality, enableNotifications, checkWeatherConditions]);

    /**
     * Refresh weather data
     */
    const refreshWeatherData = useCallback(() => {
        return fetchWeatherData(selectedLocation, true);
    }, [fetchWeatherData, selectedLocation]);

    /**
     * Start auto refresh
     */
    const startAutoRefresh = useCallback(() => {
        if (refreshTimer.current) {
            clearInterval(refreshTimer.current);
        }

        if (autoRefresh && refreshInterval > 0) {
            refreshTimer.current = setInterval(() => {
                fetchWeatherData(selectedLocation);
            }, refreshInterval);
        }
    }, [autoRefresh, refreshInterval, fetchWeatherData, selectedLocation]);

    /**
     * Stop auto refresh
     */
    const stopAutoRefresh = useCallback(() => {
        if (refreshTimer.current) {
            clearInterval(refreshTimer.current);
            refreshTimer.current = null;
        }
    }, []);

    /**
     * Get weather condition icon
     */
    const getWeatherIcon = useCallback((iconCode, size = '2x') => {
        if (!iconCode) return null;
        return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
    }, []);

    /**
     * Get weather description
     */
    const getWeatherDescription = useCallback(() => {
        if (!weatherData.current) return 'No data available';

        const main = weatherData.current.weather?.[0]?.main || '';
        const description = weatherData.current.weather?.[0]?.description || '';

        return description.charAt(0).toUpperCase() + description.slice(1);
    }, [weatherData.current]);

    /**
     * Get temperature with unit
     */
    const getTemperature = useCallback((temp, unit = '°C') => {
        if (temp === undefined || temp === null) return '--';
        return `${Math.round(temp)}${unit}`;
    }, []);

    /**
     * Check if data is stale
     */
    const isDataStale = useCallback((maxAge = 10 * 60 * 1000) => {
        if (!lastUpdate) return true;
        return Date.now() - lastUpdate > maxAge;
    }, [lastUpdate]);

    /**
     * Get data age in minutes
     */
    const getDataAge = useCallback(() => {
        if (!lastUpdate) return null;
        return Math.floor((Date.now() - lastUpdate) / (60 * 1000));
    }, [lastUpdate]);

    // Effect to fetch data when location changes
    useEffect(() => {
        if (selectedLocation) {
            fetchWeatherData(selectedLocation);
        }
    }, [selectedLocation, fetchWeatherData]);

    // Effect to handle auto refresh
    useEffect(() => {
        if (selectedLocation) {
            startAutoRefresh();
        }

        return () => {
            stopAutoRefresh();
        };
    }, [selectedLocation, startAutoRefresh, stopAutoRefresh]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
            stopAutoRefresh();
        };
    }, [stopAutoRefresh]);

    return {
        // Data
        ...weatherData,

        // State
        isLoading,
        error,
        lastUpdate,

        // Methods
        fetchWeatherData,
        refreshWeatherData,
        startAutoRefresh,
        stopAutoRefresh,

        // Utilities
        getWeatherIcon,
        getWeatherDescription,
        getTemperature,
        isDataStale,
        getDataAge,

        // Computed properties
        hasData: !!(weatherData.current || weatherData.forecast || weatherData.airQuality),
        isStale: isDataStale()
    };
}

export default useWeather;