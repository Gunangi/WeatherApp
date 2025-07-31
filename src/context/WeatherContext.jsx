import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for weather data
const initialWeatherState = {
    currentWeather: null,
    forecast: null,
    hourlyForecast: null,
    airQuality: null,
    historicalWeather: null,
    weatherAlerts: [],
    loading: false,
    error: null,
    lastUpdated: null,
    selectedLocation: {
        city: '',
        country: '',
        lat: null,
        lon: null,
        timezone: null
    },
    locationHistory: [],
    favoriteLocations: [],
    weatherComparison: [],
    uvIndex: null,
    activitySuggestions: [],
    clothingSuggestions: []
};

// Action types
const WEATHER_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_CURRENT_WEATHER: 'SET_CURRENT_WEATHER',
    SET_FORECAST: 'SET_FORECAST',
    SET_HOURLY_FORECAST: 'SET_HOURLY_FORECAST',
    SET_AIR_QUALITY: 'SET_AIR_QUALITY',
    SET_HISTORICAL_WEATHER: 'SET_HISTORICAL_WEATHER',
    SET_WEATHER_ALERTS: 'SET_WEATHER_ALERTS',
    SET_SELECTED_LOCATION: 'SET_SELECTED_LOCATION',
    ADD_TO_LOCATION_HISTORY: 'ADD_TO_LOCATION_HISTORY',
    CLEAR_LOCATION_HISTORY: 'CLEAR_LOCATION_HISTORY',
    ADD_FAVORITE_LOCATION: 'ADD_FAVORITE_LOCATION',
    REMOVE_FAVORITE_LOCATION: 'REMOVE_FAVORITE_LOCATION',
    SET_WEATHER_COMPARISON: 'SET_WEATHER_COMPARISON',
    SET_UV_INDEX: 'SET_UV_INDEX',
    SET_ACTIVITY_SUGGESTIONS: 'SET_ACTIVITY_SUGGESTIONS',
    SET_CLOTHING_SUGGESTIONS: 'SET_CLOTHING_SUGGESTIONS',
    CLEAR_ALL_DATA: 'CLEAR_ALL_DATA',
    UPDATE_LAST_UPDATED: 'UPDATE_LAST_UPDATED'
};

// Weather reducer
const weatherReducer = (state, action) => {
    switch (action.type) {
        case WEATHER_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
                error: action.payload ? null : state.error
            };

        case WEATHER_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false
            };

        case WEATHER_ACTIONS.SET_CURRENT_WEATHER:
            return {
                ...state,
                currentWeather: action.payload,
                loading: false,
                error: null,
                lastUpdated: new Date().toISOString()
            };

        case WEATHER_ACTIONS.SET_FORECAST:
            return {
                ...state,
                forecast: action.payload,
                loading: false,
                error: null
            };

        case WEATHER_ACTIONS.SET_HOURLY_FORECAST:
            return {
                ...state,
                hourlyForecast: action.payload
            };

        case WEATHER_ACTIONS.SET_AIR_QUALITY:
            return {
                ...state,
                airQuality: action.payload
            };

        case WEATHER_ACTIONS.SET_HISTORICAL_WEATHER:
            return {
                ...state,
                historicalWeather: action.payload
            };

        case WEATHER_ACTIONS.SET_WEATHER_ALERTS:
            return {
                ...state,
                weatherAlerts: action.payload
            };

        case WEATHER_ACTIONS.SET_SELECTED_LOCATION:
            return {
                ...state,
                selectedLocation: action.payload
            };

        case WEATHER_ACTIONS.ADD_TO_LOCATION_HISTORY:
            const newLocation = action.payload;
            const existingIndex = state.locationHistory.findIndex(
                loc => loc.city === newLocation.city && loc.country === newLocation.country
            );

            let updatedHistory;
            if (existingIndex !== -1) {
                // Move existing location to front
                updatedHistory = [
                    newLocation,
                    ...state.locationHistory.filter((_, index) => index !== existingIndex)
                ];
            } else {
                // Add new location to front, keep only last 10
                updatedHistory = [newLocation, ...state.locationHistory].slice(0, 10);
            }

            return {
                ...state,
                locationHistory: updatedHistory
            };

        case WEATHER_ACTIONS.CLEAR_LOCATION_HISTORY:
            return {
                ...state,
                locationHistory: []
            };

        case WEATHER_ACTIONS.ADD_FAVORITE_LOCATION:
            const locationToAdd = action.payload;
            const isAlreadyFavorite = state.favoriteLocations.some(
                loc => loc.city === locationToAdd.city && loc.country === locationToAdd.country
            );

            if (!isAlreadyFavorite) {
                return {
                    ...state,
                    favoriteLocations: [...state.favoriteLocations, locationToAdd]
                };
            }
            return state;

        case WEATHER_ACTIONS.REMOVE_FAVORITE_LOCATION:
            const locationToRemove = action.payload;
            return {
                ...state,
                favoriteLocations: state.favoriteLocations.filter(
                    loc => !(loc.city === locationToRemove.city && loc.country === locationToRemove.country)
                )
            };

        case WEATHER_ACTIONS.SET_WEATHER_COMPARISON:
            return {
                ...state,
                weatherComparison: action.payload
            };

        case WEATHER_ACTIONS.SET_UV_INDEX:
            return {
                ...state,
                uvIndex: action.payload
            };

        case WEATHER_ACTIONS.SET_ACTIVITY_SUGGESTIONS:
            return {
                ...state,
                activitySuggestions: action.payload
            };

        case WEATHER_ACTIONS.SET_CLOTHING_SUGGESTIONS:
            return {
                ...state,
                clothingSuggestions: action.payload
            };

        case WEATHER_ACTIONS.CLEAR_ALL_DATA:
            return {
                ...initialWeatherState,
                locationHistory: state.locationHistory,
                favoriteLocations: state.favoriteLocations
            };

        case WEATHER_ACTIONS.UPDATE_LAST_UPDATED:
            return {
                ...state,
                lastUpdated: new Date().toISOString()
            };

        default:
            return state;
    }
};

