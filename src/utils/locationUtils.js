// src/utils/locationUtils.js
import { GEOLOCATION_OPTIONS, ERROR_MESSAGES } from './constants.js';

/**
 * Get user's current position using the Geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<{lat: number, lon: number, accuracy: number}>}
 */
export const getCurrentPosition = (options = GEOLOCATION_OPTIONS) => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = ERROR_MESSAGES.LOCATION_ERROR;
                        break;
                }
                reject(new Error(errorMessage));
            },
            options
        );
    });
};

/**
 * Watch user's position for changes
 * @param {Function} callback - Callback function for position updates
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID for clearing the watch
 */
export const watchPosition = (callback, options = GEOLOCATION_OPTIONS) => {
    if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            callback(null, {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
            });
        },
        (error) => {
            let errorMessage;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
                default:
                    errorMessage = ERROR_MESSAGES.LOCATION_ERROR;
                    break;
            }
            callback(new Error(errorMessage), null);
        },
        options
    );
};

/**
 * Clear position watch
 * @param {number} watchId - Watch ID returned by watchPosition
 */
export const clearWatch = (watchId) => {
    if (navigator.geolocation && watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 * @param {number} radians - Radians to convert
 * @returns {number} Degrees
 */
export const toDegrees = (radians) => {
    return radians * (180 / Math.PI);
};

/**
 * Get compass direction from degrees
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Compass direction
 */
export const getCompassDirection = (degrees) => {
    const directions = [
        'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];

    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} precision - Number of decimal places
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lon, precision = 4) => {
    const latStr = `${Math.abs(lat).toFixed(precision)}°${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon).toFixed(precision)}°${lon >= 0 ? 'E' : 'W'}`;
    return `${latStr}, ${lonStr}`;
};

/**
 * Check if coordinates are within valid ranges
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if valid
 */
export const isValidCoordinates = (lat, lon) => {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180 &&
        !isNaN(lat) &&
        !isNaN(lon)
    );
};

/**
 * Get timezone offset for coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} Timezone identifier
 */
export const getTimezone = async (lat, lon) => {
    try {
        // Using a simple approximation based on longitude
        // For production, consider using a proper timezone API
        const offset = Math.round(lon / 15);
        return `UTC${offset >= 0 ? '+' : ''}${offset}`;
    } catch (error) {
        console.error('Error getting timezone:', error);
        return 'UTC';
    }
};

/**
 * Convert coordinates to a location object
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} name - Location name
 * @param {string} country - Country name
 * @param {string} state - State/region name
 * @returns {Object} Location object
 */
export const createLocationObject = (lat, lon, name = '', country = '', state = '') => {
    return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: name.trim(),
        country: country.trim(),
        state: state.trim(),
        displayName: formatLocationName(name, state, country),
        coordinates: formatCoordinates(lat, lon),
        id: `${lat.toFixed(4)}_${lon.toFixed(4)}`,
        timestamp: Date.now()
    };
};

/**
 * Format location name for display
 * @param {string} name - City name
 * @param {string} state - State/region name
 * @param {string} country - Country name
 * @returns {string} Formatted location name
 */
export const formatLocationName = (name, state = '', country = '') => {
    const parts = [name];

    if (state && state !== name) {
        parts.push(state);
    }

    if (country && country !== state) {
        parts.push(country);
    }

    return parts.filter(Boolean).join(', ');
};

/**
 * Check if user has granted geolocation permission
 * @returns {Promise<string>} Permission state
 */
export const checkGeolocationPermission = async () => {
    if (!navigator.permissions) {
        return 'unknown';
    }

    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
        console.error('Error checking geolocation permission:', error);
        return 'unknown';
    }
};

/**
 * Request geolocation permission
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestGeolocationPermission = async () => {
    try {
        const position = await getCurrentPosition();
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Get device location accuracy description
 * @param {number} accuracy - Accuracy in meters
 * @returns {string} Accuracy description
 */
