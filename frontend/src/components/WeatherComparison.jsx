import React, { useState, useEffect } from 'react';
import { Plus, X, BarChart3, TrendingUp, TrendingDown, Droplets, Wind, Eye, Thermometer } from 'lucide-react';

const WeatherComparison = ({ onAddLocation }) => {
    const [comparedCities, setComparedCities] = useState([
        {
            id: 1,
            name: 'New Delhi',
            country: 'India',
            temperature: 33,
            feelsLike: 40,
            condition: 'Broken Clouds',
            humidity: 60,
            windSpeed: 4.15,
            pressure: 996,
            visibility: 9.2,
            icon: '☁️'
        },
        {
            id: 2,
            name: 'Mumbai',
            country: 'India',
            temperature: 29,
            feelsLike: 35,
            condition: 'Partly Cloudy',
            humidity: 78,
            windSpeed: 12.5,
            pressure: 1008,
            visibility: 8.5,
            icon: '⛅'
        },
        {
            id: 3,
            name: 'London',
            country: 'UK',
            temperature: 18,
            feelsLike: 16,
            condition: 'Light Rain',
            humidity: 85,
            windSpeed: 6.2,
            pressure: 1012,
            visibility: 4.8,
            icon: '🌧️'
        }
    ]);

    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
    const [sortBy, setSortBy] = useState('temperature');

    const removeCity = (cityId) => {
        setComparedCities(prev => prev.filter(city => city.id !== cityId));
    };

    const addNewCity = () => {
        if (onAddLocation) {
            onAddLocation();
        }
    };

    const getSortedCities = () => {
        return [...comparedCities].sort((a, b) => {
            switch (sortBy) {
                case 'temperature':
                    return b.temperature - a.temperature;
                case 'humidity':
                    return b.humidity - a.humidity;
                case 'windSpeed':
                    return b.windSpeed - a.windSpeed;
                case 'pressure':
                    return b.pressure - a.pressure;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    };

    const getTemperatureColor = (temp) => {
        if (temp >= 35) return 'text-red-400';
        if (temp >= 25) return 'text-orange-400';
        if (temp >= 15) return 'text-yellow-400';
        if (temp >= 5) return 'text-blue-400';
        return 'text-cyan-400';
    };

    const getHumidityColor = (humidity) => {
        if (humidity >= 80) return 'text-blue-400';
        if (humidity >= 60) return 'text-green-400';
        if (humidity >= 40) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getWindSpeedLevel = (speed) => {
        if (speed >= 15) return { level: 'Strong', color: 'text-red-400' };
        if (speed >= 10) return { level: 'Moderate', color: 'text-orange-400' };
        if (speed >= 5) return { level: 'Light', color: 'text-green-400' };
        return { level: 'Calm', color: 'text-blue-400' };
    };

    const ComparisonCard = ({ city }) => (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-bold text-white text-lg">{city.name}</h3>
                    <p className="text-gray-300 text-sm">{city.country}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl">{city.icon}</span>
                    <button
                        onClick={() => removeCity(city.id)}
                        className="p-1 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Temperature */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-300">Temperature</span>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getTemperatureColor(city.temperature)}`}>
                            {city.temperature}°C
                        </div>
                        <div className="text-xs text-gray-400">Feels like {city.feelsLike}°C</div>
                    </div>
                </div>

                {/* Condition */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Condition</span>
                    <span className="text-white font-medium">{city.condition}</span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-gray-400">Humidity</span>
                        </div>
                        <div className={`font-semibold ${getHumidityColor(city.humidity)}`}>
                            {city.humidity}%
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Wind className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-gray-400">Wind</span>
                        </div>
                        <div className={`font-semibold ${getWindSpeedLevel(city.windSpeed).color}`}>
                            {city.windSpeed} m/s
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <BarChart3 className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-gray-400">Pressure</span>
                        </div>
                        <div className="font-semibold text-purple-400">
                            {city.pressure} hPa
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs text-gray-400">Visibility</span>
                        </div>
                        <div className="font-semibold text-cyan-400">
                            {city.visibility} km
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ComparisonTable = () => (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/10">
                    <tr>
                        <th className="text-left p-4 text-white font-semibold">City</th>
                        <th className="text-center p-4 text-white font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setSortBy('temperature')}>
                            <div className="flex items-center justify-center gap-1">
                                <Thermometer className="w-4 h-4" />
                                Temperature
                                {sortBy === 'temperature' && <TrendingDown className="w-3 h-3" />}
                            </div>
                        </th>
                        <th className="text-center p-4 text-white font-semibold">Condition</th>
                        <th className="text-center p-4 text-white font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setSortBy('humidity')}>
                            <div className="flex items-center justify-center gap-1">
                                <Droplets className="w-4 h-4" />
                                Humidity
                                {sortBy === 'humidity' && <TrendingDown className="w-3 h-3" />}
                            </div>
                        </th>
                        <th className="text-center p-4 text-white font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setSortBy('windSpeed')}>
                            <div className="flex items-center justify-center gap-1">
                                <Wind className="w-4 h-4" />
                                Wind
                                {sortBy === 'windSpeed' && <TrendingDown className="w-3 h-3" />}
                            </div>
                        </th>
                        <th className="text-center p-4 text-white font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setSortBy('pressure')}>
                            <div className="flex items-center justify-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                Pressure
                                {sortBy === 'pressure' && <TrendingDown className="w-3 h-3" />}
                            </div>
                        </th>
                        <th className="text-center p-4 text-white font-semibold">Visibility</th>
                        <th className="text-center p-4 text-white font-semibold">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {getSortedCities().map((city, index) => (
                        <tr key={city.id} className={`border-t border-white/10 hover:bg-white/5 transition-colors ${
                            index % 2 === 0 ? 'bg-white/5' : ''
                        }`}>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{city.icon}</span>
                                    <div>
                                        <div className="font-semibold text-white">{city.name}</div>
                                        <div className="text-sm text-gray-300">{city.country}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <div className={`text-xl font-bold ${getTemperatureColor(city.temperature)}`}>
                                    {city.temperature}°C
                                </div>
                                <div className="text-xs text-gray-400">Feels {city.feelsLike}°C</div>
                            </td>
                            <td className="p-4 text-center">
                                <span className="text-white">{city.condition}</span>
                            </td>
                            <td className="p-4 text-center">
                                    <span className={`font-semibold ${getHumidityColor(city.humidity)}`}>
                                        {city.humidity}%
                                    </span>
                            </td>
                            <td className="p-4 text-center">
                                <div className={`font-semibold ${getWindSpeedLevel(city.windSpeed).color}`}>
                                    {city.windSpeed} m/s
                                </div>
                                <div className="text-xs text-gray-400">
                                    {getWindSpeedLevel(city.windSpeed).level}
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                    <span className="font-semibold text-purple-400">
                                        {city.pressure} hPa
                                    </span>
                            </td>
                            <td className="p-4 text-center">
                                    <span className="font-semibold text-cyan-400">
                                        {city.visibility} km
                                    </span>
                            </td>
                            <td className="p-4 text-center">
                                <button
                                    onClick={() => removeCity(city.id)}
                                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Weather Comparison</h2>
                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                viewMode === 'cards'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Table
                        </button>
                    </div>

                    {/* Add City Button */}
                    <button
                        onClick={addNewCity}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add City
                    </button>
                </div>
            </div>

            {/* Comparison Stats */}
            {comparedCities.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Hottest</div>
                            <div className="font-bold text-red-400">
                                {Math.max(...comparedCities.map(c => c.temperature))}°C
                            </div>
                            <div className="text-xs text-gray-500">
                                {comparedCities.find(c => c.temperature === Math.max(...comparedCities.map(city => city.temperature)))?.name}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Coldest</div>
                            <div className="font-bold text-cyan-400">
                                {Math.min(...comparedCities.map(c => c.temperature))}°C
                            </div>
                            <div className="text-xs text-gray-500">
                                {comparedCities.find(c => c.temperature === Math.min(...comparedCities.map(city => city.temperature)))?.name}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Most Humid</div>
                            <div className="font-bold text-blue-400">
                                {Math.max(...comparedCities.map(c => c.humidity))}%
                            </div>
                            <div className="text-xs text-gray-500">
                                {comparedCities.find(c => c.humidity === Math.max(...comparedCities.map(city => city.humidity)))?.name}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Windiest</div>
                            <div className="font-bold text-green-400">
                                {Math.max(...comparedCities.map(c => c.windSpeed))} m/s
                            </div>
                            <div className="text-xs text-gray-500">
                                {comparedCities.find(c => c.windSpeed === Math.max(...comparedCities.map(city => city.windSpeed)))?.name}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Content */}
            {comparedCities.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Cities to Compare</h3>
                        <p className="text-gray-400 mb-6">Add cities to start comparing weather conditions</p>
                        <button
                            onClick={addNewCity}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-colors mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First City
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {viewMode === 'cards' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getSortedCities().map(city => (
                                <ComparisonCard key={city.id} city={city} />
                            ))}
                        </div>
                    ) : (
                        <ComparisonTable />
                    )}
                </>
            )}

            {/* Footer Info */}
            {comparedCities.length > 0 && (
                <div className="text-center text-sm text-gray-400">
                    Comparing {comparedCities.length} cities • Data updated every 30 minutes
                </div>
            )}
        </div>
    );
};

export default WeatherComparison;

