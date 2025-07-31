import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserContext } from '../context/UserContext';

// Geolocation hook for managing user location
export const useGeolocation = () => {
    const { locationPreferences, privacy } = useUserContext();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [supported, setSupported] = useState(false);
    const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
    const watchIdRef = useRef(null);
    const timeoutRef = useRef(null);

    // Check if geolocation is supported
    useEffect(() => {
        setSupported('geolocation' in navigator);
    }, []);

    // Geolocation options
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 300000, // 5 minutes cache
    };

    // Handle geolocation success
    const handleSuccess = useCallback((position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;

        setLocation({
            lat: latitude,
            lon: longitude,
            accuracy,
            timestamp,
            source: 'gps'
        });
        setError(null);
        setLoading(false);
    }, []);

    // Handle geolocation error
    const handleError = useCallback((err) => {
        let errorMessage = 'Location access failed';

        switch (err.code) {
            case err.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                setPermission('denied');
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
            case err.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            default:
                errorMessage = 'An unknown error occurred while retrieving location';
                break;
        }

        setError({
            code: err.code,
            message: errorMessage,
            timestamp: Date.now()
        });
        setLoading(false);
    }, []);

    // Get current position once
    const getCurrentPosition = useCallback(async () => {
        if (!supported) {
            setError({
                code: 'NOT_SUPPORTED',
                message: 'Geolocation is not supported by this browser',
                timestamp: Date.now()
            });
            return null;
        }

        if (!privacy.shareLocation) {
            setError({
                code: 'PRIVACY_BLOCKED',
                message: 'Location sharing disabled in privacy settings',
                timestamp: Date.now()
            });
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Check permission first
            if ('permissions' in navigator) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                setPermission(permissionStatus.state);

                if (permissionStatus.state === 'denied') {
                    throw new Error('Location permission denied');
                }
            }

            return new Promise((resolve, reject) => {
                // Set timeout
                timeoutRef.current = setTimeout(() => {
                    reject(new Error('Location request timed out'));
                }, geoOptions.timeout);

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        clearTimeout(timeoutRef.current);
                        handleSuccess(position);
                        resolve({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp
                        });
                    },
                    (err) => {
                        clearTimeout(timeoutRef.current);
                        handleError(err);
                        reject(err);
                    },
                    geoOptions
                );
            });
        } catch (err) {
            handleError({
                code: 'UNKNOWN',
                message: err.message
            });
            return null;
        }
    }, [supported, privacy.shareLocation, handleSuccess, handleError, geoOptions]);

    // Start watching position
    const startWatching = useCallback(() => {
        if (!supported || !privacy.shareLocation) {
            return;
        }

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        setLoading(true);
        setError(null);

        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            geoOptions
        );

        return watchIdRef.current;
    }, [supported, privacy.shareLocation, handleSuccess, handleError, geoOptions]);

    // Stop watching position
    const stopWatching = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setLoading(false);
    }, []);

    // Clear location data
    const clearLocation = useCallback(() => {
        setLocation(null);
        setError(null);
        stopWatching();
    }, [stopWatching]);

    // Get location from IP (fallback)
    const getLocationFromIP = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error('Failed to get location from IP');
            }

            const data = await response.json();

            if (data.latitude && data.longitude) {
                const ipLocation = {
                    lat: data.latitude,
                    lon: data.longitude,
                    city: data.city,
                    region: data.region,
                    country: data.country_name,
                    countryCode: data.country_code,
                    accuracy: 10000, // IP location is less accurate
                    timestamp: Date.now(),
                    source: 'ip'
                };

                setLocation(ipLocation);
                return ipLocation;
            } else {
                throw new Error('Invalid location data from IP service');
            }
        } catch (error) {
            setError({
                code: 'IP_LOCATION_FAILED',
                message: `Failed to get location from IP: ${error.message}`,
                timestamp: Date.now()
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Request permission explicitly
    const requestPermission = useCallback(async () => {
        if (!supported) {
            return 'not-supported';
        }

        try {
            if ('permissions' in navigator) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                setPermission(permissionStatus.state);
                return permissionStatus.state;
            } else {
                // Fallback: try to get position to trigger permission prompt
                await getCurrentPosition();
                return permission;
            }
        } catch (error) {
            console.error('Error requesting geolocation permission:', error);
            return 'error';
        }
    }, [supported, getCurrentPosition, permission]);

    // Auto-detect location based on user preferences
    const autoDetectLocation = useCallback(async () => {
        if (!locationPreferences.useCurrentLocation) {
            return null;
        }

        try {
            // Try GPS first
            const gpsLocation = await getCurrentPosition();
            if (gpsLocation) {
                return gpsLocation;
            }
        } catch (error) {
            console.log('GPS location failed, trying IP fallback:', error);
        }

        // Fallback to IP location
        return await getLocationFromIP();
    }, [locationPreferences.useCurrentLocation, getCurrentPosition, getLocationFromIP]);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in kilometers
    }, []);

    // Check if location has changed significantly
    const hasLocationChanged = useCallback((newLocation, threshold = 1) => {
        if (!location || !newLocation) {
            return true;
        }

        const distance = calculateDistance(
            location.lat,
            location.lon,
            newLocation.lat,
            newLocation.lon
        );

        return distance > threshold; // Changed if moved more than threshold km
    }, [location, calculateDistance]);

    // Format coordinates for display
    const formatCoordinates = useCallback((lat, lon, precision = 4) => {
        if (typeof lat !== 'number' || typeof lon !== 'number') {
            return 'Invalid coordinates';
        }

        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';

        return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lon).toFixed(precision)}°${lonDir}`;
    }, []);

    // Get location accuracy description
    const getAccuracyDescription = useCallback((accuracy) => {
        if (!accuracy) return 'Unknown accuracy';

        if (accuracy < 10) return 'Very high accuracy';
        if (accuracy < 100) return 'High accuracy';
        if (accuracy < 1000) return 'Medium accuracy';
        if (accuracy < 10000) return 'Low accuracy';
        return 'Very low accuracy';
    }, []);

    // Check if location data is stale
    const isLocationStale = useCallback((maxAge = 300000) => { // 5 minutes default
        if (!location || !location.timestamp) {
            return true;
        }

        return (Date.now() - location.timestamp) > maxAge;
    }, [location]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopWatching();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [stopWatching]);

    // Listen for permission changes
    useEffect(() => {
        if ('permissions' in navigator && supported) {
            navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
                setPermission(permissionStatus.state);

                permissionStatus.onchange = () => {
                    setPermission(permissionStatus.state);
                };
            }).catch(() => {
                // Ignore permission query errors
            });
        }
    }, [supported]);

    return {
        // State
        location,
        loading,
        error,
        supported,
        permission,

        // Actions
        getCurrentPosition,
        startWatching,
        stopWatching,
        clearLocation,
        getLocationFromIP,
        requestPermission,
        autoDetectLocation,

        // Utilities
        calculateDistance,
        hasLocationChanged,
        formatCoordinates,
        getAccuracyDescription,
        isLocationStale,

        // Status checks
        isPermissionGranted: permission === 'granted',
        isPermissionDenied: permission === 'denied',
        hasLocation: !!location,
        isWatching: !!watchIdRef.current,
        canUseLocation: supported && privacy.shareLocation && permission !== 'denied',

        // Location info
        coordinates: location ? { lat: location.lat, lon: location.lon } : null,
        accuracy: location?.accuracy,
        lastUpdate: location?.timestamp,
        locationSource: location?.source,

        // Error helpers
        clearError: () => setError(null),
        retryLocation: () => {
            if (locationPreferences.useCurrentLocation) {
                autoDetectLocation();
            }
        }
    };
};

export default useGeolocation;