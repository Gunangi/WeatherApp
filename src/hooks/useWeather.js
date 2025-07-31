import { useState, useEffect, useCallback, useRef } from 'react';
import { useWeatherContext } from '../context/WeatherContext';
import { useUserContext } from '../context/UserContext';

// Mock API base URL - replace with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Custom hook for weather data management
export const useWeather = () => {
    const weatherContext = useWeatherContext();
    const userContext = useUserContext();
    const [refreshing, setRefreshing] = useState(false);
    const refreshTimeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    const {
        currentWeather,
        forecast,
        hourlyForecast,
        airQuality,
        historicalWeather,
        weatherAlerts,
        selectedLocation,
        loading,
        error,
        lastUpdated,
        setLoading,
        setError,
        setCurrentWeather,
        setForecast,
        setHourlyForecast,
        setAirQuality,
        setHistoricalWeather,
        setWeatherAlerts,
        setSelectedLocation,
        addToLocationHistory,
        setUvIndex,
        setActivitySuggestions,
        setClothingSuggestions
    } = weatherContext;

    const { locationPreferences, temperatureUnit } = userContext;

    // Helper function to make API calls with proper error handling
    const makeApiCall = useCallback(async (endpoint, options = {}) => {
        try {
            // Cancel previous request if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                signal: abortControllerRef.current.signal,
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
                return null;
            }
            throw error;
        }
    }, []);

    // Fetch current weather data
    const fetchCurrentWeather = useCallback(async (location) => {
        if (!location || (!location.lat && !location.city)) {
            throw new Error('Location is required to fetch weather data');
        }

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }
            params.append('units', temperatureUnit);

            const data = await makeApiCall(`/weather/current?${params}`);

            if (data) {
                setCurrentWeather(data);
                setSelectedLocation({
                    city: data.location.city,
                    country: data.location.country,
                    lat: data.location.lat,
                    lon: data.location.lon,
                    timezone: data.location.timezone
                });

                // Add to location history
                addToLocationHistory({
                    city: data.location.city,
                    country: data.location.country,
                    lat: data.location.lat,
                    lon: data.location.lon,
                    searchedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error fetching current weather:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setCurrentWeather, setSelectedLocation, addToLocationHistory, temperatureUnit, makeApiCall]);

    // Fetch 5-day forecast
    const fetchForecast = useCallback(async (location) => {
        if (!location || (!location.lat && !location.city)) {
            throw new Error('Location is required to fetch forecast data');
        }

        try {
            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }
            params.append('units', temperatureUnit);

            const data = await makeApiCall(`/weather/forecast?${params}`);

            if (data) {
                setForecast(data);
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
            setError(error.message);
        }
    }, [setForecast, setError, temperatureUnit, makeApiCall]);

    // Fetch hourly forecast
    const fetchHourlyForecast = useCallback(async (location) => {
        if (!location || (!location.lat && !location.city)) {
            throw new Error('Location is required to fetch hourly forecast');
        }

        try {
            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }
            params.append('units', temperatureUnit);

            const data = await makeApiCall(`/weather/hourly?${params}`);

            if (data) {
                setHourlyForecast(data);
            }
        } catch (error) {
            console.error('Error fetching hourly forecast:', error);
            setError(error.message);
        }
    }, [setHourlyForecast, setError, temperatureUnit, makeApiCall]);

    // Fetch air quality data
    const fetchAirQuality = useCallback(async (location) => {
        if (!location || (!location.lat && !location.city)) {
            throw new Error('Location is required to fetch air quality data');
        }

        try {
            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }

            const data = await makeApiCall(`/air-quality?${params}`);

            if (data) {
                setAirQuality(data);
            }
        } catch (error) {
            console.error('Error fetching air quality:', error);
            setError(error.message);
        }
    }, [setAirQuality, setError, makeApiCall]);

    // Fetch historical weather data
    const fetchHistoricalWeather = useCallback(async (location, startDate, endDate) => {
        if (!location || (!location.lat && !location.city)) {
            throw new Error('Location is required to fetch historical weather');
        }

        try {
            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }
            params.append('startDate', startDate);
            params.append('endDate', endDate);
            params.append('units', temperatureUnit);

            const data = await makeApiCall(`/weather/historical?${params}`);

            if (data) {
                setHistoricalWeather(data);
            }
        } catch (error) {
            console.error('Error fetching historical weather:', error);
            setError(error.message);
        }
    }, [setHistoricalWeather, setError, temperatureUnit, makeApiCall]);

    // Fetch weather alerts
    const fetchWeatherAlerts = useCallback(async (location) => {
        if (!location || (!location.lat && !location.city)) {
            return;
        }

        try {
            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }

            const data = await makeApiCall(`/weather/alerts?${params}`);

            if (data) {
                setWeatherAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Error fetching weather alerts:', error);
            // Don't set error for alerts as they're not critical
        }
    }, [setWeatherAlerts, makeApiCall]);

    // Fetch UV index
    const fetchUvIndex = useCallback(async (location) => {
        if (!location || (!location.lat && !location.city)) {
            return;
        }

        try {
            const params = new URLSearchParams();
            if (location.lat && location.lon) {
                params.append('lat', location.lat);
                params.append('lon', location.lon);
            } else if (location.city) {
                params.append('city', location.city);
                if (location.country) {
                    params.append('country', location.country);
                }
            }

            const data = await makeApiCall(`/weather/uv-index?${params}`);

            if (data) {
                setUvIndex(data);
            }
        } catch (error) {
            console.error('Error fetching UV index:', error);
        }
    }, [setUvIndex, makeApiCall]);

    // Fetch activity suggestions
    const fetchActivitySuggestions = useCallback(async (location, weatherData) => {
        if (!location || !weatherData) {
            return;
        }

        try {
            const data = await makeApiCall('/recommendations/activities', {
                method: 'POST',
                body: JSON.stringify({
                    location: location,
                    weather: weatherData
                })
            });

            if (data) {
                setActivitySuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error fetching activity suggestions:', error);
        }
    }, [setActivitySuggestions, makeApiCall]);

    // Fetch clothing suggestions
    const fetchClothingSuggestions = useCallback(async (location, weatherData) => {
        if (!location || !weatherData) {
            return;
        }

        try {
            const data = await makeApiCall('/recommendations/clothing', {
                method: 'POST',
                body: JSON.stringify({
                    location: location,
                    weather: weatherData
                })
            });

            if (data) {
                setClothingSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error fetching clothing suggestions:', error);
        }
    }, [setClothingSuggestions, makeApiCall]);

    // Comprehensive weather data fetch
    const fetchAllWeatherData = useCallback(async (location, options = {}) => {
        const {
            includeForecast = true,
            includeAirQuality = true,
            includeAlerts = true,
            includeUvIndex = true,
            includeSuggestions = true
        } = options;

        try {
            setLoading(true);
            setError(null);

            // Fetch current weather first (required)
            await fetchCurrentWeather(location);

            // Fetch additional data in parallel
            const promises = [];

            if (includeForecast) {
                promises.push(fetchForecast(location));
                promises.push(fetchHourlyForecast(location));
            }

            if (includeAirQuality) {
                promises.push(fetchAirQuality(location));
            }

            if (includeAlerts) {
                promises.push(fetchWeatherAlerts(location));
            }

            if (includeUvIndex) {
                promises.push(fetchUvIndex(location));
            }

            await Promise.allSettled(promises);

            // Fetch suggestions after weather data is available
            if (includeSuggestions && currentWeather) {
                await Promise.allSettled([
                    fetchActivitySuggestions(location, currentWeather),
                    fetchClothingSuggestions(location, currentWeather)
                ]);
            }

        } catch (error) {
            console.error('Error in fetchAllWeatherData:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [
        fetchCurrentWeather,
        fetchForecast,
        fetchHourlyForecast,
        fetchAirQuality,
        fetchWeatherAlerts,
        fetchUvIndex,
        fetchActivitySuggestions,
        fetchClothingSuggestions,
        currentWeather,
        setLoading,
        setError
    ]);

    // Search for locations
    const searchLocations = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const params = new URLSearchParams();
            params.append('q', query.trim());
            params.append('limit', '10');

            const data = await makeApiCall(`/locations/search?${params}`);
            return data?.locations || [];
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }, [makeApiCall]);

    // Refresh weather data
    const refreshWeatherData = useCallback(async (force = false) => {
        if (!selectedLocation.lat && !selectedLocation.city) {
            return;
        }

        const now = new Date();
        const lastUpdate = lastUpdated ? new Date(lastUpdated) : null;
        const cacheExpiry = userContext.appPreferences.cacheExpiry * 60 * 1000; // Convert to milliseconds

        // Check if refresh is needed
        if (!force && lastUpdate && (now - lastUpdate) < cacheExpiry) {
            return;
        }

        setRefreshing(true);
        try {
            await fetchAllWeatherData(selectedLocation);
        } finally {
            setRefreshing(false);
        }
    }, [selectedLocation, lastUpdated, userContext.appPreferences.cacheExpiry, fetchAllWeatherData]);

    // Auto-refresh setup
    useEffect(() => {
        if (!locationPreferences.autoRefresh || !selectedLocation.lat) {
            return;
        }

        const interval = locationPreferences.refreshInterval * 60 * 1000; // Convert to milliseconds
        refreshTimeoutRef.current = setInterval(() => {
            refreshWeatherData();
        }, interval);

        return () => {
            if (refreshTimeoutRef.current) {
                clearInterval(refreshTimeoutRef.current);
            }
        };
    }, [locationPreferences.autoRefresh, locationPreferences.refreshInterval, selectedLocation.lat, refreshWeatherData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (refreshTimeoutRef.current) {
                clearInterval(refreshTimeoutRef.current);
            }
        };
    }, []);

    // Check if data is stale
    const isDataStale = useCallback(() => {
        if (!lastUpdated) return true;

        const now = new Date();
        const lastUpdate = new Date(lastUpdated);
        const cacheExpiry = userContext.appPreferences.cacheExpiry * 60 * 1000;

        return (now - lastUpdate) > cacheExpiry;
    }, [lastUpdated, userContext.appPreferences.cacheExpiry]);

    return {
        // State
        currentWeather,
        forecast,
        hourlyForecast,
        airQuality,
        historicalWeather,
        weatherAlerts,
        selectedLocation,
        loading,
        error,
        lastUpdated,
        refreshing,

        // Actions
        fetchCurrentWeather,
        fetchForecast,
        fetchHourlyForecast,
        fetchAirQuality,
        fetchHistoricalWeather,
        fetchWeatherAlerts,
        fetchUvIndex,
        fetchActivitySuggestions,
        fetchClothingSuggestions,
        fetchAllWeatherData,
        searchLocations,
        refreshWeatherData,

        // Utilities
        isDataStale,
        hasWeatherData: !!currentWeather,
        hasLocationSelected: !!(selectedLocation.lat || selectedLocation.city),

        // Error helpers
        clearError: () => setError(null),
        retryLastRequest: () => {
            if (selectedLocation.lat || selectedLocation.city) {
                fetchAllWeatherData(selectedLocation);
            }
        }
    };
};

export default useWeather;