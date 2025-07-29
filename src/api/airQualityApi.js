import { weatherCache } from '../utils/cacheUtils';

const API_BASE_URL = 'http://api.openweathermap.org/data/2.5';
const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

/**
 * Air Quality Index levels and descriptions
 */
export const AQI_LEVELS = {
    1: { label: 'Good', color: 'green', description: 'Air quality is satisfactory' },
    2: { label: 'Fair', color: 'yellow', description: 'Air quality is acceptable' },
    3: { label: 'Moderate', color: 'orange', description: 'May be unhealthy for sensitive groups' },
    4: { label: 'Poor', color: 'red', description: 'Unhealthy for everyone' },
    5: { label: 'Very Poor', color: 'purple', description: 'Health alert: everyone may experience health effects' }
};

/**
 * Pollutant information and safe levels
 */
export const POLLUTANTS = {
    co: {
        name: 'Carbon Monoxide',
        unit: 'μg/m³',
        safeLevel: 10000,
        description: 'Colorless, odorless gas that can be harmful when inhaled in large amounts'
    },
    no: {
        name: 'Nitric Oxide',
        unit: 'μg/m³',
        safeLevel: 200,
        description: 'Gas produced by combustion processes'
    },
    no2: {
        name: 'Nitrogen Dioxide',
        unit: 'μg/m³',
        safeLevel: 200,
        description: 'Reddish-brown gas that can irritate airways'
    },
    o3: {
        name: 'Ozone',
        unit: 'μg/m³',
        safeLevel: 180,
        description: 'Ground-level ozone that can cause respiratory problems'
    },
    so2: {
        name: 'Sulfur Dioxide',
        unit: 'μg/m³',
        safeLevel: 350,
        description: 'Gas that can cause respiratory symptoms'
    },
    pm2_5: {
        name: 'PM2.5',
        unit: 'μg/m³',
        safeLevel: 25,
        description: 'Fine particles that can penetrate deep into lungs'
    },
    pm10: {
        name: 'PM10',
        unit: 'μg/m³',
        safeLevel: 50,
        description: 'Coarse particles that can irritate airways'
    },
    nh3: {
        name: 'Ammonia',
        unit: 'μg/m³',
        safeLevel: 200,
        description: 'Gas with a strong odor that can irritate eyes and throat'
    }
};

/**
 * API request helper with error handling
 * @param {string} url - API endpoint URL
 * @returns {Promise<object>} - API response data
 */
const apiRequest = async (url) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Air Quality API request failed:', error);
        throw error;
    }
};

/**
 * Get current air quality data for coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} - Air quality data
 */
export const getCurrentAirQuality = async (lat, lon) => {
    const cacheKey = `${lat},${lon}`;

    // Check cache first
    const cachedData = weatherCache.getAirQuality(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const url = `${API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const data = await apiRequest(url);

        const processedData = {
            coordinates: { lat, lon },
            timestamp: new Date().toISOString(),
            aqi: data.list[0].main.aqi,
            components: data.list[0].components,
            ...processAirQualityData(data.list[0])
        };

        // Cache the processed data
        weatherCache.setAirQuality(cacheKey, processedData);

        return processedData;
    } catch (error) {
        throw new Error(`Failed to fetch current air quality: ${error.message}`);
    }
};

/**
 * Get air quality forecast
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} - Air quality forecast data
 */
export const getAirQualityForecast = async (lat, lon) => {
    const url = `${API_BASE_URL}/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const data = await apiRequest(url);

        return {
            coordinates: { lat, lon },
            timestamp: new Date().toISOString(),
            forecast: data.list.map(item => ({
                dt: item.dt,
                date: new Date(item.dt * 1000).toISOString(),
                aqi: item.main.aqi,
                components: item.components,
                ...processAirQualityData(item)
            }))
        };
    } catch (error) {
        throw new Error(`Failed to fetch air quality forecast: ${error.message}`);
    }
};

/**
 * Get historical air quality data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} start - Start timestamp (Unix)
 * @param {number} end - End timestamp (Unix)
 * @returns {Promise<object>} - Historical air quality data
 */
export const getHistoricalAirQuality = async (lat, lon, start, end) => {
    const url = `${API_BASE_URL}/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${API_KEY}`;

    try {
        const data = await apiRequest(url);

        return {
            coordinates: { lat, lon },
            period: { start, end },
            timestamp: new Date().toISOString(),
            history: data.list.map(item => ({
                dt: item.dt,
                date: new Date(item.dt * 1000).toISOString(),
                aqi: item.main.aqi,
                components: item.components,
                ...processAirQualityData(item)
            }))
        };
    } catch (error) {
        throw new Error(`Failed to fetch historical air quality: ${error.message}`);
    }
};

/**
 * Process raw air quality data into a more usable format
 * @param {object} rawData - Raw API data
 * @returns {object} - Processed air quality data
 */
const processAirQualityData = (rawData) => {
    const aqi = rawData.main.aqi;
    const components = rawData.components;

    return {
        level: AQI_LEVELS[aqi],
        pollutants: Object.keys(components).map(pollutant => {
            const value = components[pollutant];
            const info = POLLUTANTS[pollutant];

            if (!info) return null;

            return {
                name: pollutant,
                displayName: info.name,
                value,
                unit: info.unit,
                safeLevel: info.safeLevel,
                isExceeded: value > info.safeLevel,
                percentage: Math.round((value / info.safeLevel) * 100),
                description: info.description
            };
        }).filter(Boolean),
        recommendations: getHealthRecommendations(aqi, components),
        dominantPollutant: getDominantPollutant(components)
    };
};

