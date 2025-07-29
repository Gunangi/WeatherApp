// src/components/UVIndexDisplay.jsx
import React, { useState, useEffect } from 'react';
import { Sun, Shield, Clock, AlertTriangle, Info } from 'lucide-react';

const UVIndexDisplay = ({ weatherData, className = "" }) => {
    const [uvIndex, setUvIndex] = useState(null);
    const [uvForecast, setUvForecast] = useState([]);

    useEffect(() => {
        if (weatherData) {
            // Mock UV Index calculation based on weather conditions
            // In real app, this would come from UV Index API
            generateUVData(weatherData);
        }
    }, [weatherData]);

    const generateUVData = (data) => {
        const isDaytime = data.weather[0].icon.includes('d');
        const cloudCover = data.clouds?.all || 0;
        const latitude = Math.abs(data.coord?.lat || 20);

        // Mock UV calculation
        let baseUV = isDaytime ? Math.max(0, 11 - (cloudCover / 10)) : 0;

        // Adjust for latitude (higher UV closer to equator)
        baseUV *= (30 - Math.abs(latitude - 0)) / 30;

        // Add some randomness for realistic variation
        baseUV *= (0.8 + Math.random() * 0.4);

        const currentUV = Math.round(Math.max(0, Math.min(11, baseUV)));
        setUvIndex(currentUV);

        // Generate hourly forecast
        const forecast = [];
        const currentHour = new Date().getHours();

        for (let i = 0; i < 12; i++) {
            const hour = (currentHour + i) % 24;
            let hourlyUV = 0;

            if (hour >= 6 && hour <= 18) {
                // UV peaks around noon
                const peakFactor = 1 - Math.abs(hour - 12) / 6;
                hourlyUV = Math.round(baseUV * peakFactor * (0.8 + Math.random() * 0.4));
            }

            forecast.push({
                hour: hour,
                uv: Math.max(0, hourlyUV),
                time: `${hour.toString().padStart(2, '0')}:00`
            });
        }

        setUvForecast(forecast);
    };

    const getUVInfo = (index) => {
        if (index === null) return null;

        if (index <= 2) {
            return {
                level: 'Low',
                color: 'bg-green-500',
                textColor: 'text-green-800 dark:text-green-200',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                borderColor: 'border-green-200 dark:border-green-800',
                icon: <Sun className="w-5 h-5 text-green-600" />,
                recommendation: 'No protection required. You can safely enjoy being outside.',
                precautions: []
            };
        } else if (index <= 5) {
            return {
                level: 'Moderate',
                color: 'bg-yellow-500',
                textColor: 'text-yellow-800 dark:text-yellow-200',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                borderColor: 'border-yellow-200 dark:border-yellow-800',
                icon: <Sun className="w-5 h-5 text-yellow-600" />,
                recommendation: 'Some protection required. Seek shade during midday hours.',
                precautions: ['Wear sunscreen SPF 30+', 'Wear a hat', 'Seek shade 10AM-4PM']
            };
        } else if (index <= 7) {
            return {
                level: 'High',
                color: 'bg-orange-500',
                textColor: 'text-orange-800 dark:text-orange-200',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                borderColor: 'border-orange-200 dark:border-orange-800',
                icon: <Shield className="w-5 h-5 text-orange-600" />,
                recommendation: 'Protection required. UV damage can occur quickly.',
                precautions: ['Apply sunscreen SPF 30+', 'Wear protective clothing', 'Wear sunglasses', 'Limit time in sun 10AM-4PM']
            };
        } else if (index <= 10) {
            return {
                level: 'Very High',
                color: 'bg-red-500',
                textColor: 'text-red-800 dark:text-red-200',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                borderColor: 'border-red-200 dark:border-red-800',
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                recommendation: 'Extra protection required. UV damage occurs very quickly.',
                precautions: ['Apply sunscreen SPF 50+', 'Wear long-sleeved shirt', 'Wear wide-brimmed hat', 'Wear sunglasses', 'Minimize sun exposure 10AM-4PM']
            };
        } else {
            return {
                level: 'Extreme',
                color: 'bg-purple-600',
                textColor: 'text-purple-800 dark:text-purple-200',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                borderColor: 'border-purple-200 dark:border-purple-800',
                icon: <AlertTriangle className="w-5 h-5 text-purple-600" />,
                recommendation: 'Avoid being outside. UV damage occurs within minutes.',
                precautions: ['Apply sunscreen SPF 50+ frequently', 'Wear protective clothing', 'Stay in shade', 'Avoid sun exposure 10AM-4PM', 'Consider staying indoors']
            };
        }
    };

    const getSkinType = () => {
        // Mock skin type - in real app, this would be user setting
        return {
            type: 'Type II',
            description: 'Fair skin, light eyes',
            burnTime: '15-20 minutes',
            recommendation: 'Use SPF 30+ sunscreen'
        };
    };

    const uvInfo = getUVInfo(uvIndex);
    const skinType = getSkinType();

    if (!uvInfo) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Sun className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        UV Index
                    </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    UV Index data not available
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        {uvInfo.icon}
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            UV Index
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date().toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                {/* Current UV Index */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-4 mb-3">
                        <div className={`w-16 h-16 rounded-full ${uvInfo.color} text-white text-2xl font-bold flex items-center justify-center shadow-lg`}>
                            {uvIndex}
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                {uvInfo.level}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                UV Index Level
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${uvInfo.bgColor} ${uvInfo.borderColor}`}>
                        <p className={`text-sm font-medium ${uvInfo.textColor}`}>
                            {uvInfo.recommendation}
                        </p>
                    </div>
                </div>

                {/* Precautions */}
                {uvInfo.precautions.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                            Recommended Precautions
                        </h4>
                        <div className="space-y-2">
                            {uvInfo.precautions.map((precaution, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {precaution}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skin Type Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                            For {skinType.type} ({skinType.description})
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Estimated burn time: {skinType.burnTime} without protection
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {skinType.recommendation}
                    </p>
                </div>
            </div>

            {/* Hourly UV Forecast */}
            <div className="px-6 pb-6">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                    12-Hour UV Forecast
                </h4>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {uvForecast.map((forecast, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                {forecast.time}
                            </p>
                            <div className={`w-8 h-8 rounded-full ${getUVInfo(forecast.uv)?.color || 'bg-gray-400'} text-white text-sm font-bold flex items-center justify-center mx-auto mb-2`}>
                                {forecast.uv}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getUVInfo(forecast.uv)?.level || 'None'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* UV Scale Reference */}
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                    UV Index Scale
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                        { range: '0-2', level: 'Low', color: 'bg-green-500' },
                        { range: '3-5', level: 'Moderate', color: 'bg-yellow-500' },
                        { range: '6-7', level: 'High', color: 'bg-orange-500' },
                        { range: '8-10', level: 'Very High', color: 'bg-red-500' },
                        { range: '11+', level: 'Extreme', color: 'bg-purple-600' }
                    ].map((scale, index) => (
                        <div key={index} className="text-center">
                            <div className={`w-full h-3 ${scale.color} rounded mb-1`}></div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {scale.range}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {scale.level}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UVIndexDisplay;