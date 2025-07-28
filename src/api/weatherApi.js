// src/api/weatherApi.js

import axios from 'axios';

// Use relative URLs since we're serving from the same domain
const API_BASE_URL = '/api';

/**
 * Fetches current weather data for a given city.
 * @param {string} city - The name of the city.
 * @returns {Promise<Object>} The weather data.
 */
export const getCurrentWeather = (city) => {
    return axios.get(`${API_BASE_URL}/weather/current`, { params: { city } });
};

/**
 * Fetches the weather forecast for a given city.
 * @param {string} city - The name of the city.
 * @returns {Promise<Object>} The forecast data.
 */
export const getForecast = (city) => {
    return axios.get(`${API_BASE_URL}/weather/forecast`, { params: { city } });
};

/**
 * Fetches air pollution data for given coordinates.
 * @param {number} lat - The latitude.
 * @param {number} lon - The longitude.
 * @returns {Promise<Object>} The air pollution data.
 */
export const getAirPollution = (lat, lon) => {
    return axios.get(`${API_BASE_URL}/weather/air-pollution`, { params: { lat, lon } });
};

/**
 * Fetches user preferences.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} The user's preferences.
 */
export const getUserPreferences = (userId) => {
    return axios.get(`${API_BASE_URL}/users/${userId}/preferences`);
};

/**
 * Updates user preferences.
 * @param {string} userId - The ID of the user.
 * @param {Object} preferences - The new preferences object.
 * @returns {Promise<Object>} The updated user data.
 */
export const updateUserPreferences = (userId, preferences) => {
    return axios.put(`${API_BASE_URL}/users/${userId}/preferences`, preferences);
};