export const getAccuracyDescription = (accuracy) => {
    if (accuracy <= 10) return 'Very High';
    if (accuracy <= 50) return 'High';
    if (accuracy <= 100) return 'Medium';
    if (accuracy <= 500) return 'Low';
    return 'Very Low';
};

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Start latitude
 * @param {number} lon1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lon2 - End longitude
 * @returns {number} Bearing in degrees
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
};

/**
 * Get cardinal direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Cardinal direction
 */
export const getCardinalDirection = (bearing) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
};

/**
 * Find nearest location from an array of locations
 * @param {Object} currentLocation - Current location {lat, lon}
 * @param {Array} locations - Array of location objects
 * @returns {Object|null} Nearest location object
 */
export const findNearestLocation = (currentLocation, locations) => {
    if (!locations.length) return null;

    let nearest = null;
    let minDistance = Infinity;

    locations.forEach(location => {
        const distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lon,
            location.lat,
            location.lon
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = { ...location, distance };
        }
    });

    return nearest;
};

/**
 * Sort locations by distance from current location
 * @param {Object} currentLocation - Current location {lat, lon}
 * @param {Array} locations - Array of location objects
 * @returns {Array} Sorted locations with distance
 */
export const sortLocationsByDistance = (currentLocation, locations) => {
    return locations
        .map(location => ({
            ...location,
            distance: calculateDistance(
                currentLocation.lat,
                currentLocation.lon,
                location.lat,
                location.lon
            )
        }))
        .sort((a, b) => a.distance - b.distance);
};

/**
 * Check if location is within a radius of another location
 * @param {Object} location1 - First location {lat, lon}
 * @param {Object} location2 - Second location {lat, lon}
 * @param {number} radius - Radius in kilometers
 * @returns {boolean} True if within radius
 */
export const isWithinRadius = (location1, location2, radius) => {
    const distance = calculateDistance(
        location1.lat,
        location1.lon,
        location2.lat,
        location2.lon
    );
    return distance <= radius;
};

/**
 * Get location bounds for a given center and radius
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radius - Radius in kilometers
 * @returns {Object} Bounds object {north, south, east, west}
 */
export const getLocationBounds = (lat, lon, radius) => {
    const R = 6371; // Earth's radius in km
    const latRad = toRadians(lat);
    const lonRad = toRadians(lon);

    const deltaLat = radius / R;
    const deltaLon = Math.asin(Math.sin(deltaLat) / Math.cos(latRad));

    return {
        north: toDegrees(latRad + deltaLat),
        south: toDegrees(latRad - deltaLat),
        east: toDegrees(lonRad + deltaLon),
        west: toDegrees(lonRad - deltaLon)
    };
};

/**
 * Convert location to URL-safe string
 * @param {Object} location - Location object
 * @returns {string} URL-safe location string
 */
export const locationToString = (location) => {
    return `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
};

/**
 * Parse location from URL-safe string
 * @param {string} locationString - Location string
 * @returns {Object|null} Location object or null if invalid
 */
export const locationFromString = (locationString) => {
    try {
        const [lat, lon] = locationString.split(',').map(parseFloat);
        if (isValidCoordinates(lat, lon)) {
            return { lat, lon };
        }
        return null;
    } catch (error) {
        return null;
    }
};

/**
 * Get location hash for caching purposes
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} precision - Precision for rounding
 * @returns {string} Location hash
 */
export const getLocationHash = (lat, lon, precision = 2) => {
    const roundedLat = Math.round(lat * Math.pow(10, precision)) / Math.pow(10, precision);
    const roundedLon = Math.round(lon * Math.pow(10, precision)) / Math.pow(10, precision);
    return `${roundedLat}_${roundedLon}`;
};

export default {
    getCurrentPosition,
    watchPosition,
    clearWatch,
    calculateDistance,
    getCompassDirection,
    formatCoordinates,
    isValidCoordinates,
    getTimezone,
    createLocationObject,
    formatLocationName,
    checkGeolocationPermission,
    requestGeolocationPermission,
    getAccuracyDescription,
    calculateBearing,
    getCardinalDirection,
    findNearestLocation,
    sortLocationsByDistance,
    isWithinRadius,
    getLocationBounds,
    locationToString,
    locationFromString,
    getLocationHash
};