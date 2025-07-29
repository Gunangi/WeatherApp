import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = () => {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Geolocation options
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
    };

    // Get current position
    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const error = new Error('Geolocation is not supported by this browser');
                setError(error.message);
                reject(error);
                return;
            }

            setLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPosition(position);
                    setLoading(false);
                    resolve(position);
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred while retrieving location';
                            break;
                    }
                    setError(errorMessage);
                    setLoading(false);
                    reject(new Error(errorMessage));
                },
                options
            );
        });
    }, []);

    // Watch position changes
    const watchPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            return null;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setPosition(position);
                setError(null);
            },
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = 'An unknown error occurred while retrieving location';
                        break;
                }
                setError(errorMessage);
            },
            options
        );

        return watchId;
    }, []);

    // Clear watch
    const clearWatch = useCallback((watchId) => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Check if geolocation is available
    const isSupported = 'geolocation' in navigator;

    // Request permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            throw new Error('Geolocation is not supported');
        }

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return permission.state;
        } catch (error) {
            // Fallback for browsers that don't support permissions API
            try {
                await getCurrentLocation();
                return 'granted';
            } catch (geoError) {
                return 'denied';
            }
        }
    }, [getCurrentLocation, isSupported]);

    // Get distance between two coordinates (in kilometers)
    const getDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }, []);

    // Get coordinates from cached position or request new
    const getCoordinates = useCallback(async (forceRefresh = false) => {
        if (position && !forceRefresh) {
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
            };
        }

        const newPosition = await getCurrentLocation();
        return {
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
            accuracy: newPosition.coords.accuracy,
            timestamp: newPosition.timestamp
        };
    }, [position, getCurrentLocation]);

    // Format coordinates for display
    const formatCoordinates = useCallback((lat, lng, precision = 4) => {
        return {
            latitude: parseFloat(lat).toFixed(precision),
            longitude: parseFloat(lng).toFixed(precision),
            dms: {
                latitude: convertToDMS(lat, 'lat'),
                longitude: convertToDMS(lng, 'lng')
            }
        };
    }, []);

    // Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
    const convertToDMS = (coordinate, type) => {
        const absolute = Math.abs(coordinate);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

        const direction = type === 'lat'
            ? (coordinate >= 0 ? 'N' : 'S')
            : (coordinate >= 0 ? 'E' : 'W');

        return `${degrees}°${minutes}'${seconds}"${direction}`;
    };

    return {
        position,
        error,
        loading,
        isSupported,
        getCurrentLocation,
        watchPosition,
        clearWatch,
        requestPermission,
        getDistance,
        getCoordinates,
        formatCoordinates
    };
};