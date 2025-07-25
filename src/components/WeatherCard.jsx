// src/components/WeatherCard.jsx

import React from 'react';
import { Thermometer, Wind, Droplet } from 'lucide-react';

const WeatherCard = ({ weatherData, unit }) => {
    if (!weatherData) return null;

    const { name, main, weather, wind } = weatherData;
    const temp = unit === 'celsius' ? main.temp : (main.temp * 9/5) + 32;
    const feelsLike = unit === 'celsius' ? main.feels_like : (main.feels_like * 9/5) + 32;
    const tempUnit = unit === 'celsius' ? '°C' : '°F';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 capitalize">{weather[0].description}</p>
                </div>
                <img
                    src={`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
                    alt={weather[0].description}
                    className="w-20 h-20"
                />
            </div>
            <div className="mt-4 flex items-end justify-between">
                <p className="text-6xl font-bold text-gray-900 dark:text-white">
                    {Math.round(temp)}{tempUnit}
                </p>
                <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">Feels like {Math.round(feelsLike)}{tempUnit}</p>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-around text-gray-700 dark:text-gray-300">
                <div className="text-center">
                    <Droplet className="mx-auto mb-1" />
                    <p>{main.humidity}%</p>
                    <p className="text-xs text-gray-500">Humidity</p>
                </div>
                <div className="text-center">
                    <Wind className="mx-auto mb-1" />
                    <p>{wind.speed} m/s</p>
                    <p className="text-xs text-gray-500">Wind</p>
                </div>
                <div className="text-center">
                    <Thermometer className="mx-auto mb-1" />
                    <p>{main.pressure} hPa</p>
                    <p className="text-xs text-gray-500">Pressure</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;