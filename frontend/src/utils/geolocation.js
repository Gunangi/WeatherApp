// geolocation.js - Location detection utilities

class GeolocationService {
    constructor() {
        this.watchId = null;
        this.lastKnownPosition = null;
        this.isWatching = false;
    }

    /**
     * Get current position using GPS
     * @param {Object} options - Geolocation options
     * @returns {Promise<Object>} Position coordinates
     */
    getCurrentPosition(options = {}) {
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        };

        const finalOptions = { ...defaultOptions, ...options };

        return new Promise((resolve, reject) => {
            if (!this.isGeolocationSupported()) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };

                    this.lastKnownPosition = coords;
                    resolve(coords);
                },
                (error) => {
                    reject(this.handleGeolocationError(error));
                },
                finalOptions
            );
        });
    }

    /**
     * Watch position changes
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback - Error callback function
     * @param {Object} options - Geolocation options
     * @returns {number} Watch ID
     */
    watchPosition(successCallback, errorCallback, options = {}) {
        if (!this.isGeolocationSupported()) {
            errorCallback(new Error('Geolocation is not supported'));
            return null;
        }

        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000 // 1 minute
        };

        const finalOptions = { ...defaultOptions, ...options };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp
                };

                this.lastKnownPosition = coords;
                this.isWatching = true;
                successCallback(coords);
            },
            (error) => {
                errorCallback(this.handleGeolocationError(error));
            },
            finalOptions
        );

        return this.watchId;
    }

    /**
     * Stop watching position changes
     */
    clearWatch() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
        }
    }

    /**
     * Get position using IP-based geolocation as fallback
     * @returns {Promise<Object>} Approximate position
     */
    async getPositionByIP() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error('IP geolocation service unavailable');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.reason || 'IP geolocation failed');
            }

            return {
                lat: parseFloat(data.latitude),
                lon: parseFloat(data.longitude),
                city: data.city,
                region: data.region,
                country: data.country_name,
                countryCode: data.country,
                accuracy: 10000, // IP-based location is less accurate
                source: 'ip',
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('IP geolocation error:', error);
            throw new Error('Failed to get location from IP address');
        }
    }

    /**
     * Get location with automatic fallback
     * Tries GPS first, falls back to IP-based location
     * @param {Object} options - Geolocation options
     * @returns {Promise<Object>} Position coordinates
     */
    async getLocationWithFallback(options = {}) {
        try {
            // Try GPS first
            const position = await this.getCurrentPosition(options);
            return { ...position, source: 'gps' };
        } catch (gpsError) {
            console.warn('GPS location failed, trying IP fallback:', gpsError.message);

            try {
                // Fallback to IP-based location
                const ipPosition = await this.getPositionByIP();
                return ipPosition;
            } catch (ipError) {
                console.error('All location methods failed:', ipError.message);

                // Return default location (you can customize this)
                return this.getDefaultLocation();
            }
        }
    }

    /**
     * Reverse geocoding - get address from coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Address information
     */
    async reverseGeocode(lat, lon) {
        try {
            // Using OpenStreetMap Nominatim (free alternative to Google)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error('Reverse geocoding service unavailable');
            }

            const data = await response.json();

            return {
                displayName: data.display_name,
                address: {
                    city: data.address?.city || data.address?.town || data.address?.village,
                    state: data.address?.state,
                    country: data.address?.country,
                    countryCode: data.address?.country_code,
                    postcode: data.address?.postcode,
                    road: data.address?.road,
                    neighbourhood: data.address?.neighbourhood
                },
                boundingBox: data.boundingbox,
                importance: data.importance
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw new Error('Failed to get address from coordinates');
        }
    }

    /**
     * Calculate distance between two points using Haversine formula
     * @param {number} lat1 - First point latitude
     * @param {number} lon1 - First point longitude
     * @param {number} lat2 - Second point latitude
     * @param {number} lon2 - Second point longitude
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Calculate bearing between two points
     * @param {number} lat1 - First point latitude
     * @param {number} lon1 - First point longitude
     * @param {number} lat2 - Second point latitude
     * @param {number} lon2 - Second point longitude
     * @returns {number} Bearing in degrees
     */
    calculateBearing(lat1, lon1, lat2, lon2) {
        const dLon = this.toRadians(lon2 - lon1);
        const lat1Rad = this.toRadians(lat1);
        const lat2Rad = this.toRadians(lat2);

        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

        const bearing = this.toDegrees(Math.atan2(y, x));
        return (bearing + 360) % 360; // Normalize to 0-360 degrees
    }

    /**
     * Check if geolocation is supported
     * @returns {boolean} True if supported
     */
    isGeolocationSupported() {
        return 'geolocation' in navigator;
    }

    /**
     * Get last known position
     * @returns {Object|null} Last known coordinates
     */
    getLastKnownPosition() {
        return this.lastKnownPosition;
    }

    /**
     * Check if currently watching position
     * @returns {boolean} True if watching
     */
    isCurrentlyWatching() {
        return this.isWatching;
    }

    /**
     * Handle geolocation errors
     * @param {GeolocationPositionError} error - Geolocation error
     * @returns {Error} Formatted error
     */
    handleGeolocationError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return new Error('Location access denied by user');
            case error.POSITION_UNAVAILABLE:
                return new Error('Location information is unavailable');
            case error.TIMEOUT:
                return new Error('Location request timed out');
            default:
                return new Error('An unknown error occurred while retrieving location');
        }
    }

    /**
     * Get default location (fallback when all methods fail)
     * @returns {Object} Default coordinates
     */
    getDefaultLocation() {
        // Default to New York City coordinates
        return {
            lat: 40.7128,
            lon: -74.0060,
            city: 'New York',
            country: 'United States',
            accuracy: 50000,
            source: 'default',
            timestamp: Date.now()
        };
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees - Degrees
     * @returns {number} Radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     * @param {number} radians - Radians
     * @returns {number} Degrees
     */
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Validate coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {boolean} True if valid
     */
    isValidCoordinate(lat, lon) {
        return (
            typeof lat === 'number' &&
            typeof lon === 'number' &&
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180 &&
            !isNaN(lat) && !isNaN(lon)
        );
    }

    /**
     * Format coordinates for display
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} precision - Decimal places
     * @returns {string} Formatted coordinates
     */
    formatCoordinates(lat, lon, precision = 4) {
        if (!this.isValidCoordinate(lat, lon)) {
            return 'Invalid coordinates';
        }

        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';

        return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lon).toFixed(precision)}°${lonDir}`;
    }

    /**
     * Get timezone offset for coordinates (approximate)
     * @param {number} lon - Longitude
     * @returns {number} Timezone offset in hours
     */
    getTimezoneOffset(lon) {
        // Rough approximation: 15 degrees per hour
        return Math.round(lon / 15);
    }
}

// Export singleton instance
const geolocation = new GeolocationService();
export default geolocation;

export { geolocation };