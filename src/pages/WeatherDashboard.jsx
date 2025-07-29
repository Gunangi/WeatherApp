import React, { useEffect, useState } from 'react';
import {
    Thermometer,
    Droplets,
    Wind,
    Eye,
    Gauge,
    Sunrise,
    Sunset,
    MapPin,
    RefreshCw,
    Heart,
    Share2,
    Calendar,
    Clock
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import { useGeolocation } from '../hooks/useGeolocation';
import LoadingSpinner, { WeatherSkeleton } from '../components/layout/LoadingSpinner';

const WeatherDashboard = () => {
    const {
        currentWeather,
        forecast,
        airQuality,
        location,
        loading,
        error,
        units,
        fetchWeatherData,
        refreshWeatherData,
        isLocationFavorite,
        addFavoriteLocation,
        removeFavoriteLocation
    } = useWeather();

    const { isDark } = useTheme();
    const { getCurrentLocation, loading: locationLoading } = useGeolocation();
    const [lastRefresh, setLastRefresh] = useState(null);

    // Get user's location on component mount
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                const position = await getCurrentLocation();
                await fetchWeatherData(position.coords.latitude, position.coords.longitude);
                setLastRefresh(new Date());
            } catch (error) {
                console.error('Failed to get location:', error);
                // Fallback to a default location (e.g., Delhi)
                await fetchWeatherData(28.6139, 77.2090, 'Delhi, IN');
                setLastRefresh(new Date());
            }
        };

        if (!currentWeather) {
            initializeLocation();
        }
    }, []);

    // Handle refresh
    const handleRefresh = async () => {
        await refreshWeatherData();
        setLastRefresh(new Date());
    };

    // Handle favorite toggle
    const handleFavoriteToggle = () => {
        if (isLocationFavorite(location.lat, location.lon)) {
            removeFavoriteLocation(location);
        } else {
            addFavoriteLocation(location);
        }
    };

    // Get weather icon
    const getWeatherIcon = (iconCode) => {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[iconCode] || '🌤️';
    };

    // Format time
    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get AQI color and label
    const getAQIInfo = (aqi) => {
        const levels = {
            1: { label: 'Good', color: 'text-green-500', bg: 'bg-green-500/20' },
            2: { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
            3: { label: 'Moderate', color: 'text-orange-500', bg: 'bg-orange-500/20' },
            4: { label: 'Poor', color: 'text-red-500', bg: 'bg-red-500/20' },
            5: { label: 'Very Poor', color: 'text-purple-500', bg: 'bg-purple-500/20' }
        };
        return levels[aqi] || levels[1];
    };

    if (loading || locationLoading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto p-6">
                    <LoadingSpinner variant="weather-states" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto p-6">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🌫️</div>
                        <h2 className="text-2xl font-bold mb-2">Weather Data Unavailable</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto p-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Weather Dashboard</h1>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{location.city}, {location.country}</span>
                            {lastRefresh && (
                                <>
                                    <span className="mx-2">•</span>
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>Updated {lastRefresh.toLocaleTimeString()}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                        <button
                            onClick={handleFavoriteToggle}
                            className={`
                p-2 rounded-lg transition-colors
                ${isLocationFavorite(location.lat, location.lon)
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
              `}
                        >
                            <Heart className={
                                isLocationFavorite(location.lat, location.lon)
                                    ? 'w-5 h-5 fill-current'
                                    : 'w-5 h-5'
                            } />
                        </button>

                        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Main Weather Card */}
                {currentWeather && (
                    <div className={`
            rounded-2xl border backdrop-blur-md mb-8 overflow-hidden
            ${isDark
                        ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700'
                        : 'bg-gradient-to-br from-white/50 to-blue-50/50 border-gray-200'
                    }
          `}>
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Current Weather */}
                                <div className="text-center lg:text-left">
                                    <div className="flex items-center justify-center lg:justify-start mb-4">
                    <span className="text-8xl mr-4">
                      {getWeatherIcon(currentWeather.weather[0].icon)}
                    </span>
                                        <div>
                                            <div className="text-6xl font-bold">
                                                {Math.round(currentWeather.main.temp)}°
                                                <span className="text-2xl text-gray-500">
                          {units === 'metric' ? 'C' : 'F'}
                        </span>
                                            </div>
                                            <div className="text-xl text-gray-600 dark:text-gray-400">
                                                Feels like {Math.round(currentWeather.main.feels_like)}°
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h2 className="text-2xl font-semibold capitalize mb-2">
                                            {currentWeather.weather[0].description}
                                        </h2>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            High {Math.round(currentWeather.main.temp_max)}° •
                                            Low {Math.round(currentWeather.main.temp_min)}°
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 dark:bg-gray-800/30 rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <Droplets className="w-5 h-5 text-blue-400 mr-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
                                        </div>
                                        <div className="text-2xl font-bold">{currentWeather.main.humidity}%</div>
                                    </div>

                                    <div className="bg-white/10 dark:bg-gray-800/30 rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <Wind className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Wind</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {Math.round(currentWeather.wind?.speed || 0)}
                                            <span className="text-sm">m/s</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 dark:bg-gray-800/30 rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <Gauge className="w-5 h-5 text-purple-400 mr-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Pressure</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {currentWeather.main.pressure}
                                            <span className="text-sm">hPa</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 dark:bg-gray-800/30 rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <Eye className="w-5 h-5 text-green-400 mr-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Visibility</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {(currentWeather.visibility / 1000).toFixed(1)}
                                            <span className="text-sm">km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sun Times */}
                        <div className="px-8 pb-8">
                            <div className="flex items-center justify-center space-x-8 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                                <div className="flex items-center space-x-2">
                                    <Sunrise className="w-5 h-5 text-orange-400" />
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Sunrise</div>
                                        <div className="font-semibold">{formatTime(currentWeather.sys.sunrise)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Sunset className="w-5 h-5 text-orange-600" />
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Sunset</div>
                                        <div className="font-semibold">{formatTime(currentWeather.sys.sunset)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* 5-Day Forecast */}
                    {forecast && (
                        <div className={`
              rounded-2xl border backdrop-blur-md p-6
              ${isDark
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white/50 border-gray-200'
                        }
            `}>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                5-Day Forecast
                            </h3>

                            <div className="space-y-3">
                                {forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5).map((day, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200/20 dark:border-gray-700/20 last:border-b-0">
                                        <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getWeatherIcon(day.weather[0].icon)}
                      </span>
                                            <div>
                                                <div className="font-medium">
                                                    {index === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'long' })}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {day.weather[0].description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">
                                                {Math.round(day.main.temp_max)}°/{Math.round(day.main.temp_min)}°
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {day.main.humidity}% humidity
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Air Quality */}
                    {airQuality && (
                        <div className={`
              rounded-2xl border backdrop-blur-md p-6
              ${isDark
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white/50 border-gray-200'
                        }
            `}>
                            <h3 className="text-xl font-bold mb-4">Air Quality Index</h3>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span>Overall AQI</span>
                                    <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${getAQIInfo(airQuality.list[0].main.aqi).color}
                    ${getAQIInfo(airQuality.list[0].main.aqi).bg}
                  `}>
                                        {getAQIInfo(airQuality.list[0].main.aqi).label}
                                    </div>
                                </div>
                                <div className="text-3xl font-bold">
                                    {airQuality.list[0].main.aqi}/5
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(airQuality.list[0].components).map(([key, value]) => (
                                    <div key={key} className="text-center p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 uppercase mb-1">
                                            {key}
                                        </div>
                                        <div className="font-bold">
                                            {value.toFixed(1)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeatherDashboard;