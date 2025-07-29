// Weather utility functions

// Temperature conversion utilities
export const convertTemperature = (temp, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return temp;

    // Convert to Celsius first
    let celsius = temp;
    if (fromUnit === 'fahrenheit') {
        celsius = (temp - 32) * 5/9;
    } else if (fromUnit === 'kelvin') {
        celsius = temp - 273.15;
    }

    // Convert from Celsius to target unit
    if (toUnit === 'fahrenheit') {
        return (celsius * 9/5) + 32;
    } else if (toUnit === 'kelvin') {
        return celsius + 273.15;
    }

    return celsius;
};

// Format temperature with unit symbol
export const formatTemperature = (temp, unit = 'celsius', showUnit = true) => {
    const rounded = Math.round(temp);
    if (!showUnit) return rounded;

    const symbols = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    };

    return `${rounded}${symbols[unit] || '°C'}`;
};

// Weather condition mappings
export const weatherConditions = {
    // Clear
    '01d': { name: 'Clear Sky', emoji: '☀️', description: 'Sunny and clear' },
    '01n': { name: 'Clear Sky', emoji: '🌙', description: 'Clear night' },

    // Few clouds
    '02d': { name: 'Few Clouds', emoji: '⛅', description: 'Partly cloudy' },
    '02n': { name: 'Few Clouds', emoji: '☁️', description: 'Partly cloudy night' },

    // Scattered clouds
    '03d': { name: 'Scattered Clouds', emoji: '☁️', description: 'Cloudy' },
    '03n': { name: 'Scattered Clouds', emoji: '☁️', description: 'Cloudy night' },

    // Broken clouds
    '04d': { name: 'Broken Clouds', emoji: '☁️', description: 'Overcast' },
    '04n': { name: 'Broken Clouds', emoji: '☁️', description: 'Overcast night' },

    // Shower rain
    '09d': { name: 'Shower Rain', emoji: '🌧️', description: 'Light rain' },
    '09n': { name: 'Shower Rain', emoji: '🌧️', description: 'Light rain' },

    // Rain
    '10d': { name: 'Rain', emoji: '🌦️', description: 'Rainy' },
    '10n': { name: 'Rain', emoji: '🌧️', description: 'Rainy night' },

    // Thunderstorm
    '11d': { name: 'Thunderstorm', emoji: '⛈️', description: 'Stormy' },
    '11n': { name: 'Thunderstorm', emoji: '⛈️', description: 'Stormy night' },

    // Snow
    '13d': { name: 'Snow', emoji: '❄️', description: 'Snowy' },
    '13n': { name: 'Snow', emoji: '❄️', description: 'Snowy night' },

    // Mist
    '50d': { name: 'Mist', emoji: '🌫️', description: 'Misty' },
    '50n': { name: 'Mist', emoji: '🌫️', description: 'Misty night' }
};

// Get weather condition details
export const getWeatherCondition = (iconCode) => {
    return weatherConditions[iconCode] || {
        name: 'Unknown',
        emoji: '🌤️',
        description: 'Weather condition unknown'
    };
};

// Wind direction utilities
export const getWindDirection = (degrees) => {
    const directions = [
        'N', 'NNE', 'NE', 'ENE',
        'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW',
        'W', 'WNW', 'NW', 'NNW'
    ];

    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
};

// Convert wind speed between units
export const convertWindSpeed = (speed, fromUnit, toUnit) => {
    // Convert to m/s first
    let ms = speed;
    switch (fromUnit) {
        case 'kmh':
            ms = speed / 3.6;
            break;
        case 'mph':
            ms = speed * 0.44704;
            break;
        case 'knots':
            ms = speed * 0.514444;
            break;
    }

    // Convert from m/s to target unit
    switch (toUnit) {
        case 'kmh':
            return ms * 3.6;
        case 'mph':
            return ms * 2.237;
        case 'knots':
            return ms * 1.944;
        default:
            return ms;
    }
};

// Format wind speed with direction
export const formatWind = (speed, direction, unit = 'ms') => {
    const units = {
        ms: 'm/s',
        kmh: 'km/h',
        mph: 'mph',
        knots: 'knots'
    };

    const dir = typeof direction === 'number' ? getWindDirection(direction) : direction;
    return `${Math.round(speed)} ${units[unit]} ${dir}`;
};

// Pressure conversion utilities
export const convertPressure = (pressure, fromUnit, toUnit) => {
    // Convert to hPa first
    let hpa = pressure;
    switch (fromUnit) {
        case 'inhg':
            hpa = pressure * 33.8639;
            break;
        case 'mmhg':
            hpa = pressure * 1.33322;
            break;
        case 'psi':
            hpa = pressure * 68.9476;
            break;
    }

    // Convert from hPa to target unit
    switch (toUnit) {
        case 'inhg':
            return hpa / 33.8639;
        case 'mmhg':
            return hpa / 1.33322;
        case 'psi':
            return hpa / 68.9476;
        default:
            return hpa;
    }
};

// UV Index utilities
export const getUVIndexLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'green', advice: 'No protection needed' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'yellow', advice: 'Seek shade during midday hours' };
    if (uvIndex <= 7) return { level: 'High', color: 'orange', advice: 'Protection essential' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'red', advice: 'Extra protection needed' };
    return { level: 'Extreme', color: 'purple', advice: 'Avoid being outside' };
};

