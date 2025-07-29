// src/components/HourlyForecast.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Droplet, Wind, Eye } from 'lucide-react';

const HourlyForecast = ({ forecastData, unit, className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef(null);

    if (!forecastData || !forecastData.list) return null;

    // Get next 24 hours of data (8 entries × 3 hours each)
    const hourlyData = forecastData.list.slice(0, 8);

    const formatHour = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
    };

    const formatDay = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const getWindDirection = (deg) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(deg / 22.5) % 16];
    };

    const getPrecipitationChance = (item) => {
        return Math.round((item.pop || 0) * 100);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    24-Hour Forecast
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={scrollLeft}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {hourlyData.map((item, index) => {
                    const temp = unit === 'celsius' ? item.main.temp : (item.main.temp * 9/5) + 32;
                    const tempUnit = unit === 'celsius' ? '°C' : '°F';
                    const precipChance = getPrecipitationChance(item);
                    const windDir = getWindDirection(item.wind?.deg || 0);

                    return (
                        <div
                            key={index}
                            className="flex-shrink-0 w-32 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            {/* Time */}
                            <div className="mb-3">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {index === 0 ? 'Now' : formatHour(item.dt_txt)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {formatDay(item.dt_txt)}
                                </p>
                            </div>

                            {/* Weather Icon */}
                            <div className="mb-3">
                                <img
                                    src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                    alt={item.weather[0].description}
                                    className="w-12 h-12 mx-auto"
                                />
                            </div>

                            {/* Temperature */}
                            <p className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                                {Math.round(temp)}{tempUnit}
                            </p>

                            {/* Additional Info */}
                            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                {/* Precipitation */}
                                {precipChance > 0 && (
                                    <div className="flex items-center justify-center space-x-1">
                                        <Droplet className="w-3 h-3 text-blue-500" />
                                        <span>{precipChance}%</span>
                                    </div>
                                )}

                                {/* Wind */}
                                <div className="flex items-center justify-center space-x-1">
                                    <Wind className="w-3 h-3 text-gray-400" />
                                    <span>
                                        {Math.round(item.wind?.speed || 0)} {windDir}
                                    </span>
                                </div>

                                {/* Humidity */}
                                <div className="flex items-center justify-center space-x-1">
                                    <Droplet className="w-3 h-3 text-cyan-500" />
                                    <span>{item.main.humidity}%</span>
                                </div>

                                {/* Visibility */}
                                {item.visibility && (
                                    <div className="flex items-center justify-center space-x-1">
                                        <Eye className="w-3 h-3 text-purple-500" />
                                        <span>{(item.visibility / 1000).toFixed(1)}km</span>
                                    </div>
                                )}
                            </div>

                            {/* Weather Description */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 capitalize leading-tight">
                                {item.weather[0].description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">High/Low</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {Math.round(Math.max(...hourlyData.map(item =>
                                unit === 'celsius' ? item.main.temp : (item.main.temp * 9/5) + 32
                            )))}° / {Math.round(Math.min(...hourlyData.map(item =>
                            unit === 'celsius' ? item.main.temp : (item.main.temp * 9/5) + 32
                        )))}°
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg Humidity</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {Math.round(hourlyData.reduce((sum, item) => sum + item.main.humidity, 0) / hourlyData.length)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Max Wind</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {Math.round(Math.max(...hourlyData.map(item => item.wind?.speed || 0)))} m/s
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rain Chance</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {Math.round(Math.max(...hourlyData.map(item => getPrecipitationChance(item))))}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HourlyForecast;