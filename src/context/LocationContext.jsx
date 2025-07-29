// src/context/LocationContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isValidCoordinates,
    createLocationObject,
    calculateDistance
} from '../utils/locationUtils.js';
import {
    getLastLocation,
    setLastLocation,
    getFavorites,
    addToSearchHistory
} from '../utils/storageUtils.js';

// Action types
const LOCATION_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_CURRENT_LOCATION: 'SET_CURRENT_LOCATION',
    SET_SELECTED_LOCATION: 'SET_SELECTED_LOCATION',
    SET_ERROR: 'SET_ERROR',
    SET_PERMISSION: 'SET_PERMISSION',
    SET_AUTO_LOCATION: 'SET_AUTO_LOCATION',
    UPDATE_FAVORITES: 'UPDATE_FAVORITES',
    SET_WATCH_ID: 'SET_WATCH_ID',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
    currentLocation: null,
    selectedLocation: null,
    isLoading: false,
    error: null,
    permission: 'prompt',
    autoLocation: true,
    favorites: [],
    watchId: null,
    lastUpdate: null
};

// Reducer function
function locationReducer(state, action) {
    switch (action.type) {
        case LOCATION_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: action.payload ? null : state.error
            };

        case LOCATION_ACTIONS.SET_CURRENT_LOCATION:
            return {
                ...state,
                currentLocation: action.payload,
                selectedLocation: state.selectedLocation || action.payload,
                isLoading: false,
                error: null,
                lastUpdate: Date.now()
            };

        case LOCATION_ACTIONS.SET_SELECTED_LOCATION:
            return {
                ...state,
                selectedLocation: action.payload,
                error: null
            };

        case LOCATION_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case LOCATION_ACTIONS.SET_PERMISSION:
            return {
                ...state,
                permission: action.payload
            };

        case LOCATION_ACTIONS.SET_AUTO_LOCATION:
            return {
                ...state,
                autoLocation: action.payload
            };

        case LOCATION_ACTIONS.UPDATE_FAVORITES:
            return {
                ...state,
                favorites: action.payload
            };

        case LOCATION_ACTIONS.SET_WATCH_ID:
            return {
                ...state,
                watchId: action.payload
            };

        case LOCATION_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}

// Create context
const LocationContext = createContext();

// Context provider component
export function LocationProvider({ children }) {
    const [state, dispatch] = useReducer(locationReducer, initialState);

    // Initialize location on mount
    useEffect(() => {
        initializeLocation();
        loadFavorites();
    }, []);

    // Watch for location changes when auto location is enabled
    useEffect(() => {
        if (state.autoLocation && state.permission === 'granted') {
            startLocationWatch();
        } else {
            stopLocationWatch();
        }

        return () => stopLocationWatch();
    }, [state.autoLocation, state.permission]);

    /**
     * Initialize location from storage or get current position
     */
    const initializeLocation = async () => {
        try {
            // Try to get last known location from storage
            const lastLocation = getLastLocation();
            if (lastLocation && isValidCoordinates(lastLocation.lat, lastLocation.lon)) {
                dispatch({
                    type: LOCATION_ACTIONS.SET_SELECTED_LOCATION,
                    payload: lastLocation
                });
            }

            // Check geolocation permission
            if (navigator.permissions) {
                try {
                    const permission = await navigator.permissions.query({ name: 'geolocation' });
                    dispatch({
                        type: LOCATION_ACTIONS.SET_PERMISSION,
                        payload: permission.state
                    });

                    // Listen for permission changes
                    permission.onchange = () => {
                        dispatch({
                            type: LOCATION_ACTIONS.SET_PERMISSION,
                            payload: permission.state
                        });
                    };
                } catch (error) {
                    console.warn('Could not check geolocation permission:', error);
                }
            }

            // Get current location if auto location is enabled
            if (state.autoLocation) {
                await getCurrentLocationAsync();
            }
        } catch (error) {
            console.error('Error initializing location:', error);
        }
    };

    /**
     * Load favorites from storage
     */
    const loadFavorites = () => {
        const favorites = getFavorites();
        dispatch({
            type: LOCATION_ACTIONS.UPDATE_FAVORITES,
            payload: favorites
        });
    };

    /**
     * Get current location
     */
    const getCurrentLocationAsync = async () => {
        dispatch({ type: LOCATION_ACTIONS.SET_LOADING, payload: true });

        try {
            const position = await getCurrentPosition();
            const location = createLocationObject(
                position.lat,
                position.lon,
                'Current Location',
                '',
                ''
            );

            dispatch({
                type: LOCATION_ACTIONS.SET_CURRENT_LOCATION,
                payload: location
            });

            // Save to storage
            setLastLocation(location);

            return location;
        } catch (error) {
            console.error('Error getting current location:', error);
            dispatch({
                type: LOCATION_ACTIONS.SET_ERROR,
                payload: error.message
            });
            throw error;
        }
    };

    /**
     * Select a location
     */
    const selectLocation = (location) => {
        if (!location || !isValidCoordinates(location.lat, location.lon)) {
            dispatch({
                type: LOCATION_ACTIONS.SET_ERROR,
                payload: 'Invalid location data'
            });
            return;
        }

        dispatch({
            type: LOCATION_ACTIONS.SET_SELECTED_LOCATION,
            payload: location
        });

        // Save to storage
        setLastLocation(location);

        // Add to search history
        addToSearchHistory(location);
    };

    /**
     * Search for locations by query
     */
    const searchLocations = async (query) => {
        // This would typically call your geocoding API
        // For now, return a placeholder implementation
        try {
            // You would implement this with your geocoding API
            const results = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
            ).then(res => res.json());

            return results.map(result => createLocationObject(
                result.lat,
                result.lon,
                result.name,
                result.country,
                result.state
            ));
        } catch (error) {
            console.error('Error searching locations:', error);
            throw error;
        }
    };

    /**
     * Start watching location changes
     */
    const startLocationWatch = () => {
        if (state.watchId) return; // Already watching

        try {
            const watchId = watchPosition((error, position) => {
                if (error) {
                    console.error('Location watch error:', error);
                    dispatch({
                        type: LOCATION_ACTIONS.SET_ERROR,
                        payload: error.message
                    });
                    return;
                }

                const location = createLocationObject(
                    position.lat,
                    position.lon,
                    'Current Location',
                    '',
                    ''
                );

                // Only update if location has changed significantly (>100m)
                if (!state.currentLocation ||
                    calculateDistance(
                        state.currentLocation.lat,
                        state.currentLocation.lon,
                        position.lat,
                        position.lon
                    ) > 0.1) {
                    dispatch({
                        type: LOCATION_ACTIONS.SET_CURRENT_LOCATION,
                        payload: location
                    });
                    setLastLocation(location);
                }
            });

            dispatch({
                type: LOCATION_ACTIONS.SET_WATCH_ID,
                payload: watchId
            });
        } catch (error) {
            console.error('Error starting location watch:', error);
            dispatch({
                type: LOCATION_ACTIONS.SET_ERROR,
                payload: error.message
            });
        }
    };

    /**
     * Stop watching location changes
     */
    const stopLocationWatch = () => {
        if (state.watchId) {
            clearWatch(state.watchId);
            dispatch({
                type: LOCATION_ACTIONS.SET_WATCH_ID,
                payload: null
            });
        }
    };

    /**
     * Toggle auto location
     */
    const toggleAutoLocation = (enabled) => {
        dispatch({
            type: LOCATION_ACTIONS.SET_AUTO_LOCATION,
            payload: enabled
        });

        if (enabled) {
            getCurrentLocationAsync();
        } else {
            stopLocationWatch();
        }
    };

    /**
     * Clear error
     */
    const clearError = () => {
        dispatch({ type: LOCATION_ACTIONS.CLEAR_ERROR });
    };

    /**
     * Refresh current location
     */
    const refreshLocation = async () => {
        return await getCurrentLocationAsync();
    };

    /**
     * Get distance to current location
     */
    const getDistanceToCurrentLocation = (location) => {
        if (!state.currentLocation || !location) return null;

        return calculateDistance(
            state.currentLocation.lat,
            state.currentLocation.lon,
            location.lat,
            location.lon
        );
    };

    /**
     * Check if location is current location
     */
    const isCurrentLocation = (location) => {
        if (!state.currentLocation || !location) return false;

        return (
            Math.abs(state.currentLocation.lat - location.lat) < 0.001 &&
            Math.abs(state.currentLocation.lon - location.lon) < 0.001
        );
    };

    /**
     * Get location display name
     */
    const getLocationDisplayName = (location) => {
        if (!location) return 'Unknown Location';

        if (isCurrentLocation(location)) {
            return 'Current Location';
        }

        return location.displayName || location.name || 'Unknown Location';
    };

    // Context value
    const value = {
        // State
        ...state,

        // Actions
        getCurrentLocation: getCurrentLocationAsync,
        selectLocation,
        searchLocations,
        toggleAutoLocation,
        clearError,
        refreshLocation,
        startLocationWatch,
        stopLocationWatch,

        // Utilities
        getDistanceToCurrentLocation,
        isCurrentLocation,
        getLocationDisplayName,
        loadFavorites
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

// Custom hook to use location context
export function useLocation() {
    const context = useContext(LocationContext);

    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }

    return context;
}

// Export context for advanced usage
export { LocationContext };

export default LocationProvider;