// Air Quality Index utilities
export const getAQILevel = (aqi) => {
    const levels = {
        1: { label: 'Good', color: '#00E400', description: 'Air quality is good' },
        2: { label: 'Fair', color: '#FFFF00', description: 'Air quality is acceptable' },
        3: { label: 'Moderate', color: '#FF7E00', description: 'Air quality is moderate' },
        4: { label: 'Poor', color: '#FF0000', description: 'Air quality is poor' },
        5: { label: 'Very Poor', color: '#8F3F97', description: 'Air quality is very poor' }
    };

    return levels[aqi] || levels[1];
};

// Time utilities
export const formatTime = (timestamp, timezone = 0, format = '12h') => {
    const date = new Date((timestamp + timezone) * 1000);

    if (format === '24h') {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    }

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    });
};

// Calculate feels like temperature
export const calculateFeelsLike = (temp, humidity, windSpeed, unit = 'celsius') => {
    // Convert to Celsius if needed
    let tempC = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp;

    // Heat Index calculation (for temperatures above 27°C)
    if (tempC >= 27) {
        const T = unit === 'fahrenheit' ? temp : temp * 9/5 + 32;
        const RH = humidity;

        let HI = -42.379 + 2.04901523 * T + 10.14333127 * RH
            - 0.22475541 * T * RH - 6.83783e-03 * T * T
            - 5.481717e-02 * RH * RH + 1.22874e-03 * T * T * RH
            + 8.5282e-04 * T * RH * RH - 1.99e-06 * T * T * RH * RH;

        return unit === 'fahrenheit' ? HI : (HI - 32) * 5/9;
    }

    // Wind Chill calculation (for temperatures below 10°C)
    if (tempC <= 10 && windSpeed > 4.8) {
        const T = unit === 'fahrenheit' ? temp : temp * 9/5 + 32;
        const V = windSpeed * 2.237; // Convert m/s to mph

        let WC = 35.74 + 0.6215 * T - 35.75 * Math.pow(V, 0.16) + 0.4275 * T * Math.pow(V, 0.16);

        return unit === 'fahrenheit' ? WC : (WC - 32) * 5/9;
    }

    return temp;
};

// Weather-based clothing suggestions
export const getClothingSuggestions = (temp, condition, windSpeed, humidity) => {
    const suggestions = [];

    if (temp < 0) {
        suggestions.push('Heavy winter coat', 'Thermal layers', 'Winter boots', 'Hat and gloves');
    } else if (temp < 10) {
        suggestions.push('Warm jacket', 'Long pants', 'Closed shoes', 'Light scarf');
    } else if (temp < 20) {
        suggestions.push('Light jacket or sweater', 'Long pants or jeans', 'Comfortable shoes');
    } else if (temp < 25) {
        suggestions.push('T-shirt or light shirt', 'Light pants or shorts', 'Comfortable shoes');
    } else {
        suggestions.push('Light clothing', 'Shorts or light pants', 'Sandals or breathable shoes');
    }

    // Weather-specific additions
    if (condition.includes('rain') || condition.includes('shower')) {
        suggestions.push('Umbrella or raincoat', 'Waterproof shoes');
    }

    if (condition.includes('snow')) {
        suggestions.push('Waterproof boots', 'Warm gloves', 'Winter hat');
    }

    if (windSpeed > 10) {
        suggestions.push('Windbreaker or wind-resistant jacket');
    }

    if (humidity > 70) {
        suggestions.push('Breathable fabrics', 'Moisture-wicking materials');
    }

    return suggestions;
};

// Activity recommendations based on weather
export const getActivityRecommendations = (weather) => {
    const { temp, condition, windSpeed, humidity, uvIndex } = weather;
    const recommendations = [];

    if (temp >= 20 && temp <= 25 && !condition.includes('rain')) {
        recommendations.push('Perfect for outdoor activities', 'Great for hiking or cycling', 'Ideal for picnics');
    }

    if (condition.includes('rain')) {
        recommendations.push('Indoor activities recommended', 'Visit museums or shopping centers', 'Movie day at home');
    }

    if (condition.includes('snow')) {
        recommendations.push('Winter sports activities', 'Skiing or snowboarding', 'Building snowmen');
    }

    if (uvIndex > 7) {
        recommendations.push('Seek shade during midday', 'Wear sunscreen and hat', 'Avoid prolonged sun exposure');
    }

    if (windSpeed > 15) {
        recommendations.push('Not ideal for outdoor sports', 'Flying activities not recommended', 'Secure loose items');
    }

    return recommendations;
};

// Weather alerts and warnings
export const generateWeatherAlerts = (weather) => {
    const alerts = [];

    if (weather.temp < -10) {
        alerts.push({
            type: 'warning',
            title: 'Extreme Cold Warning',
            message: 'Extremely cold temperatures. Dress warmly and limit outdoor exposure.'
        });
    }

    if (weather.temp > 35) {
        alerts.push({
            type: 'warning',
            title: 'Heat Warning',
            message: 'Very hot temperatures. Stay hydrated and avoid prolonged sun exposure.'
        });
    }

    if (weather.windSpeed > 20) {
        alerts.push({
            type: 'caution',
            title: 'High Wind Advisory',
            message: 'Strong winds expected. Secure loose objects and use caution when driving.'
        });
    }

    if (weather.uvIndex > 8) {
        alerts.push({
            type: 'caution',
            title: 'High UV Index',
            message: 'Very high UV levels. Use sunscreen and seek shade during peak hours.'
        });
    }

    return alerts;
};