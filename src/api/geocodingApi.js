// geocodingApi.js - OpenWeatherMap Geocoding API utilities

const GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0';
const REVERSE_GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

// Get API key from environment variables
const getApiKey = () => {
    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY ||
        process.env.OPENWEATHER_API_KEY ||
        localStorage.getItem('openweather_api_key');

    if (!apiKey) {
        throw new Error('OpenWeatherMap API key not found. Please set REACT_APP_OPENWEATHER_API_KEY in your environment variables.');
    }

    return apiKey;
};

/**
 * Get latitude and longitude for a city name
 * @param {string} cityName - Name of the city (e.g., "Delhi", "London,UK", "New York,NY,US")
 * @param {number} limit - Number of locations to return (default: 5)
 * @returns {Promise<Array>} Array of location objects
 */
export const getCoordinatesFromCity = async (cityName, limit = 5) => {
    try {
        const apiKey = getApiKey();
        const encodedCityName = encodeURIComponent(cityName.trim());

        const url = `${GEOCODING_BASE_URL}/direct?q=${encodedCityName}&limit=${limit}&appid=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();

        // Transform the data to a more usable format
        return data.map(location => ({
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            country: location.country,
            state: location.state || '',
            localNames: location.local_names || {},
            displayName: `${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`
        }));

    } catch (error) {
        console.error('Error fetching coordinates:', error);
        throw error;
    }
};

/**
 * Get city name from latitude and longitude (Reverse Geocoding)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} limit - Number of locations to return (default: 1)
 * @returns {Promise<Array>} Array of location objects
 */
export const getCityFromCoordinates = async (lat, lon, limit = 1) => {
    try {
        const apiKey = getApiKey();

        // Validate coordinates
        if (lat < -90 || lat > 90) {
            throw new Error('Invalid latitude. Must be between -90 and 90.');
        }
        if (lon < -180 || lon > 180) {
            throw new Error('Invalid longitude. Must be between -180 and 180.');
        }

        const url = `${REVERSE_GEOCODING_BASE_URL}?lat=${lat}&lon=${lon}&limit=${limit}&appid=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();

        // Transform the data to a more usable format
        return data.map(location => ({
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            country: location.country,
            state: location.state || '',
            localNames: location.local_names || {},
            displayName: `${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`
        }));

    } catch (error) {
        console.error('Error fetching city name:', error);
        throw error;
    }
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<Object>} Object with lat and lon
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // Cache for 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let message;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out.';
                        break;
                    default:
                        message = 'An unknown error occurred while retrieving location.';
                        break;
                }
                reject(new Error(message));
            },
            options
        );
    });
};

/**
 * Get user's current location and city name
 * @returns {Promise<Object>} Object with coordinates and location details
 */
export const getCurrentLocationWithCity = async () => {
    try {
        const coordinates = await getCurrentLocation();
        const locationData = await getCityFromCoordinates(coordinates.lat, coordinates.lon);

        return {
            ...coordinates,
            locationData: locationData[0] || null
        };
    } catch (error) {
        console.error('Error getting current location with city:', error);
        throw error;
    }
};

/**
 * Search for cities with suggestions (for autocomplete)
 * @param {string} query - Search query
 * @param {number} limit - Number of suggestions to return
 * @returns {Promise<Array>} Array of city suggestions
 */
export const searchCities = async (query, limit = 5) => {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const suggestions = await getCoordinatesFromCity(query, limit);

        // Remove duplicates based on displayName
        const uniqueSuggestions = suggestions.filter((location, index, arr) =>
            arr.findIndex(item => item.displayName === location.displayName) === index
        );

        return uniqueSuggestions;
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
};

/**
 * Get coordinates for multiple cities at once
 * @param {Array<string>} cityNames - Array of city names
 * @returns {Promise<Array>} Array of location objects
 */
export const getMultipleCityCoordinates = async (cityNames) => {
    try {
        const promises = cityNames.map(cityName =>
            getCoordinatesFromCity(cityName, 1).then(results => ({
                query: cityName,
                result: results[0] || null
            }))
        );

        const results = await Promise.allSettled(promises);

        return results.map((result, index) => ({
            query: cityNames[index],
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value.result : null,
            error: result.status === 'rejected' ? result.reason.message : null
        }));
    } catch (error) {
        console.error('Error fetching multiple city coordinates:', error);
        throw error;
    }
};

/**
 * Validate if coordinates are within valid range
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if valid coordinates
 */
export const validateCoordinates = (lat, lon) => {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180 &&
        !isNaN(lat) && !isNaN(lon)
    );
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Format location display name
 * @param {Object} location - Location object
 * @returns {string} Formatted display name
 */
export const formatLocationName = (location) => {
    if (!location) return 'Unknown Location';

    const parts = [location.name];
    if (location.state && location.state !== location.name) {
        parts.push(location.state);
    }
    if (location.country) {
        parts.push(location.country);
    }

    return parts.join(', ');
};

/**
 * Cache management for location data
 */
export const LocationCache = {
    cache: new Map(),
    maxAge: 300000, // 5 minutes

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    },

    clear() {
        this.cache.clear();
    }
};