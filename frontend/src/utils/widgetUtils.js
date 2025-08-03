// src/utils/widgetUtils.js

/**
 * Widget utility functions for weather app
 */

// Default widget configurations
export const DEFAULT_WIDGETS = [
    {
        id: 'current-weather',
        name: 'Current Weather',
        enabled: true,
        position: 0,
        size: 'large',
        refreshInterval: 300000 // 5 minutes
    },
    {
        id: 'forecast',
        name: '5-Day Forecast',
        enabled: true,
        position: 1,
        size: 'medium',
        refreshInterval: 1800000 // 30 minutes
    },
    {
        id: 'metrics',
        name: 'Weather Metrics',
        enabled: true,
        position: 2,
        size: 'medium',
        refreshInterval: 300000
    },
    {
        id: 'air-quality',
        name: 'Air Quality',
        enabled: true,
        position: 3,
        size: 'medium',
        refreshInterval: 1800000
    },
    {
        id: 'uv-index',
        name: 'UV Index',
        enabled: true,
        position: 4,
        size: 'small',
        refreshInterval: 1800000
    },
    {
        id: 'sun-times',
        name: 'Sunrise/Sunset',
        enabled: true,
        position: 5,
        size: 'small',
        refreshInterval: 86400000 // 24 hours
    },
    {
        id: 'hourly',
        name: 'Hourly Forecast',
        enabled: true,
        position: 6,
        size: 'large',
        refreshInterval: 900000 // 15 minutes
    },
    {
        id: 'clothing',
        name: 'Clothing Suggestions',
        enabled: false,
        position: 7,
        size: 'medium',
        refreshInterval: 1800000
    },
    {
        id: 'activities',
        name: 'Activity Recommendations',
        enabled: false,
        position: 8,
        size: 'medium',
        refreshInterval: 1800000
    }
];

// Weather condition icon mapping
export const WEATHER_ICONS = {
    'clear': '☀️',
    'sunny': '☀️',
    'partly cloudy': '⛅',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'overcast': '☁️',
    'broken clouds': '☁️',
    'scattered clouds': '🌤️',
    'few clouds': '🌤️',
    'rain': '🌧️',
    'light rain': '🌦️',
    'moderate rain': '🌧️',
    'heavy rain': '🌧️',
    'drizzle': '🌦️',
    'showers': '🌦️',
    'thunderstorm': '⛈️',
    'storm': '⛈️',
    'snow': '❄️',
    'light snow': '🌨️',
    'heavy snow': '❄️',
    'sleet': '🌨️',
    'hail': '🌨️',
    'fog': '🌫️',
    'mist': '🌫️',
    'haze': '🌫️',
    'smoke': '🌫️',
    'dust': '🌫️',
    'sand': '🌫️',
    'tornado': '🌪️',
    'hurricane': '🌀',
    'typhoon': '🌀',
    'tropical storm': '🌀'
};

/**
 * Get weather icon for condition
 * @param {string} condition - Weather condition
 * @returns {string} Weather icon
 */
export const getWeatherIcon = (condition) => {
    if (!condition) return '☁️';

    const normalizedCondition = condition.toLowerCase().trim();

    // Direct match first
    if (WEATHER_ICONS[normalizedCondition]) {
        return WEATHER_ICONS[normalizedCondition];
    }

    // Partial matches
    if (normalizedCondition.includes('clear') || normalizedCondition.includes('sunny')) {
        return '☀️';
    }
    if (normalizedCondition.includes('cloud')) {
        if (normalizedCondition.includes('partly') || normalizedCondition.includes('few') || normalizedCondition.includes('scattered')) {
            return '⛅';
        }
        return '☁️';
    }
    if (normalizedCondition.includes('rain') || normalizedCondition.includes('shower') || normalizedCondition.includes('drizzle')) {
        if (normalizedCondition.includes('light')) return '🌦️';
        if (normalizedCondition.includes('heavy')) return '🌧️';
        return '🌧️';
    }
    if (normalizedCondition.includes('thunder') || normalizedCondition.includes('storm')) {
        return '⛈️';
    }
    if (normalizedCondition.includes('snow') || normalizedCondition.includes('sleet') || normalizedCondition.includes('hail')) {
        return '❄️';
    }
    if (normalizedCondition.includes('fog') || normalizedCondition.includes('mist') || normalizedCondition.includes('haze')) {
        return '🌫️';
    }

    return '☁️'; // Default fallback
};

/**
 * Get UV index classification and color
 * @param {number} uvIndex - UV index value
 * @returns {object} UV classification with label and class
 */
export const getUVClassification = (uvIndex) => {
    if (uvIndex <= 2) {
        return { label: 'Low', class: 'uv-low', color: '#10b981' };
    } else if (uvIndex <= 5) {
        return { label: 'Moderate', class: 'uv-moderate', color: '#f59e0b' };
    } else if (uvIndex <= 7) {
        return { label: 'High', class: 'uv-high', color: '#f97316' };
    } else if (uvIndex <= 10) {
        return { label: 'Very High', class: 'uv-very-high', color: '#ef4444' };
    } else {
        return { label: 'Extreme', class: 'uv-extreme', color: '#991b1b' };
    }
};

/**
 * Get UV protection recommendations
 * @param {number} uvIndex - UV index value
 * @returns {string} Protection recommendation
 */
export const getUVRecommendation = (uvIndex) => {
    if (uvIndex <= 2) {
        return 'No protection needed. Safe for outdoor activities.';
    } else if (uvIndex <= 5) {
        return 'Some protection required. Wear sunscreen if outside for extended periods.';
    } else if (uvIndex <= 7) {
        return 'Protection essential. Wear sunscreen, hat, and sunglasses. Seek shade during midday.';
    } else if (uvIndex <= 10) {
        return 'Extra protection needed. Avoid sun exposure during midday hours. Wear protective clothing.';
    } else {
        return 'Extreme risk. Stay indoors if possible. If outside, use maximum protection.';
    }
};

/**
 * Get Air Quality Index classification
 * @param {number} aqi - AQI value
 * @returns {object} AQI classification with label and class
 */
export const getAQIClassification = (aqi) => {
    if (aqi <= 50) {
        return { label: 'Good', class: 'aqi-good', color: '#10b981' };
    } else if (aqi <= 100) {
        return { label: 'Moderate', class: 'aqi-moderate', color: '#f59e0b' };
    } else if (aqi <= 150) {
        return { label: 'Unhealthy for Sensitive Groups', class: 'aqi-sensitive', color: '#f97316' };
    } else if (aqi <= 200) {
        return { label: 'Unhealthy', class: 'aqi-unhealthy', color: '#ef4444' };
    } else if (aqi <= 300) {
        return { label: 'Very Unhealthy', class: 'aqi-very-unhealthy', color: '#991b1b' };
    } else {
        return { label: 'Hazardous', class: 'aqi-hazardous', color: '#7c2d12' };
    }
};

/**
 * Convert temperature between units
 * @param {number} temp - Temperature value
 * @param {string} fromUnit - Source unit (C or F)
 * @param {string} toUnit - Target unit (C or F)
 * @returns {number} Converted temperature
 */
export const convertTemperature = (temp, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return temp;

    if (fromUnit === 'C' && toUnit === 'F') {
        return Math.round((temp * 9/5) + 32);
    } else if (fromUnit === 'F' && toUnit === 'C') {
        return Math.round((temp - 32) * 5/9);
    }

    return temp;
};

/**
 * Convert wind speed between units
 * @param {number} speed - Wind speed value
 * @param {string} fromUnit - Source unit (m/s, km/h, mph)
 * @param {string} toUnit - Target unit (m/s, km/h, mph)
 * @returns {number} Converted wind speed
 */
export const convertWindSpeed = (speed, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return speed;

    // Convert to m/s first
    let speedInMS = speed;
    if (fromUnit === 'km/h') {
        speedInMS = speed / 3.6;
    } else if (fromUnit === 'mph') {
        speedInMS = speed * 0.44704;
    }

    // Convert from m/s to target unit
    if (toUnit === 'km/h') {
        return Math.round(speedInMS * 3.6 * 10) / 10;
    } else if (toUnit === 'mph') {
        return Math.round(speedInMS / 0.44704 * 10) / 10;
    }

    return Math.round(speedInMS * 10) / 10;
};

/**
 * Format time for display
 * @param {Date|string} time - Time to format
 * @param {string} format - Format type (12h, 24h)
 * @returns {string} Formatted time
 */
