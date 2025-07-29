import React, { useState, useEffect } from 'react';
import { Plus, X, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CityComparison = () => {
    const [cities, setCities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [comparisonData, setComparisonData] = useState([]);
    const [viewMode, setViewMode] = useState('current'); // current, forecast, charts

    // Mock data for demonstration
    const mockCityData = {
        'New York': {
            country: 'US',
            current: {
                temp: 22,
                feels_like: 25,
                humidity: 65,
                wind_speed: 4.5,
                pressure: 1013,
                visibility: 10,
                uv_index: 6,
                weather: [{ main: 'Clear', description: 'Clear sky' }]
            },
            forecast: [
                { day: 'Today', temp: 22, min: 18, max: 26 },
                { day: 'Tomorrow', temp: 24, min: 20, max: 28 },
                { day: 'Day 3', temp: 21, min: 17, max: 25 }
            ]
        },
        'London': {
            country: 'UK',
            current: {
                temp: 18,
                feels_like: 16,
                humidity: 78,
                wind_speed: 3.2,
                pressure: 1008,
                visibility: 8,
                uv_index: 3,
                weather: [{ main: 'Clouds', description: 'Partly cloudy' }]
            },
            forecast: [
                { day: 'Today', temp: 18, min: 14, max: 22 },
                { day: 'Tomorrow', temp: 19, min: 15, max: 23 },
                { day: 'Day 3', temp: 17, min: 13, max: 21 }
            ]
        },
        'Tokyo': {
            country: 'JP',
            current: {
                temp: 28,
                feels_like: 32,
                humidity: 72,
                wind_speed: 2.8,
                pressure: 1015,
                visibility: 12,
                uv_index: 8,
                weather: [{ main: 'Rain', description: 'Light rain' }]
            },
            forecast: [
                { day: 'Today', temp: 28, min: 24, max: 32 },
                { day: 'Tomorrow', temp: 26, min: 22, max: 30 },
                { day: 'Day 3', temp: 29, min: 25, max: 33 }
            ]
        }
    };

    useEffect(() => {
        if (searchQuery.length > 2) {
            setIsSearching(true);
            // Simulate API search
            setTimeout(() => {
                const results = Object.keys(mockCityData)
                    .filter(city =>
                        city.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        !cities.find(c => c.name === city)
                    )
                    .map(city => ({
                        name: city,
                        country: mockCityData[city].country,
                        temp: mockCityData[city].current.temp
                    }));
                setSearchResults(results);
                setIsSearching(false);
            }, 500);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, cities]);

    const addCity = (cityName) => {
        if (cities.length >= 4) {
            alert('Maximum 4 cities can be compared');
            return;
        }

        const cityData = mockCityData[cityName];
        if (cityData) {
            setCities(prev => [...prev, {
                name: cityName,
                ...cityData
            }]);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const removeCity = (cityName) => {
        setCities(prev => prev.filter(city => city.name !== cityName));
    };

    const metrics = [
        { key: 'temp', label: 'Temperature', unit: '°C', icon: '🌡️' },
        { key: 'feels_like', label: 'Feels Like', unit: '°C', icon: '🔥' },
        { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧' },
        { key: 'wind_speed', label: 'Wind Speed', unit: 'm/s', icon: '💨' },
        { key: 'pressure', label: 'Pressure', unit: 'hPa', icon: '📊' },
        { key: 'visibility', label: 'Visibility', unit: 'km', icon: '👁️' },
        { key: 'uv_index', label: 'UV Index', unit: '', icon: '☀️' }
    ];

    const getComparisonColor = (value, values) => {
        const max = Math.max(...values);
        const min = Math.min(...values);
        if (value === max) return 'text-green-600 dark:text-green-400';
        if (value === min) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getComparisonIcon = (value, values) => {
        const max = Math.max(...values);
        const min = Math.min(...values);
        if (value === max) return <TrendingUp size={16} className="text-green-600 dark:text-green-400" />;
        if (value === min) return <TrendingDown size={16} className="text-red-600 dark:text-red-400" />;
        return <Minus size={16} className="text-gray-400" />;
    };

    const chartData = cities.map(city => ({
        name: city.name,
        temperature: city.current.temp,
        humidity: city.current.humidity,
        windSpeed: city.current.wind_speed,
        pressure: city.current.pressure
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">City Comparison</h1>
                    <p className="text-gray-600 dark:text-gray-400">Compare weather conditions across multiple cities</p>
                </div>

                <div className="flex gap-2">
                    {['current', 'forecast', 'charts'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                                viewMode === mode
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search and Add Cities */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Plus className="text-blue-500" size={24} />
                    <h3 className="text-xl font-semibold">Add Cities to Compare</h3>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for cities to compare..."
                        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                            {searchResults.map(city => (
                                <button
                                    key={city.name}
                                    onClick={() => addCity(city.name)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    <div className="text-left">
                                        <div className="font-medium">{city.name}</div>
                                        <div className="text-sm text-gray-500">{city.country}</div>
                                    </div>
                                    <div className="text-blue-600 dark:text-blue-400 font-semibold">
                                        {city.temp}°C
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {isSearching && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    )}
                </div>

                {/* Selected Cities */}
                {cities.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {cities.map(city => (
                                <div
                                    key={city.name}
                                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full"
                                >
                                    <span className="font-medium">{city.name}</span>
                                    <button
                                        onClick={() => removeCity(city.name)}
                                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Comparison Content */}
            {cities.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No Cities Selected
                    </h3>
                    <p className="text-gray-500">
                        Add at least 2 cities to start comparing their weather conditions
                    </p>
                </div>
            ) : cities.length === 1 ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-gray-500">Add at least one more city to enable comparison</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Current Weather Comparison */}
                    {viewMode === 'current' && (
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-semibold mb-6">Current Weather Comparison</h3>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-semibold">Metric</th>
                                        {cities.map(city => (
                                            <th key={city.name} className="text-center py-3 px-4 font-semibold">
                                                <div>{city.name}</div>
                                                <div className="text-sm text-gray-500 font-normal">{city.country}</div>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {metrics.map(metric => {
                                        const values = cities.map(city => city.current[metric.key] || 0);

                                        return (
                                            <tr key={metric.key} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{metric.icon}</span>
                                                        <span className="font-medium">{metric.label}</span>
                                                    </div>
                                                </td>
                                                {cities.map((city, index) => {
                                                    const value = city.current[metric.key] || 0;
                                                    const colorClass = getComparisonColor(value, values);
                                                    const icon = getComparisonIcon(value, values);

                                                    return (
                                                        <td key={city.name} className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {icon}
                                                                <span className={`font-semibold ${colorClass}`}>
                                    {value}{metric.unit}
                                  </span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Forecast Comparison */}
                    {viewMode === 'forecast' && (
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-semibold mb-6">3-Day Forecast Comparison</h3>

                            <div className="grid gap-6">
                                {cities.map(city => (
                                    <div key={city.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            {city.name}, {city.country}
                                            <span className="text-sm text-gray-500">({city.current.weather[0].description})</span>
                                        </h4>

                                        <div className="grid grid-cols-3 gap-4">
                                            {city.forecast.map((day, index) => (
                                                <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                        {day.day}
                                                    </div>
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                                        {day.temp}°C
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {day.min}° / {day.max}°
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Charts View */}
                    {viewMode === 'charts' && (
                        <div className="space-y-6">
                            {/* Temperature Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-semibold mb-4">Temperature Comparison</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="temperature" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Multi-metric Line Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-semibold mb-4">Multi-Metric Comparison</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="humidity" stroke="#10B981" strokeWidth={2} />
                                            <Line type="monotone" dataKey="windSpeed" stroke="#F59E0B" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-1 bg-green-500"></div>
                                        <span className="text-sm">Humidity (%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-1 bg-yellow-500"></div>
                                        <span className="text-sm">Wind Speed (m/s)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CityComparison;