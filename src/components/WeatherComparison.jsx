import React, { useState, useEffect } from 'react';
import { Plus, X, MapPin, Thermometer, Droplets, Wind, Eye, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const WeatherComparison = ({ initialCities = [] }) => {
    const [cities, setCities] = useState(initialCities);
    const [newCity, setNewCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [weatherData, setWeatherData] = useState({});

    useEffect(() => {
        if (cities.length > 0) {
            fetchWeatherData();
        }
    }, [cities]);

    const fetchWeatherData = async () => {
        setLoading(true);
        const data = {};

        // Mock weather data for demonstration
        for (const city of cities) {
            // In real implementation, fetch from OpenWeatherMap API
            data[city] = {
                name: city,
                main: {
                    temp: Math.round(Math.random() * 30 + 10),
                    feels_like: Math.round(Math.random() * 30 + 12),
                    humidity: Math.round(Math.random() * 40 + 40),
                    pressure: Math.round(Math.random() * 50 + 990)
                },
                weather: [
                    {
                        main: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
                        description: 'partly cloudy'
                    }
                ],
                wind: {
                    speed: Math.round(Math.random() * 10 + 2),
                    deg: Math.round(Math.random() * 360)
                },
                visibility: Math.round(Math.random() * 5000 + 5000),
                sys: {
                    sunrise: Date.now() / 1000 - 3600,
                    sunset: Date.now() / 1000 + 3600
                }
            };
        }

        setWeatherData(data);
        setLoading(false);
    };

    const addCity = async () => {
        if (newCity.trim() && !cities.includes(newCity.trim()) && cities.length < 5) {
            setCities([...cities, newCity.trim()]);
            setNewCity('');
        }
    };

    const removeCity = (cityToRemove) => {
        setCities(cities.filter(city => city !== cityToRemove));
        const newData = { ...weatherData };
        delete newData[cityToRemove];
        setWeatherData(newData);
    };

    const getWeatherIcon = (condition) => {
        const iconClass = "w-8 h-8";
        switch (condition?.toLowerCase()) {
            case 'clear':
                return <div className={`${iconClass} bg-yellow-400 rounded-full`}></div>;
            case 'clouds':
                return <div className={`${iconClass} bg-gray-400 rounded-lg`}></div>;
            case 'rain':
                return <div className={`${iconClass} bg-blue-400 rounded-lg`}></div>;
            case 'snow':
                return <div className={`${iconClass} bg-white rounded-lg`}></div>;
            default:
                return <div className={`${iconClass} bg-gray-400 rounded-lg`}></div>;
        }
    };

    const getComparisonInsights = () => {
        if (Object.keys(weatherData).length < 2) return [];

        const temps = Object.values(weatherData).map(data => data.main.temp);
        const humidities = Object.values(weatherData).map(data => data.main.humidity);
        const windSpeeds = Object.values(weatherData).map(data => data.wind.speed);

        const insights = [];

        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        const hottestCity = Object.keys(weatherData).find(city => weatherData[city].main.temp === maxTemp);
        const coldestCity = Object.keys(weatherData).find(city => weatherData[city].main.temp === minTemp);

        if (maxTemp !== minTemp) {
            insights.push({
                type: 'temperature',
                message: `${hottestCity} is ${maxTemp - minTemp}°C warmer than ${coldestCity}`,
                icon: <Thermometer className="text-red-400" size={16} />
            });
        }

        const maxHumidity = Math.max(...humidities);
        const minHumidity = Math.min(...humidities);
        if (maxHumidity - minHumidity > 20) {
            const humidCity = Object.keys(weatherData).find(city => weatherData[city].main.humidity === maxHumidity);
            const dryCity = Object.keys(weatherData).find(city => weatherData[city].main.humidity === minHumidity);
            insights.push({
                type: 'humidity',
                message: `${humidCity} is ${maxHumidity - minHumidity}% more humid than ${dryCity}`,
                icon: <Droplets className="text-blue-400" size={16} />
            });
        }

        return insights;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <BarChart3 className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Weather Comparison</h2>
                </div>
                <div className="text-sm text-white/60">
                    Compare up to 5 cities
                </div>
            </div>

            {/* Add City Input */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="Enter city name..."
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                            onKeyPress={(e) => e.key === 'Enter' && addCity()}
                        />
                    </div>
                    <button
                        onClick={addCity}
                        disabled={cities.length >= 5 || !newCity.trim()}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Add City</span>
                    </button>
                </div>
                {cities.length >= 5 && (
                    <p className="text-yellow-400 text-sm mt-2">Maximum 5 cities can be compared</p>
                )}
            </div>

            {/* Comparison Insights */}
            {getComparisonInsights().length > 0 && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
                    <div className="space-y-3">
                        {getComparisonInsights().map((insight, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                {insight.icon}
                                <span className="text-white/80">{insight.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weather Cards Grid */}
            {cities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cities.map((city) => {
                        const data = weatherData[city];
                        if (!data && loading) {
                            return (
                                <div key={city} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                                    <div className="h-6 bg-white/20 rounded mb-4"></div>
                                    <div className="h-16 bg-white/20 rounded mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-white/20 rounded"></div>
                                        <div className="h-4 bg-white/20 rounded"></div>
                                    </div>
                                </div>
                            );
                        }

                        if (!data) return null;

                        return (
                            <div
                                key={city}
                                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 relative group"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeCity(city)}
                                    className="absolute top-4 right-4 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} className="text-red-400" />
                                </button>

                                {/* City Header */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="text-blue-400" size={20} />
                                    <h3 className="text-xl font-bold text-white">{data.name}</h3>
                                </div>

                                {/* Main Weather Display */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        {getWeatherIcon(data.weather[0].main)}
                                        <div>
                                            <div className="text-3xl font-bold text-white">
                                                {data.main.temp}°C
                                            </div>
                                            <div className="text-white/70 capitalize">
                                                {data.weather[0].description}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Thermometer size={16} className="text-red-400" />
                                            <span className="text-white/80 text-sm">Feels like</span>
                                        </div>
                                        <span className="text-white font-medium">{data.main.feels_like}°C</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Droplets size={16} className="text-blue-400" />
                                            <span className="text-white/80 text-sm">Humidity</span>
                                        </div>
                                        <span className="text-white font-medium">{data.main.humidity}%</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Wind size={16} className="text-gray-300" />
                                            <span className="text-white/80 text-sm">Wind</span>
                                        </div>
                                        <span className="text-white font-medium">{data.wind.speed} m/s</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Eye size={16} className="text-yellow-400" />
                                            <span className="text-white/80 text-sm">Visibility</span>
                                        </div>
                                        <span className="text-white font-medium">
                      {(data.visibility / 1000).toFixed(1)} km
                    </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Comparison Table */}
            {cities.length > 1 && Object.keys(weatherData).length > 1 && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Detailed Comparison</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left py-3 px-4">City</th>
                                <th className="text-left py-3 px-4">Temperature</th>
                                <th className="text-left py-3 px-4">Feels Like</th>
                                <th className="text-left py-3 px-4">Humidity</th>
                                <th className="text-left py-3 px-4">Wind Speed</th>
                                <th className="text-left py-3 px-4">Pressure</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(weatherData).map(([city, data]) => (
                                <tr key={city} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="py-3 px-4 font-medium">{city}</td>
                                    <td className="py-3 px-4">{data.main.temp}°C</td>
                                    <td className="py-3 px-4">{data.main.feels_like}°C</td>
                                    <td className="py-3 px-4">{data.main.humidity}%</td>
                                    <td className="py-3 px-4">{data.wind.speed} m/s</td>
                                    <td className="py-3 px-4">{data.main.pressure} hPa</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {cities.length === 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/10 text-center">
                    <BarChart3 className="text-white/40 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">No Cities to Compare</h3>
                    <p className="text-white/60 mb-6">Add cities above to start comparing weather conditions</p>
                </div>
            )}
        </div>
    );
};

export default WeatherComparison;