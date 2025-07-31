// src/components/AirQuality.jsx
import React, { useState, useEffect } from 'react';
import {
    Wind,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity,
    Lung,
    Eye,
    Heart,
    Info
} from 'lucide-react';

const AirQuality = ({ weatherData, className = "" }) => {
    const [aqiData, setAqiData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (weatherData && weatherData.coord) {
            generateAQIData(weatherData.coord);
        }
    }, [weatherData]);

    const generateAQIData = (coordinates) => {
        setLoading(true);

        // Mock AQI data generation based on location and weather
        // In real app, this would be an API call to air quality service
        setTimeout(() => {
            const mockAQI = {
                aqi: Math.floor(Math.random() * 300) + 1, // 1-300 scale
                co: (Math.random() * 10 + 0.1).toFixed(1), // Carbon Monoxide
                no2: (Math.random() * 100 + 10).toFixed(1), // Nitrogen Dioxide
                o3: (Math.random() * 200 + 20).toFixed(1), // Ozone
                so2: (Math.random() * 50 + 5).toFixed(1), // Sulfur Dioxide
                pm2_5: (Math.random() * 100 + 10).toFixed(1), // PM2.5
                pm10: (Math.random() * 150 + 20).toFixed(1), // PM10
                nh3: (Math.random() * 30 + 5).toFixed(1), // Ammonia
                timestamp: new Date().toISOString(),
                location: {
                    lat: coordinates.lat,
                    lon: coordinates.lon
                }
            };

            setAqiData(mockAQI);
            setLoading(false);
        }, 1000);
    };

    const getAQILevel = (aqi) => {
        if (aqi <= 50) {
            return {
                level: 'Good',
                color: 'bg-green-500',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                textColor: 'text-green-800 dark:text-green-200',
                borderColor: 'border-green-200 dark:border-green-800',
                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                description: 'Air quality is satisfactory for most people',
                healthAdvice: 'Enjoy outdoor activities!'
            };
        } else if (aqi <= 100) {
            return {
                level: 'Moderate',
                color: 'bg-yellow-500',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                textColor: 'text-yellow-800 dark:text-yellow-200',
                borderColor: 'border-yellow-200 dark:border-yellow-800',
                icon: <Info className="w-5 h-5 text-yellow-600" />,
                description: 'Air quality is acceptable for most people',
                healthAdvice: 'Sensitive individuals should consider limiting outdoor activities'
            };
        } else if (aqi <= 150) {
            return {
                level: 'Unhealthy for Sensitive Groups',
                color: 'bg-orange-500',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                textColor: 'text-orange-800 dark:text-orange-200',
                borderColor: 'border-orange-200 dark:border-orange-800',
                icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
                description: 'Sensitive people may experience health effects',
                healthAdvice: 'Children, elderly, and people with heart/lung conditions should reduce outdoor activities'
            };
        } else if (aqi <= 200) {
            return {
                level: 'Unhealthy',
                color: 'bg-red-500',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                textColor: 'text-red-800 dark:text-red-200',
                borderColor: 'border-red-200 dark:border-red-800',
                icon: <XCircle className="w-5 h-5 text-red-600" />,
                description: 'Everyone may experience health effects',
                healthAdvice: 'Avoid outdoor activities, especially prolonged or heavy exertion'
            };
        } else if (aqi <= 300) {
            return {
                level: 'Very Unhealthy',
                color: 'bg-purple-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-800 dark:text-purple-200',
                borderColor: 'border-purple-200 dark:border-purple-800',
                icon: <XCircle className="w-5 h-5 text-purple-600" />,
                description: 'Health alert: serious health effects for everyone',
                healthAdvice: 'Avoid all outdoor activities and stay indoors'
            };
        } else {
            return {
                level: 'Hazardous',
                color: 'bg-red-800',
                bgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-900 dark:text-red-100',
                borderColor: 'border-red-300 dark:border-red-700',
                icon: <XCircle className="w-5 h-5 text-red-800" />,
                description: 'Emergency conditions: everyone affected',
                healthAdvice: 'Everyone should avoid outdoor activities and stay indoors with air purifiers'
            };
        }
    };

    const getPollutantInfo = (pollutant, value) => {
        const pollutantData = {
            co: {
                name: 'Carbon Monoxide',
                unit: 'μg/m³',
                icon: <Activity className="w-4 h-4" />,
                safeLevel: 10,
                description: 'Colorless, odorless gas that can be harmful'
            },
            no2: {
                name: 'Nitrogen Dioxide',
                unit: 'μg/m³',
                icon: <Lung className="w-4 h-4" />,
                safeLevel: 40,
                description: 'Gas that can cause respiratory problems'
            },
            o3: {
                name: 'Ozone',
                unit: 'μg/m³',
                icon: <Eye className="w-4 h-4" />,
                safeLevel: 120,
                description: 'Ground-level ozone can irritate airways'
            },
            so2: {
                name: 'Sulfur Dioxide',
                unit: 'μg/m³',
                icon: <Wind className="w-4 h-4" />,
                safeLevel: 20,
                description: 'Gas that can cause breathing difficulties'
            },
            pm2_5: {
                name: 'PM2.5',
                unit: 'μg/m³',
                icon: <Activity className="w-4 h-4" />,
                safeLevel: 15,
                description: 'Fine particles that can penetrate deep into lungs'
            },
            pm10: {
                name: 'PM10',
                unit: 'μg/m³',
                icon: <Lung className="w-4 h-4" />,
                safeLevel: 45,
                description: 'Particles that can cause respiratory issues'
            },
            nh3: {
                name: 'Ammonia',
                unit: 'μg/m³',
                icon: <Heart className="w-4 h-4" />,
                safeLevel: 400,
                description: 'Gas with strong odor, can irritate airways'
            }
        };

        const info = pollutantData[pollutant];
        const isHigh = parseFloat(value) > info.safeLevel;

        return {
            ...info,
            isHigh,
            status: isHigh ? 'High' : 'Normal'
        };
    };

    if (loading) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Wind className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Air Quality Index
                    </h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading air quality data...</span>
                </div>
            </div>
        );
    }

    if (!aqiData) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Wind className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Air Quality Index
                    </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Air quality data not available
                </p>
            </div>
        );
    }

    const aqiInfo = getAQILevel(aqiData.aqi);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        {aqiInfo.icon}
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Air Quality Index
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(aqiData.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                {/* AQI Display */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-4 mb-3">
                        <div className={`w-20 h-20 rounded-full ${aqiInfo.color} text-white text-2xl font-bold flex items-center justify-center shadow-lg`}>
                            {aqiData.aqi}
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                {aqiInfo.level}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                AQI Level
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${aqiInfo.bgColor} ${aqiInfo.borderColor}`}>
                        <p className={`text-sm font-medium ${aqiInfo.textColor} mb-2`}>
                            {aqiInfo.description}
                        </p>
                        <p className={`text-xs ${aqiInfo.textColor}`}>
                            {aqiInfo.healthAdvice}
                        </p>
                    </div>
                </div>

                {/* Pollutants Grid */}
                <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                        Pollutant Levels
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(aqiData).map(([key, value]) => {
                            if (!['co', 'no2', 'o3', 'so2', 'pm2_5', 'pm10', 'nh3'].includes(key)) return null;

                            const pollutantInfo = getPollutantInfo(key, value);

                            return (
                                <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-2">
                                        {pollutantInfo.icon}
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {pollutantInfo.name}
                                        </span>
                                    </div>
                                    <p className={`text-lg font-bold ${pollutantInfo.isHigh ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {value}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {pollutantInfo.unit}
                                    </p>
                                    <p className={`text-xs font-medium mt-1 ${pollutantInfo.isHigh ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {pollutantInfo.status}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* AQI Scale Reference */}
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                    AQI Scale
                </h4>
                <div className="space-y-2">
                    {[
                        { range: '0-50', level: 'Good', color: 'bg-green-500' },
                        { range: '51-100', level: 'Moderate', color: 'bg-yellow-500' },
                        { range: '101-150', level: 'Unhealthy for Sensitive', color: 'bg-orange-500' },
                        { range: '151-200', level: 'Unhealthy', color: 'bg-red-500' },
                        { range: '201-300', level: 'Very Unhealthy', color: 'bg-purple-600' },
                        { range: '301+', level: 'Hazardous', color: 'bg-red-800' }
                    ].map((scale, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <div className={`w-4 h-4 ${scale.color} rounded`}></div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-16">
                                {scale.range}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                {scale.level}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AirQuality;