export const formatTime = (time, format = '24h') => {
    const date = new Date(time);

    if (format === '12h') {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } else {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
};

/**
 * Get clothing suggestions based on weather
 * @param {object} weather - Weather data
 * @returns {array} Array of clothing suggestions
 */
export const getClothingSuggestions = (weather) => {
    const temp = weather.temperature;
    const condition = weather.condition?.toLowerCase() || '';
    const windSpeed = weather.windSpeed || 0;
    const humidity = weather.humidity || 0;

    const suggestions = [];

    // Temperature-based suggestions
    if (temp >= 30) {
        suggestions.push('Light cotton t-shirt', 'Shorts', 'Sandals', 'Hat', 'Sunglasses');
        if (weather.uvIndex > 5) suggestions.push('Sunscreen');
    } else if (temp >= 20) {
        suggestions.push('T-shirt', 'Light pants', 'Sneakers');
        if (condition.includes('rain')) suggestions.push('Light jacket');
    } else if (temp >= 10) {
        suggestions.push('Long sleeves', 'Jeans', 'Jacket');
        if (windSpeed > 5) suggestions.push('Windbreaker');
    } else if (temp >= 0) {
        suggestions.push('Warm jacket', 'Gloves', 'Scarf', 'Warm pants', 'Boots');
    } else {
        suggestions.push('Winter coat', 'Thermal layers', 'Gloves', 'Warm hat', 'Insulated boots');
    }

    // Weather condition additions
    if (condition.includes('rain') || condition.includes('shower')) {
        suggestions.push('Umbrella', 'Rain jacket');
    }

    if (condition.includes('snow')) {
        suggestions.push('Snow boots', 'Winter gloves', 'Warm hat');
    }

    if (windSpeed > 10) {
        suggestions.push('Windproof jacket');
    }

    return [...new Set(suggestions)]; // Remove duplicates
};

/**
 * Get activity recommendations based on weather
 * @param {object} weather - Weather data
 * @returns {array} Array of activity recommendations with ratings
 */
export const getActivityRecommendations = (weather) => {
    const temp = weather.temperature;
    const condition = weather.condition?.toLowerCase() || '';
    const windSpeed = weather.windSpeed || 0;
    const humidity = weather.humidity || 0;
    const uvIndex = weather.uvIndex || 0;

    const activities = [
        {
            name: 'Outdoor Running',
            icon: '🏃',
            rating: getActivityRating('running', { temp, condition, windSpeed, humidity, uvIndex })
        },
        {
            name: 'Cycling',
            icon: '🚴',
            rating: getActivityRating('cycling', { temp, condition, windSpeed, humidity, uvIndex })
        },
        {
            name: 'Swimming',
            icon: '🏊',
            rating: getActivityRating('swimming', { temp, condition, windSpeed, humidity, uvIndex })
        },
        {
            name: 'Walking',
            icon: '🚶',
            rating: getActivityRating('walking', { temp, condition, windSpeed, humidity, uvIndex })
        },
        {
            name: 'Outdoor Sports',
            icon: '⚽',
            rating: getActivityRating('sports', { temp, condition, windSpeed, humidity, uvIndex })
        }
    ];

    // Add weather-specific warnings
    if (condition.includes('rain') || condition.includes('storm')) {
        activities.push({
            name: 'Umbrella recommended',
            icon: '☂️',
            rating: { stars: 0, warning: true, message: 'Rain expected' }
        });
    }

    if (uvIndex > 7) {
        activities.push({
            name: 'Sun protection needed',
            icon: '🧴',
            rating: { stars: 0, warning: true, message: 'High UV levels' }
        });
    }

    return activities.sort((a, b) => (b.rating.stars || 0) - (a.rating.stars || 0));
};

/**
 * Get activity rating based on weather conditions
 * @param {string} activity - Activity type
 * @param {object} conditions - Weather conditions
 * @returns {object} Rating object with stars and message
 */
const getActivityRating = (activity, { temp, condition, windSpeed, humidity, uvIndex }) => {
    let baseRating = 5;
    let messages = [];

    // Temperature effects
    const idealTemp = activity === 'swimming' ? 25 : 20;
    const tempDiff = Math.abs(temp - idealTemp);

    if (tempDiff > 15) {
        baseRating -= 2;
        messages.push(temp > idealTemp + 15 ? 'Very hot' : 'Very cold');
    } else if (tempDiff > 10) {
        baseRating -= 1;
        messages.push(temp > idealTemp + 10 ? 'Hot weather' : 'Cold weather');
    }

    // Weather condition effects
    if (condition.includes('rain') || condition.includes('storm')) {
        baseRating -= 3;
        messages.push('Rainy conditions');
    } else if (condition.includes('cloud')) {
        if (activity === 'swimming') baseRating -= 1;
    }

    // Wind effects
    if (windSpeed > 15) {
        baseRating -= 2;
        messages.push('Very windy');
    } else if (windSpeed > 10) {
        baseRating -= 1;
        messages.push('Windy');
    }

    // UV effects for outdoor activities
    if (uvIndex > 8 && activity !== 'swimming') {
        baseRating -= 1;
        messages.push('High UV');
    }

    return {
        stars: Math.max(0, Math.min(5, baseRating)),
        message: messages.join(', ') || 'Good conditions'
    };
};

/**
 * Save widget configuration to localStorage
 * @param {array} widgets - Widget configuration array
 */
export const saveWidgetConfig = (widgets) => {
    try {
        localStorage.setItem('weatherapp_widgets', JSON.stringify(widgets));
    } catch (error) {
        console.error('Failed to save widget configuration:', error);
    }
};

/**
 * Load widget configuration from localStorage
 * @returns {array} Widget configuration array
 */
export const loadWidgetConfig = () => {
    try {
        const saved = localStorage.getItem('weatherapp_widgets');
        return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch (error) {
        console.error('Failed to load widget configuration:', error);
        return DEFAULT_WIDGETS;
    }
};

/**
 * Generate widget refresh schedule
 * @param {array} widgets - Widget configuration array
 * @returns {object} Refresh schedule object
 */
export const generateRefreshSchedule = (widgets) => {
    const schedule = {};

    widgets.forEach(widget => {
        if (widget.enabled && widget.refreshInterval) {
            schedule[widget.id] = {
                interval: widget.refreshInterval,
                lastRefresh: Date.now(),
                nextRefresh: Date.now() + widget.refreshInterval
            };
        }
    });

    return schedule;
};

