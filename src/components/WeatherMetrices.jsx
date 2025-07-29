import React from 'react';
import {
    Thermometer,
    Droplets,
    Wind,
    Eye,
    Gauge,
    Sun,
    Moon,
    Compass,
    CloudRain,
    Zap
} from 'lucide-react';

const WeatherMetrics = ({ weatherData, airQuality, uvIndex, unit = 'celsius' }) => {
    const formatTemp = (temp) => {
        if (unit === 'fahrenheit') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    };

    const getWindDirection = (degrees) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(degrees / 22.5) % 16];
    };

    const getUVLevel = (uv) => {
        if (uv <= 2) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500/20' };
        if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
        if (uv <= 7) return { level: 'High', color: 'text-orange-500', bg: 'bg-orange-500/20' };
        if (uv <= 10) return { level: 'Very High', color: 'text-red-500', bg: 'bg-red-500/20' };
        return { level: 'Extreme', color: 'text-purple-500', bg: 'bg-purple-500/20' };
    };

    const getAQILevel = (aqi) => {
        if (aqi <= 50) return { level: 'Good', color: 'text-green-500', bg: 'bg-green-500/20' };
        if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
        if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', bg: 'bg-orange-500/20' };
        if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-500/20' };
        return { level: 'Hazardous', color: 'text-purple-500', bg: 'bg-purple-500/20' };
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const metrics = [
        {
            title: 'Temperature',
            icon: <Thermometer className="text-red-400" />,
            value: `${formatTemp(weatherData?.main?.temp)}°${unit === 'celsius' ? 'C' : 'F'}`,
            subtitle: `Feels like ${formatTemp(weatherData?.main?.feels_like)}°${unit === 'celsius' ? 'C' : 'F'}`,
            gradient: 'from-red-500/20 to-orange-500/20'
        },
        {
            title: 'Humidity',
            icon: <Droplets className="text-blue-400" />,
            value: `${weatherData?.main?.humidity}%`,
            subtitle: weatherData?.main?.humidity > 60 ? 'High' : weatherData?.main?.humidity < 30 ? 'Low' : 'Comfortable',
            gradient: 'from-blue-500/20 to-cyan-500/20'
        },
        {
            title: 'Wind Speed',
            icon: <Wind className="text-gray-300" />,
            value: `${weatherData?.wind?.speed} m/s`,
            subtitle: `${getWindDirection(weatherData?.wind?.deg)} (${weatherData?.wind?.deg}°)`,
            gradient: 'from-gray-500/20 to-slate-500/20'
        },
        {
            title: 'Pressure',
            icon: <Gauge className="text-purple-400" />,
            value: `${weatherData?.main?.pressure} hPa`,
            subtitle: weatherData?.main?.pressure > 1013 ? 'High' : 'Low',
            gradient: 'from-purple-500/20 to-indigo-500/20'
        },
        {
            title: 'Visibility',
            icon: <Eye className="text-yellow-400" />,
            value: `${weatherData?.visibility ? (weatherData.visibility / 1000).toFixed(1) : 'N/A'} km`,
            subtitle: weatherData?.visibility > 10000 ? 'Excellent' : weatherData?.visibility > 5000 ? 'Good' : 'Poor',
            gradient: 'from-yellow-500/20 to-amber-500/20'
        },
        {
            title: 'Dew Point',
            icon: <CloudRain className="text-teal-400" />,
            value: `${formatTemp(weatherData?.main?.temp - ((100 - weatherData?.main?.humidity) / 5))}°${unit === 'celsius' ? 'C' : 'F'}`,
            subtitle: 'Comfort level',
            gradient: 'from-teal-500/20 to-cyan-500/20'
        }
    ];

    // Add UV Index if available
    if (uvIndex !== undefined) {
        const uvInfo = getUVLevel(uvIndex);
        metrics.push({
            title: 'UV Index',
            icon: <Sun className="text-yellow-500" />,
            value: uvIndex.toFixed(1),
            subtitle: uvInfo.level,
            gradient: 'from-yellow-500/20 to-orange-500/20',
            textColor: uvInfo.color
        });
    }

    // Add Air Quality if available
    if (airQuality) {
        const aqiInfo = getAQILevel(airQuality.aqi);
        metrics.push({
            title: 'Air Quality',
            icon: <Zap className="text-green-400" />,
            value: airQuality.aqi,
            subtitle: aqiInfo.level,
            gradient: 'from-green-500/20 to-emerald-500/20',
            textColor: aqiInfo.color
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
                <Gauge className="text-blue-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Weather Metrics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className={`bg-gradient-to-br ${metric.gradient} backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/10 rounded-lg">
                                {React.cloneElement(metric.icon, { size: 24 })}
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-white/60 uppercase tracking-wide">
                                    {metric.title}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className={`text-2xl font-bold ${metric.textColor || 'text-white'}`}>
                                {metric.value}
                            </div>
                            <div className="text-sm text-white/70">
                                {metric.subtitle}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sunrise/Sunset Card */}
            <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                    <Sun className="text-orange-400" size={24} />
                    <h3 className="text-xl font-semibold text-white">Sun Times</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Sun className="text-yellow-400" size={20} />
                            <span className="text-white/80">Sunrise</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {formatTime(weatherData?.sys?.sunrise)}
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Moon className="text-gray-300" size={20} />
                            <span className="text-white/80">Sunset</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {formatTime(weatherData?.sys?.sunset)}
                        </div>
                    </div>
                </div>

                {/* Daylight Duration */}
                <div className="mt-4 pt-4 border-t border-white/20 text-center">
                    <div className="text-sm text-white/70 mb-1">Daylight Duration</div>
                    <div className="text-lg font-semibold text-white">
                        {Math.floor((weatherData?.sys?.sunset - weatherData?.sys?.sunrise) / 3600)}h {Math.floor(((weatherData?.sys?.sunset - weatherData?.sys?.sunrise) % 3600) / 60)}m
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherMetrics;