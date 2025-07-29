// src/utils/constants.js

// API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    AIR_QUALITY_URL: 'https://api.openweathermap.org/data/2.5/air_pollution',
    ONECALL_URL: 'https://api.openweathermap.org/data/3.0/onecall',
    MAP_URL: 'https://tile.openweathermap.org/map',
    TIMEOUT: 10000
};

// Weather Conditions
export const WEATHER_CONDITIONS = {
    CLEAR: 'clear sky',
    CLOUDS: 'few clouds',
    SCATTERED_CLOUDS: 'scattered clouds',
    BROKEN_CLOUDS: 'broken clouds',
    SHOWER_RAIN: 'shower rain',
    RAIN: 'rain',
    THUNDERSTORM: 'thunderstorm',
    SNOW: 'snow',
    MIST: 'mist',
    FOG: 'fog'
};

// Air Quality Index Levels
export const AQI_LEVELS = {
    1: { label: 'Good', color: '#00e400', description: 'Air quality is good' },
    2: { label: 'Fair', color: '#ffff00', description: 'Air quality is acceptable' },
    3: { label: 'Moderate', color: '#ff7e00', description: 'Air quality may be unhealthy for sensitive groups' },
    4: { label: 'Poor', color: '#ff0000', description: 'Air quality is unhealthy' },
    5: { label: 'Very Poor', color: '#8f3f97', description: 'Air quality is very unhealthy' }
};

// UV Index Levels
export const UV_INDEX_LEVELS = {
    LOW: { min: 0, max: 2, label: 'Low', color: '#289500', description: 'No protection needed' },
    MODERATE: { min: 3, max: 5, label: 'Moderate', color: '#f7e400', description: 'Some protection required' },
    HIGH: { min: 6, max: 7, label: 'High', color: '#f85900', description: 'Protection essential' },
    VERY_HIGH: { min: 8, max: 10, label: 'Very High', color: '#d8001d', description: 'Extra protection needed' },
    EXTREME: { min: 11, max: 20, label: 'Extreme', color: '#6b49c8', description: 'Avoid being outside' }
};

// Temperature Units
export const TEMPERATURE_UNITS = {
    CELSIUS: 'metric',
    FAHRENHEIT: 'imperial',
    KELVIN: 'standard'
};

// Wind Speed Units
export const WIND_SPEED_UNITS = {
    METRIC: 'm/s',
    IMPERIAL: 'mph',
    BEAUFORT: 'bft'
};

// Pressure Units
export const PRESSURE_UNITS = {
    HPA: 'hPa',
    INHG: 'inHg',
    MMHG: 'mmHg'
};

// Time Formats
export const TIME_FORMATS = {
    HOUR_12: 'h:mm A',
    HOUR_24: 'HH:mm',
    DATE_SHORT: 'MMM DD',
    DATE_LONG: 'MMMM DD, YYYY',
    DATE_TIME: 'MMM DD, h:mm A'
};

// Storage Keys
export const STORAGE_KEYS = {
    THEME: 'weather_app_theme',
    UNITS: 'weather_app_units',
    FAVORITES: 'weather_app_favorites',
    SEARCH_HISTORY: 'weather_app_search_history',
    NOTIFICATIONS: 'weather_app_notifications',
    USER_PREFERENCES: 'weather_app_preferences',
    LAST_LOCATION: 'weather_app_last_location',
    CACHE_PREFIX: 'weather_cache_'
};

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
    CURRENT_WEATHER: 10 * 60 * 1000, // 10 minutes
    FORECAST: 30 * 60 * 1000, // 30 minutes
    AIR_QUALITY: 60 * 60 * 1000, // 1 hour
    GEOCODING: 24 * 60 * 60 * 1000, // 24 hours
    HISTORICAL: 12 * 60 * 60 * 1000 // 12 hours
};

// Default Settings
export const DEFAULT_SETTINGS = {
    temperatureUnit: 'celsius',
    windSpeedUnit: 'metric',
    pressureUnit: 'hPa',
    timeFormat: '12h',
    theme: 'auto',
    notifications: {
        weather_alerts: true,
        rain_alerts: true,
        temperature_alerts: false,
        air_quality_alerts: true
    },
    autoLocation: true,
    showHourlyForecast: true,
    showAirQuality: true,
    showUVIndex: true
};

// Notification Types
export const NOTIFICATION_TYPES = {
    WEATHER_ALERT: 'weather_alert',
    RAIN_ALERT: 'rain_alert',
    TEMPERATURE_ALERT: 'temperature_alert',
    AIR_QUALITY_ALERT: 'air_quality_alert',
    SEVERE_WEATHER: 'severe_weather'
};

// Weather Alert Severities
export const ALERT_SEVERITIES = {
    MINOR: { level: 1, color: '#ffeb3b', label: 'Minor' },
    MODERATE: { level: 2, color: '#ff9800', label: 'Moderate' },
    SEVERE: { level: 3, color: '#f44336', label: 'Severe' },
    EXTREME: { level: 4, color: '#9c27b0', label: 'Extreme' }
};

// Map Layer Types
export const MAP_LAYERS = {
    PRECIPITATION: 'precipitation_new',
    CLOUDS: 'clouds_new',
    PRESSURE: 'pressure_new',
    WIND: 'wind_new',
    TEMPERATURE: 'temp_new'
};

// Activity Recommendations
export const ACTIVITY_RECOMMENDATIONS = {
    SUNNY: ['Beach visit', 'Outdoor sports', 'Picnic', 'Hiking', 'Cycling'],
    CLOUDY: ['Museum visit', 'Shopping', 'Indoor activities', 'Light walking'],
    RAINY: ['Indoor dining', 'Movies', 'Reading', 'Gym workout', 'Cooking'],
    SNOWY: ['Skiing', 'Snowboarding', 'Hot cocoa', 'Indoor games', 'Fireplace time'],
    WINDY: ['Kite flying', 'Sailing', 'Indoor activities', 'Wind sports']
};

// Clothing Suggestions
export const CLOTHING_SUGGESTIONS = {
    VERY_COLD: { temp: -10, items: ['Heavy coat', 'Gloves', 'Warm hat', 'Boots', 'Layers'] },
    COLD: { temp: 0, items: ['Winter jacket', 'Long pants', 'Closed shoes', 'Light gloves'] },
    COOL: { temp: 10, items: ['Light jacket', 'Long sleeves', 'Jeans', 'Sneakers'] },
    MILD: { temp: 20, items: ['T-shirt', 'Light cardigan', 'Comfortable pants'] },
    WARM: { temp: 25, items: ['Light clothing', 'Shorts', 'T-shirt', 'Sandals'] },
    HOT: { temp: 30, items: ['Minimal clothing', 'Shorts', 'Tank top', 'Hat', 'Sunscreen'] }
};

// Geolocation Options
export const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    API_ERROR: 'Unable to fetch weather data. Please try again.',
    LOCATION_ERROR: 'Unable to get your location. Please enable location services.',
    GEOLOCATION_DENIED: 'Location access denied. Please search for a city manually.',
    CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    SERVER_ERROR: 'Server error. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOCATION_UPDATED: 'Location updated successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
    NOTIFICATION_SENT: 'Notification sent successfully',
    FAVORITE_ADDED: 'City added to favorites',
    FAVORITE_REMOVED: 'City removed from favorites'
};

// Animation Durations
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
};

// Breakpoints
export const BREAKPOINTS = {
    MOBILE: '640px',
    TABLET: '768px',
    DESKTOP: '1024px',
    LARGE: '1280px'
};

// Theme Colors
export const THEME_COLORS = {
    PRIMARY: {
        light: '#3b82f6',
        dark: '#60a5fa'
    },
    SECONDARY: {
        light: '#6b7280',
        dark: '#9ca3af'
    },
    SUCCESS: {
        light: '#10b981',
        dark: '#34d399'
    },
    WARNING: {
        light: '#f59e0b',
        dark: '#fbbf24'
    },
    ERROR: {
        light: '#ef4444',
        dark: '#f87171'
    }
};

export default {
    API_CONFIG,
    WEATHER_CONDITIONS,
    AQI_LEVELS,
    UV_INDEX_LEVELS,
    TEMPERATURE_UNITS,
    STORAGE_KEYS,
    CACHE_DURATION,
    DEFAULT_SETTINGS,
    NOTIFICATION_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
};