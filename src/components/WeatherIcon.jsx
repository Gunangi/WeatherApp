// src/components/WeatherIcon.jsx

import React from 'react';
import { Sun, CloudSun, Cloud, Cloudy, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Wind } from 'lucide-react';

/**
 * A component to display a Lucide icon based on the OpenWeatherMap icon code.
 * @param {string} iconCode - The icon code from the OpenWeatherMap API (e.g., "01d", "04n").
 * @param {number} size - The size of the icon.
 * @returns {JSX.Element} A Lucide icon component.
 */
const WeatherIcon = ({ iconCode, size = 80 }) => {
    const iconMapping = {
        "01d": <Sun size={size} className="text-yellow-500" />,
        "01n": <Sun size={size} className="text-yellow-500" />, // Using Sun for night clear too for simplicity
        "02d": <CloudSun size={size} className="text-gray-500" />,
        "02n": <CloudSun size={size} className="text-gray-400" />,
        "03d": <Cloud size={size} className="text-gray-500" />,
        "03n": <Cloud size={size} className="text-gray-400" />,
        "04d": <Cloudy size={size} className="text-gray-600" />,
        "04n": <Cloudy size={size} className="text-gray-500" />,
        "09d": <CloudRain size={size} className="text-blue-500" />,
        "09n": <CloudRain size={size} className="text-blue-400" />,
        "10d": <CloudDrizzle size={size} className="text-blue-500" />,
        "10n": <CloudDrizzle size={size} className="text-blue-400" />,
        "11d": <CloudLightning size={size} className="text-yellow-600" />,
        "11n": <CloudLightning size={size} className="text-yellow-500" />,
        "13d": <CloudSnow size={size} className="text-blue-300" />,
        "13n": <CloudSnow size={size} className="text-blue-200" />,
        "50d": <CloudFog size={size} className="text-gray-400" />,
        "50n": <CloudFog size={size} className="text-gray-300" />,
    };

    return iconMapping[iconCode] || <Wind size={size} className="text-gray-500" />; // Default icon
};

export default WeatherIcon;
