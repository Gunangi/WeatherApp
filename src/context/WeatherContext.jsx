import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { weatherApi } from '../api/weatherApi';

// Initial state
const initialState = {
    currentWeather: null,
    forecast: null,
    airQuality: null,
    location: {
        lat: null,
        lon: null,
        city: '',
        country: ''
    },
    loading: false,
    error: null,
    units: 'metric', // metric, imperial
    lastUpdated: null,
    searchHistory: [],
    favoriteLocations: []
};

// Action types
const ActionTypes = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_CURRENT_WEATHER: 'SET_CURRENT_WEATHER',
    SET_FORECAST: 'SET_FORECAST',
    SET_AIR_QUALITY: 'SET_AIR_QUALITY',
    SET_LOCATION: 'SET_LOCATION',
    SET_UNITS: 'SET_UNITS',
    ADD_TO_SEARCH_HISTORY: 'ADD_TO_SEARCH_HISTORY',
    CLEAR_SEARCH_HISTORY: 'CLEAR_SEARCH_HISTORY',
    ADD_FAVORITE_LOCATION: 'ADD_FAVORITE_LOCATION',
    REMOVE_FAVORITE_LOCATION: 'REMOVE_FAVORITE_LOCATION',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const weatherReducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.SET_LOADING:
            return { ...state, loading: action.payload };

        case ActionTypes.SET_ERROR:
            return { ...state, error: action.payload, loading: false };

        case ActionTypes.SET_CURRENT_WEATHER:
            return {
                ...state,
                currentWeather: action.payload,
                lastUpdated: new Date().toISOString(),
                error: null,
                loading: false
            };

        case ActionTypes.SET_FORECAST:
            return { ...state, forecast: action.payload };

        case ActionTypes.SET_AIR_QUALITY:
            return { ...state, airQuality: action.payload };

        case ActionTypes.SET_LOCATION:
            return { ...state, location: action.payload };

        case ActionTypes.SET_UNITS:
            return { ...state, units: action.payload };

        case ActionTypes.ADD_TO_SEARCH_HISTORY:
            const newHistory = [
                action.payload,
                ...state.searchHistory.filter(item =>
                    item.lat !== action.payload.lat || item.lon !== action.payload.lon
                )
            ].slice(0, 10); // Keep only last 10 searches
            return { ...state, searchHistory: newHistory };

        case ActionTypes.CLEAR_SEARCH_HISTORY:
            return { ...state, searchHistory: [] };

        case ActionTypes.ADD_FAVORITE_LOCATION:
            if (state.favoriteLocations.some(fav =>
                fav.lat === action.payload.lat && fav.lon === action.payload.lon
            )) {
                return state;
            }
            return {
                ...state,
                favoriteLocations: [...state.favoriteLocations, action.payload]
            };

        case ActionTypes.REMOVE_FAVORITE_LOCATION:
            return {
                ...state,
                favoriteLocations: state.favoriteLocations.filter(fav =>
                    fav.lat !== action.payload.lat || fav.lon !== action.payload.lon
                )
            };

        case ActionTypes.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

// Context
const WeatherContext = createContext();

// Provider component
export const WeatherProvider = ({ children }) => {
    const [state, dispatch] = useReducer(weatherReducer, initialState);

    // Load persisted data on mount
    useEffect(() => {
        const savedUnits = localStorage.getItem('weatherUnits');
        const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const savedFavorites = JSON.parse(localStorage.getItem('favoriteLocations') || '[]');

        if (savedUnits) {
            dispatch({ type: ActionTypes.SET_UNITS, payload: savedUnits });
        }

        if (savedHistory.length > 0) {
            savedHistory.forEach(item => {
                dispatch({ type: ActionTypes.ADD_TO_SEARCH_HISTORY, payload: item });
            });
        }

        if (savedFavorites.length > 0) {
            savedFavorites.forEach(item => {
                dispatch({ type: ActionTypes.ADD_FAVORITE_LOCATION, payload: item });
            });
        }
    }, []);

    // Persist data to localStorage
    useEffect(() => {
        localStorage.setItem('weatherUnits', state.units);
    }, [state.units]);

    useEffect(() => {
        localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
    }, [state.searchHistory]);

    useEffect(() => {
        localStorage.setItem('favoriteLocations', JSON.stringify(state.favoriteLocations));
    }, [state.favoriteLocations]);

    // Actions
    const fetchWeatherData = async (lat, lon, cityName = '') => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            // Fetch current weather
            const currentWeather = await weatherApi.getCurrentWeather(lat, lon, state.units);
            dispatch({ type: ActionTypes.SET_CURRENT_WEATHER, payload: currentWeather });

            // Update location
            const location = {
                lat,
                lon,
                city: cityName || currentWeather.name,
                country: currentWeather.sys.country
            };
            dispatch({ type: ActionTypes.SET_LOCATION, payload: location });

            // Add to search history
            dispatch({
                type: ActionTypes.ADD_TO_SEARCH_HISTORY,
                payload: {
                    ...location,
                    timestamp: new Date().toISOString()
                }
            });

            // Fetch forecast
            const forecast = await weatherApi.getForecast(lat, lon, state.units);
            dispatch({ type: ActionTypes.SET_FORECAST, payload: forecast });

            // Fetch air quality
            try {
                const airQuality = await weatherApi.getAirQuality(lat, lon);
                dispatch({ type: ActionTypes.SET_AIR_QUALITY, payload: airQuality });
            } catch (aqError) {
                console.warn('Air quality data not available:', aqError);
            }

            return currentWeather;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || 'Failed to fetch weather data'
            });
            throw error;
        }
    };

    const fetchWeatherByCity = async (cityName) => {
        try {
            const geocodeData = await weatherApi.getCoordinatesByCity(cityName);
            if (geocodeData && geocodeData.length > 0) {
                const { lat, lon, name, country } = geocodeData[0];
                return await fetchWeatherData(lat, lon, `${name}, ${country}`);
            } else {
                throw new Error('City not found');
            }
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || 'Failed to find city'
            });
            throw error;
        }
    };

    const setUnits = (units) => {
        dispatch({ type: ActionTypes.SET_UNITS, payload: units });

        // Refresh current weather data with new units
        if (state.location.lat && state.location.lon) {
            fetchWeatherData(state.location.lat, state.location.lon, state.location.city);
        }
    };

    const addFavoriteLocation = (location) => {
        dispatch({ type: ActionTypes.ADD_FAVORITE_LOCATION, payload: location });
    };

    const removeFavoriteLocation = (location) => {
        dispatch({ type: ActionTypes.REMOVE_FAVORITE_LOCATION, payload: location });
    };

    const clearSearchHistory = () => {
        dispatch({ type: ActionTypes.CLEAR_SEARCH_HISTORY });
    };

    const clearError = () => {
        dispatch({ type: ActionTypes.CLEAR_ERROR });
    };

    const refreshWeatherData = async () => {
        if (state.location.lat && state.location.lon) {
            await fetchWeatherData(state.location.lat, state.location.lon, state.location.city);
        }
    };

    // Convert temperature based on units
    const convertTemperature = (temp, fromUnit = 'metric', toUnit = state.units) => {
        if (fromUnit === toUnit) return temp;

        if (fromUnit === 'metric' && toUnit === 'imperial') {
            return (temp * 9/5) + 32;
        } else if (fromUnit === 'imperial' && toUnit === 'metric') {
            return (temp - 32) * 5/9;
        }
        return temp;
    };

    // Get weather icon URL
    const getWeatherIconUrl = (iconCode, size = '2x') => {
        return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
    };

    // Check if location is in favorites
    const isLocationFavorite = (lat, lon) => {
        return state.favoriteLocations.some(fav =>
            Math.abs(fav.lat - lat) < 0.001 && Math.abs(fav.lon - lon) < 0.001
        );
    };

    const value = {
        // State
        ...state,

        // Actions
        fetchWeatherData,
        fetchWeatherByCity,
        setUnits,
        addFavoriteLocation,
        removeFavoriteLocation,
        clearSearchHistory,
        clearError,
        refreshWeatherData,

        // Utilities
        convertTemperature,
        getWeatherIconUrl,
        isLocationFavorite
    };

    return (
        <WeatherContext.Provider value={value}>
            {children}
        </WeatherContext.Provider>
    );
};

// Custom hook
export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
};

export default WeatherContext;