/**
 * Get health recommendations based on AQI level
 * @param {number} aqi - Air Quality Index
 * @param {object} components - Pollutant components
 * @returns {Array} - Array of health recommendations
 */
const getHealthRecommendations = (aqi, components) => {
    const recommendations = [];

    switch (aqi) {
        case 1: // Good
            recommendations.push('Air quality is good. Perfect for outdoor activities.');
            break;
        case 2: // Fair
            recommendations.push('Air quality is fair. Suitable for outdoor activities.');
            recommendations.push('Sensitive individuals should be aware of potential minor symptoms.');
            break;
        case 3: // Moderate
            recommendations.push('Air quality is moderate. Sensitive groups should limit prolonged outdoor activities.');
            recommendations.push('Everyone else can continue normal outdoor activities.');
            break;
        case 4: // Poor
            recommendations.push('Air quality is poor. Everyone should limit prolonged outdoor activities.');
            recommendations.push('Sensitive individuals should avoid outdoor activities.');
            recommendations.push('Close windows and use air purifiers indoors.');
            break;
        case 5: // Very Poor
            recommendations.push('Air quality is very poor. Avoid all outdoor activities.');
            recommendations.push('Keep windows closed and use air purifiers.');
            recommendations.push('Wear masks when going outside.');
            recommendations.push('Seek medical attention if experiencing symptoms.');
            break;
    }

    // Add specific pollutant recommendations
    if (components.pm2_5 > 35) {
        recommendations.push('High PM2.5 levels detected. Use air purifiers and avoid outdoor exercise.');
    }
    if (components.o3 > 200) {
        recommendations.push('High ozone levels. Avoid outdoor activities during peak hours.');
    }
    if (components.no2 > 200) {
        recommendations.push('High NO2 levels. Traffic-related pollution is elevated.');
    }

    return recommendations;
};

/**
 * Determine the dominant pollutant
 * @param {object} components - Pollutant components
 * @returns {object} - Information about the dominant pollutant
 */
const getDominantPollutant = (components) => {
    let maxExceedance = 0;
    let dominantPollutant = null;

    Object.keys(components).forEach(pollutant => {
        const value = components[pollutant];
        const info = POLLUTANTS[pollutant];

        if (info) {
            const exceedance = value / info.safeLevel;
            if (exceedance > maxExceedance) {
                maxExceedance = exceedance;
                dominantPollutant = {
                    name: pollutant,
                    displayName: info.name,
                    value,
                    exceedance: Math.round(exceedance * 100),
                    description: info.description
                };
            }
        }
    });

    return dominantPollutant;
};

/**
 * Get air quality data for a city name
 * @param {string} cityName - City name
 * @returns {Promise<object>} - Air quality data
 */
export const getAirQualityByCity = async (cityName) => {
    // First get coordinates for the city using geocoding
    const geoUrl = `${API_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}`;

    try {
        const geoData = await apiRequest(geoUrl);
        const { lat, lon } = geoData.coord;

        return await getCurrentAirQuality(lat, lon);
    } catch (error) {
        throw new Error(`Failed to get air quality for ${cityName}: ${error.message}`);
    }
};

/**
 * Compare air quality between multiple locations
 * @param {Array} locations - Array of {lat, lon, name} objects
 * @returns {Promise<Array>} - Array of air quality comparisons
 */
export const compareAirQuality = async (locations) => {
    const promises = locations.map(async (location) => {
        try {
            const data = await getCurrentAirQuality(location.lat, location.lon);
            return {
                location: location.name || `${location.lat}, ${location.lon}`,
                ...data
            };
        } catch (error) {
            return {
                location: location.name || `${location.lat}, ${location.lon}`,
                error: error.message
            };
        }
    });

    return await Promise.allSettled(promises.map(p => p.then(
        result => ({ status: 'fulfilled', value: result }),
        error => ({ status: 'rejected', reason: error })
    )));
};

/**
 * Get air quality alerts based on thresholds
 * @param {object} airQualityData - Current air quality data
 * @param {object} thresholds - Alert thresholds
 * @returns {Array} - Array of alerts
 */
export const getAirQualityAlerts = (airQualityData, thresholds = {}) => {
    const alerts = [];
    const defaultThresholds = {
        aqi: 3, // Moderate or higher
        pm2_5: 35,
        pm10: 50,
        o3: 180,
        no2: 200,
        so2: 350,
        co: 10000
    };

    const finalThresholds = { ...defaultThresholds, ...thresholds };

    // Check AQI level
    if (airQualityData.aqi >= finalThresholds.aqi) {
        alerts.push({
            type: 'aqi',
            level: 'warning',
            message: `Air Quality Index is ${airQualityData.level.label} (${airQualityData.aqi})`,
            recommendations: airQualityData.recommendations
        });
    }

    // Check individual pollutants
    airQualityData.pollutants.forEach(pollutant => {
        const threshold = finalThresholds[pollutant.name];
        if (threshold && pollutant.value > threshold) {
            alerts.push({
                type: 'pollutant',
                pollutant: pollutant.name,
                level: pollutant.value > threshold * 2 ? 'severe' : 'warning',
                message: `${pollutant.displayName} level is elevated (${pollutant.value} ${pollutant.unit})`,
                recommendation: `Consider limiting outdoor activities due to high ${pollutant.displayName} levels`
            });
        }
    });

    return alerts;
};

export default {
    getCurrentAirQuality,
    getAirQualityForecast,
    getHistoricalAirQuality,
    getAirQualityByCity,
    compareAirQuality,
    getAirQualityAlerts,
    AQI_LEVELS,
    POLLUTANTS
};