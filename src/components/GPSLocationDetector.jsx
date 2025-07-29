// src/components/GPSLocationDetector.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Loader, AlertCircle } from 'lucide-react';

const GPSLocationDetector = ({ onLocationDetected, onError, autoDetect = false }) => {
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            setHasPermission(false);
            return;
        }

        // Check permission status if available
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' })
                .then(permission => {
                    setHasPermission(permission.state === 'granted');

                    if (autoDetect && permission.state === 'granted') {
                        detectLocation();
                    }
                })
                .catch(() => {
                    // Permissions API not available, but geolocation might still work
                    setHasPermission(null);
                });
        }
    }, [autoDetect]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by this browser';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        setIsDetecting(true);
        setError(null);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 300000, // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setIsDetecting(false);
                setHasPermission(true);

                // Call the parent callback with coordinates
                onLocationDetected?.({
                    latitude,
                    longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp)
                });
            },
            (geoError) => {
                setIsDetecting(false);
                let errorMessage;

                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        setHasPermission(false);
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case geoError.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = 'An unknown error occurred while retrieving location';
                        break;
                }

                setError(errorMessage);
                onError?.(errorMessage);
            },
            options
        );
    };

    const requestPermission = async () => {
        try {
            // For browsers that support permissions API
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state === 'denied') {
                    setError('Location permission is denied. Please enable it in your browser settings.');
                    return;
                }
            }

            // Try to detect location (this will trigger permission request if needed)
            detectLocation();
        } catch (err) {
            setError('Failed to request location permission');
        }
    };

    return (
        <div className="gps-location-detector">
            {hasPermission === false && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Location access is required to detect your current location automatically.
                        </p>
                    </div>
                    <button
                        onClick={requestPermission}
                        className="mt-2 text-sm text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                    >
                        Enable Location Access
                    </button>
                </div>
            )}

            <button
                onClick={detectLocation}
                disabled={isDetecting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDetecting ? (
                    <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Detecting Location...</span>
                    </>
                ) : (
                    <>
                        <MapPin className="w-4 h-4" />
                        <span>Use My Location</span>
                    </>
                )}
            </button>

            {error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GPSLocationDetector;