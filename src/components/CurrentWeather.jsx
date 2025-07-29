import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Eye, Droplets, Thermometer } from 'lucide-react';

const CurrentWeather = ({ weatherData, unit = 'celsius' }) => {
    if (!weatherData) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-4"></div>
                <div className="h-16 bg-white/20 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-white/20 rounded"></div>
                    <div className="h-12 bg-white/20 rounded"></div>
                </div>
            </div>
        );
    }

    const getWeatherIcon = (condition) => {
        const iconProps = { size: 48, className: "text-yellow-400" };

        switch (condition?.toLowerCase()) {
            case 'clear':
                return <Sun {...iconProps} />;
            case 'clouds':
            case 'broken clouds':
            case 'scattered clouds':
                return <Cloud {...iconProps} className="text-gray-300" />;
            case 'rain':
            case 'light rain':
            case 'moderate rain':
                return <CloudRain {...iconProps} className="text-blue-400" />;
            case 'snow':
                return <CloudSnow {...iconProps} className="text-white" />;
            default:
                return <Cloud {...iconProps} className="text-gray-300" />;
        }
    };

    const formatTemp = (temp) => {
        if (unit === 'fahrenheit') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl border border-white/10">
            {/* Location and Time */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">{weatherData.name}</h2>
                <p className="text-white/80">{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
            </div>

            {/* Main Weather Display */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    {getWeatherIcon(weatherData.weather?.[0]?.main)}
                    <div>
                        <div className="text-5xl font-bold">
                            {formatTemp(weatherData.main?.temp)}°{unit === 'celsius' ? 'C' : 'F'}
                        </div>
                        <div className="text-white/80 capitalize">
                            {weatherData.weather?.[0]?.description}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm text-white/80 mb-1">Feels like</div>
                    <div className="text-2xl font-semibold">
                        {formatTemp(weatherData.main?.feels_like)}°{unit === 'celsius' ? 'C' : 'F'}
                    </div>
                </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                        <Wind size={20} className="text-blue-300" />
                        <span className="text-sm text-white/80">Wind</span>
                    </div>
                    <div className="text-xl font-semibold">{weatherData.wind?.speed} m/s</div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                        <Droplets size={20} className="text-blue-400" />
                        <span className="text-sm text-white/80">Humidity</span>
                    </div>
                    <div className="text-xl font-semibold">{weatherData.main?.humidity}%</div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                        <Thermometer size={20} className="text-red-400" />
                        <span className="text-sm text-white/80">Pressure</span>
                    </div>
                    <div className="text-xl font-semibold">{weatherData.main?.pressure} hPa</div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                        <Eye size={20} className="text-gray-300" />
                        <span className="text-sm text-white/80">Visibility</span>
                    </div>
                    <div className="text-xl font-semibold">
                        {weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) : 'N/A'} km
                    </div>
                </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="flex justify-between mt-6 pt-4 border-t border-white/20">
                <div className="text-center">
                    <div className="text-sm text-white/80 mb-1">Sunrise</div>
                    <div className="font-semibold">{formatTime(weatherData.sys?.sunrise)}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-white/80 mb-1">Sunset</div>
                    <div className="font-semibold">{formatTime(weatherData.sys?.sunset)}</div>
                </div>
            </div>
        </div>
    );
};

export default CurrentWeather;