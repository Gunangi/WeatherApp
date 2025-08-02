import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Eye, Wind, Droplets, Gauge, Sunrise, Sunset } from 'lucide-react';

const WeatherDisplay = ({ weatherData, isDark = false }) => {
    // Mock data if no weatherData provided
    const data = weatherData || {
        location: "Delhi",
        country: "IN",
        temperature: 33,
        feelsLike: 40,
        condition: "Broken Clouds",
        humidity: 60,
        windSpeed: 4.15,
        pressure: 996,
        visibility: 9.2,
        sunrise: "05:40 AM",
        sunset: "07:14 PM",
        localTime: "14:30"
    };

    const getWeatherIcon = (condition) => {
        const iconProps = { size: 64, className: "text-white drop-shadow-lg" };

        if (condition.toLowerCase().includes('cloud')) return <Cloud {...iconProps} />;
        if (condition.toLowerCase().includes('rain')) return <CloudRain {...iconProps} />;
        if (condition.toLowerCase().includes('snow')) return <CloudSnow {...iconProps} />;
        return <Sun {...iconProps} />;
    };

    const formatTime = (time) => {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`rounded-3xl p-8 backdrop-blur-md border transition-all duration-300 ${
            isDark
                ? 'bg-gray-900/30 border-gray-700/50 text-white'
                : 'bg-white/20 border-white/30 text-gray-800'
        } shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]`}>

            {/* Location and Time Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{data.location}</h1>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {data.country} • {formatTime()}
                    </p>
                </div>
                <div className="text-right">
                    {getWeatherIcon(data.condition)}
                </div>
            </div>

            {/* Main Temperature Display */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-7xl font-thin mb-2">{data.temperature}°</div>
                    <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {data.condition}
                    </p>
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Feels like {data.feelsLike}°C
                    </p>
                </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {/* Humidity */}
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                    isDark ? 'bg-white/10' : 'bg-white/30'
                } border border-white/20`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Droplets size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Humidity
            </span>
                    </div>
                    <p className="text-2xl font-semibold">{data.humidity}%</p>
                </div>

                {/* Wind Speed */}
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                    isDark ? 'bg-white/10' : 'bg-white/30'
                } border border-white/20`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Wind size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Wind Speed
            </span>
                    </div>
                    <p className="text-2xl font-semibold">{data.windSpeed} m/s</p>
                </div>

                {/* Pressure */}
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                    isDark ? 'bg-white/10' : 'bg-white/30'
                } border border-white/20`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Gauge size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Pressure
            </span>
                    </div>
                    <p className="text-2xl font-semibold">{data.pressure} hPa</p>
                </div>

                {/* Visibility */}
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                    isDark ? 'bg-white/10' : 'bg-white/30'
                } border border-white/20`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Eye size={20} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Visibility
            </span>
                    </div>
                    <p className="text-2xl font-semibold">{data.visibility} km</p>
                </div>

                {/* Sunrise */}
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                    isDark ? 'bg-white/10' : 'bg-white/30'
                } border border-white/20`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Sunrise size={20} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Sunrise
            </span>
                    </div>
                    <p className="text-2xl font-semibold">{data.sunrise}</p>
                </div>

                {/* Sunset */}
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                    isDark ? 'bg-white/10' : 'bg-white/30'
                } border border-white/20`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Sunset size={20} className={isDark ? 'text-red-400' : 'text-red-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Sunset
            </span>
                    </div>
                    <p className="text-2xl font-semibold">{data.sunset}</p>
                </div>

            </div>
        </div>
    );
};

export default WeatherDisplay;