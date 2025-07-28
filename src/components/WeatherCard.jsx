// src/components/WeatherCard.jsx

import React from 'react';
import { Thermometer, Wind, Droplet, Eye, Gauge, Sunrise, Sunset, MapPin } from 'lucide-react';

const WeatherCard = ({ weatherData, unit }) => {
    if (!weatherData) return null;

    const { name, main, weather, wind, visibility, dt, sys, timezone } = weatherData;

    // Temperature calculations
    const temp = unit === 'celsius' ? main.temp : (main.temp * 9/5) + 32;
    const feelsLike = unit === 'celsius' ? main.feels_like : (main.feels_like * 9/5) + 32;
    const tempMin = unit === 'celsius' ? main.temp_min : (main.temp_min * 9/5) + 32;
    const tempMax = unit === 'celsius' ? main.temp_max : (main.temp_max * 9/5) + 32;
    const tempUnit = unit === 'celsius' ? '°C' : '°F';

    // Time calculations
    const currentTime = new Date((dt + timezone) * 1000);
    const sunriseTime = new Date((sys.sunrise + timezone) * 1000);
    const sunsetTime = new Date((sys.sunset + timezone) * 1000);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };

    // Weather condition background
    const getWeatherGradient = (condition) => {
        const gradients = {
            'clear': 'from-yellow-400 via-orange-400 to-red-400',
            'clouds': 'from-gray-400 via-gray-500 to-gray-600',
            'rain': 'from-blue-400 via-blue-500 to-blue-600',
            'drizzle': 'from-blue-300 via-blue-400 to-blue-500',
            'thunderstorm': 'from-purple-600 via-purple-700 to-indigo-800',
            'snow': 'from-blue-100 via-blue-200 to-blue-300',
            'mist': 'from-gray-300 via-gray-400 to-gray-500',
            'fog': 'from-gray-300 via-gray-400 to-gray-500'
        };
        return gradients[condition.toLowerCase()] || 'from-blue-400 via-blue-500 to-blue-600';
    };

    const weatherCondition = weather[0].main.toLowerCase();
    const gradient = getWeatherGradient(weatherCondition);

    return (
        <div className="relative weather-card fade-in overflow-hidden">
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 rounded-2xl`}></div>

            {/* Main content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                                {name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(currentTime)} local time
                            </p>
                        </div>
                    </div>
                    <div className="weather-icon-container">
                        <img
                            src={`http://openweathermap.org/img/wn/${weather[0].icon}@4x.png`}
                            alt={weather[0].description}
                            className="w-20 h-20 md:w-24 md:h-24 drop-shadow-lg"
                        />
                    </div>
                </div>

                {/* Temperature and description */}
                <div className="mb-8">
                    <div className="flex items-baseline space-x-4 mb-2">
                        <span className="temperature-display">
                            {Math.round(temp)}°
                        </span>
                        <div className="text-right">
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                                {Math.round(tempMin)}° / {Math.round(tempMax)}°
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Low / High
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {weather[0].description}
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Feels like {Math.round(feelsLike)}{tempUnit}
                        </p>
                    </div>
                </div>

                {/* Weather stats grid */}
                <div className="stats-grid">
                    <div className="stat-item fade-in-delay-1">
                        <Droplet className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {main.humidity}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Humidity
                        </p>
                    </div>

                    <div className="stat-item fade-in-delay-2">
                        <Wind className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {wind.speed}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            m/s Wind
                        </p>
                    </div>

                    <div className="stat-item fade-in-delay-3">
                        <Gauge className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {main.pressure}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            hPa
                        </p>
                    </div>
                </div>

                {/* Additional info row */}
                <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="fade-in-delay-1">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <Eye className="w-4 h-4 text-cyan-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {visibility ? (visibility / 1000).toFixed(1) : 'N/A'} km
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Visibility</p>
                        </div>

                        <div className="fade-in-delay-2">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <Sunrise className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatTime(sunriseTime)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sunrise</p>
                        </div>

                        <div className="fade-in-delay-3">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <Sunset className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatTime(sunsetTime)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sunset</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;