// Create Weather Context
const WeatherContext = createContext();

// Weather Provider Component
export const WeatherProvider = ({ children }) => {
    const [state, dispatch] = useReducer(weatherReducer, initialWeatherState);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const savedLocationHistory = localStorage.getItem('weatherApp_locationHistory');
            const savedFavoriteLocations = localStorage.getItem('weatherApp_favoriteLocations');

            if (savedLocationHistory) {
                const history = JSON.parse(savedLocationHistory);
                history.forEach(location => {
                    dispatch({
                        type: WEATHER_ACTIONS.ADD_TO_LOCATION_HISTORY,
                        payload: location
                    });
                });
            }

            if (savedFavoriteLocations) {
                const favorites = JSON.parse(savedFavoriteLocations);
                favorites.forEach(location => {
                    dispatch({
                        type: WEATHER_ACTIONS.ADD_FAVORITE_LOCATION,
                        payload: location
                    });
                });
            }
        } catch (error) {
            console.error('Error loading weather data from localStorage:', error);
        }
    }, []);

    // Save to localStorage when locationHistory or favoriteLocations change
    useEffect(() => {
        try {
            localStorage.setItem('weatherApp_locationHistory', JSON.stringify(state.locationHistory));
        } catch (error) {
            console.error('Error saving location history:', error);
        }
    }, [state.locationHistory]);

    useEffect(() => {
        try {
            localStorage.setItem('weatherApp_favoriteLocations', JSON.stringify(state.favoriteLocations));
        } catch (error) {
            console.error('Error saving favorite locations:', error);
        }
    }, [state.favoriteLocations]);

    // Context value with state and dispatch functions
    const contextValue = {
        // State
        ...state,

        // Action dispatchers
        setLoading: (loading) => dispatch({ type: WEATHER_ACTIONS.SET_LOADING, payload: loading }),
        setError: (error) => dispatch({ type: WEATHER_ACTIONS.SET_ERROR, payload: error }),
        setCurrentWeather: (weather) => dispatch({ type: WEATHER_ACTIONS.SET_CURRENT_WEATHER, payload: weather }),
        setForecast: (forecast) => dispatch({ type: WEATHER_ACTIONS.SET_FORECAST, payload: forecast }),
        setHourlyForecast: (forecast) => dispatch({ type: WEATHER_ACTIONS.SET_HOURLY_FORECAST, payload: forecast }),
        setAirQuality: (airQuality) => dispatch({ type: WEATHER_ACTIONS.SET_AIR_QUALITY, payload: airQuality }),
        setHistoricalWeather: (historical) => dispatch({ type: WEATHER_ACTIONS.SET_HISTORICAL_WEATHER, payload: historical }),
        setWeatherAlerts: (alerts) => dispatch({ type: WEATHER_ACTIONS.SET_WEATHER_ALERTS, payload: alerts }),
        setSelectedLocation: (location) => dispatch({ type: WEATHER_ACTIONS.SET_SELECTED_LOCATION, payload: location }),
        addToLocationHistory: (location) => dispatch({ type: WEATHER_ACTIONS.ADD_TO_LOCATION_HISTORY, payload: location }),
        clearLocationHistory: () => dispatch({ type: WEATHER_ACTIONS.CLEAR_LOCATION_HISTORY }),
        addFavoriteLocation: (location) => dispatch({ type: WEATHER_ACTIONS.ADD_FAVORITE_LOCATION, payload: location }),
        removeFavoriteLocation: (location) => dispatch({ type: WEATHER_ACTIONS.REMOVE_FAVORITE_LOCATION, payload: location }),
        setWeatherComparison: (comparison) => dispatch({ type: WEATHER_ACTIONS.SET_WEATHER_COMPARISON, payload: comparison }),
        setUvIndex: (uvIndex) => dispatch({ type: WEATHER_ACTIONS.SET_UV_INDEX, payload: uvIndex }),
        setActivitySuggestions: (suggestions) => dispatch({ type: WEATHER_ACTIONS.SET_ACTIVITY_SUGGESTIONS, payload: suggestions }),
        setClothingSuggestions: (suggestions) => dispatch({ type: WEATHER_ACTIONS.SET_CLOTHING_SUGGESTIONS, payload: suggestions }),
        clearAllData: () => dispatch({ type: WEATHER_ACTIONS.CLEAR_ALL_DATA }),
        updateLastUpdated: () => dispatch({ type: WEATHER_ACTIONS.UPDATE_LAST_UPDATED }),

        // Utility functions
        isLocationFavorite: (location) => {
            return state.favoriteLocations.some(
                fav => fav.city === location.city && fav.country === location.country
            );
        },

        getWeatherForLocation: (location) => {
            if (state.selectedLocation.city === location.city &&
                state.selectedLocation.country === location.country) {
                return state.currentWeather;
            }
            return null;
        }
    };

    return (
        <WeatherContext.Provider value={contextValue}>
            {children}
        </WeatherContext.Provider>
    );
};

// Custom hook to use weather context
export const useWeatherContext = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeatherContext must be used within a WeatherProvider');
    }
    return context;
};

export default WeatherContext;