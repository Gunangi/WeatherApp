import React from 'react';
import { Wind, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AirQuality = ({ airQualityData, isDark = false }) => {
    // Mock data if no airQualityData provided
    const data = airQualityData || {
        aqi: 125,
        category: 'Unhealthy for Sensitive Groups',
        pollutants: {
            co: 0.8,      // Carbon Monoxide (mg/m³)
            no2: 45,      // Nitrogen Dioxide (μg/m³)
            o3: 78,       // Ozone (μg/m³)
            so2: 12,      // Sulfur Dioxide (μg/m³)
            pm25: 35,     // PM2.5 (μg/m³)
            pm10: 58      // PM10 (μg/m³)
        },
        recommendations: [
            'Limit outdoor activities',
            'Keep windows closed',
            'Use air purifiers indoors',
            'Wear masks when going outside'
        ]
    };

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' };
        if (aqi <= 100) return { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500' };
        if (aqi <= 150) return { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500' };
        if (aqi <= 200) return { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' };
        if (aqi <= 300) return { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' };
        return { bg: 'bg-red-800', text: 'text-red-800', ring: 'ring-red-800' };
    };

    const getAQIIcon = (aqi) => {
        const iconProps = { size: 24 };
        if (aqi <= 50) return <CheckCircle {...iconProps} className="text-green-500" />;
        if (aqi <= 100) return <AlertCircle {...iconProps} className="text-yellow-500" />;
        if (aqi <= 150) return <AlertTriangle {...iconProps} className="text-orange-500" />;
        return <XCircle {...iconProps} className="text-red-500" />;
    };

    const getHealthImpact = (aqi) => {
        if (aqi <= 50) return 'Good - Air quality is satisfactory';
        if (aqi <= 100) return 'Moderate - Acceptable for most people';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy - Everyone may experience effects';
        if (aqi <= 300) return 'Very Unhealthy - Health alert';
        return 'Hazardous - Health warnings of emergency conditions';
    };

    const getPollutantLevel = (pollutant, value) => {
        const levels = {
            co: { good: 1, moderate: 2, bad: 4 },
            no2: { good: 40, moderate: 80, bad: 120 },
            o3: { good: 60, moderate: 120, bad: 180 },
            so2: { good: 20, moderate: 80, bad: 250 },
            pm25: { good: 12, moderate: 35, bad: 55 },
            pm10: { good: 25, moderate: 50, bad: 90 }
        };

        const level = levels[pollutant];
        if (!level) return 'good';

        if (value <= level.good) return 'good';
        if (value <= level.moderate) return 'moderate';
        return 'bad';
    };

    const getPollutantColor = (level) => {
        switch (level) {
            case 'good': return 'text-green-500';
            case 'moderate': return 'text-yellow-500';
            case 'bad': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const colors = getAQIColor(data.aqi);

    return (
        <div className={`rounded-3xl p-6 backdrop-blur-md border transition-all duration-300 ${
            isDark
                ? 'bg-gray-900/30 border-gray-700/50'
                : 'bg-white/20 border-white/30'
        } shadow-2xl`}>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Wind size={28} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Air Quality
                </h2>
            </div>

            {/* AQI Display */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`relative w-20 h-20 rounded-full ${colors.bg}/20 flex items-center justify-center`}>
                        <div className={`w-16 h-16 rounded-full ${colors.bg}/30 flex items-center justify-center`}>
              <span className={`text-2xl font-bold ${colors.text}`}>
                {data.aqi}
              </span>
                        </div>
                    </div>
                    <div>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            AQI {data.aqi}
                        </h3>
                        <p className={`${colors.text} font-medium`}>{data.category}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getHealthImpact(data.aqi)}
                        </p>
                    </div>
                </div>
                {getAQIIcon(data.aqi)}
            </div>

            {/* Pollutants Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(data.pollutants).map(([pollutant, value]) => {
                    const level = getPollutantLevel(pollutant, value);
                    const colorClass = getPollutantColor(level);

                    return (
                        <div
                            key={pollutant}
                            className={`p-4 rounded-xl backdrop-blur-sm border ${
                                isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/30 border-white/20'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {pollutant.toUpperCase()}
                </span>
                                <div className={`w-2 h-2 rounded-full ${
                                    level === 'good' ? 'bg-green-500' :
                                        level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                            </div>
                            <div className={`text-lg font-semibold ${colorClass}`}>
                                {value} {pollutant.includes('co') ? 'mg/m³' : 'μg/m³'}
                            </div>
                            <div className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {level}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Health Recommendations */}
            <div className={`p-4 rounded-xl backdrop-blur-sm border ${
                isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/30 border-white/20'
            }`}>
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className={colors.text} />
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Health Recommendations
                    </h4>
                </div>
                <ul className="space-y-2">
                    {data.recommendations.map((rec, index) => (
                        <li
                            key={index}
                            className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                            {rec}
                        </li>
                    ))}
                </ul>
            </div>

            {/* AQI Scale Reference */}
            <div className="mt-6 pt-4 border-t border-white/20">
                <h5 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    AQI Scale
                </h5>
                <div className="flex justify-between text-xs">
                    <div className="text-center">
                        <div className="w-4 h-2 bg-green-500 rounded mb-1" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>0-50</span>
                    </div>
                    <div className="text-center">
                        <div className="w-4 h-2 bg-yellow-500 rounded mb-1" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>51-100</span>
                    </div>
                    <div className="text-center">
                        <div className="w-4 h-2 bg-orange-500 rounded mb-1" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>101-150</span>
                    </div>
                    <div className="text-center">
                        <div className="w-4 h-2 bg-red-500 rounded mb-1" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>151-200</span>
                    </div>
                    <div className="text-center">
                        <div className="w-4 h-2 bg-purple-500 rounded mb-1" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>201-300</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirQuality;