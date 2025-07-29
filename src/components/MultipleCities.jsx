import React, { useState, useEffect } from 'react';
import { Plus, X, MapPin, Star, StarOff, Search, Thermometer, Eye, Wind } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from './layout/LoadingSpinner';

const MultipleCities = () => {
    const [cities, setCities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const { fetchWeatherData } = useWeather();
    const { theme } = useTheme();

    // Load saved cities and favorites from localStorage
    useEffect(() => {
        const savedCities = JSON.parse(localStorage.getItem('multipleCities') || '[]');
        const savedFavorites = new Set(JSON.parse(localStorage.getItem('favoriteCities') || '[]'));
        setCities(savedCities);
        setFavorites(savedFavorites);
    }, []);

    // Save cities to localStorage whenever cities change
    useEffect(() => {
        localStorage.setItem('multipleCities', JSON.stringify(cities));
    }, [cities]);

    // Save favorites to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('favoriteCities', JSON.stringify([...favorites]));
    }, [favorites]);

    // Search for cities
    const searchCities = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Mock search results - replace with actual geocoding API
            const mockResults = [
                { id: 1, name: query, country: 'Country', lat: 0, lon: 0 },
                { id: 2, name: `${query} City`, country: 'Country', lat: 0, lon: 0 }
            ];
            setSearchResults(mockResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Add city to the list
    const addCity = async (cityData) => {
        setLoading(true);
        try {
            const weatherData = await fetchWeatherData(cityData.lat, cityData.lon);
            const newCity = {
                id: Date.now(),
                name: cityData.name,
                country: cityData.country,
                lat: cityData.lat,
                lon: cityData.lon,
                weather: weatherData,
                addedAt: new Date().toISOString()
            };

            setCities(prev => [...prev, newCity]);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('Error adding city:', error);
        } finally {
            setLoading(false);
        }
    };

    // Remove city from the list
    const removeCity = (cityId) => {
        setCities(prev => prev.filter(city => city.id !== cityId));
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(cityId);
            return newFavorites;
        });
    };

    // Toggle favorite status
    const toggleFavorite = (cityId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(cityId)) {
                newFavorites.delete(cityId);
            } else {
                newFavorites.add(cityId);
            }
            return newFavorites;
        });
    };

    // Refresh weather data for all cities
    const refreshAllCities = async () => {
        setLoading(true);
        try {
            const updatedCities = await Promise.all(
                cities.map(async (city) => {
                    const weatherData = await fetchWeatherData(city.lat, city.lon);
                    return { ...city, weather: weatherData };
                })
            );
            setCities(updatedCities);
        } catch (error) {
            console.error('Error refreshing cities:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get weather icon
    const getWeatherIcon = (condition) => {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Broken Clouds': '⛅',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Mist': '🌫️'
        };
        return iconMap[condition] || '🌤️';
    };

    return (
        <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Multiple Cities</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track weather for multiple locations simultaneously
                    </p>
                </div>

                {/* Search Section */}
                <div className={`
          p-6 rounded-xl mb-6
          ${theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-white/50 border-gray-200'
                }
          backdrop-blur-sm border
        `}>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                searchCities(e.target.value);
                            }}
                            placeholder="Search for cities..."
                            className={`
                w-full pl-10 pr-4 py-3 rounded-lg border
                ${theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
              `}
                        />
                    </div>

                    {/* Search Results */}
                    {isSearching && <LoadingSpinner />}
                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map(result => (
                                <div
                                    key={result.id}
                                    onClick={() => addCity(result)}
                                    className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                    ${theme === 'dark'
                                        ? 'bg-gray-700 hover:bg-gray-600'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }
                  `}
                                >
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{result.name}, {result.country}</span>
                                    </div>
                                    <Plus className="w-4 h-4" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cities Grid */}
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cities.map(city => (
                            <div
                                key={city.id}
                                className={`
                  p-6 rounded-xl border
                  ${theme === 'dark'
                                    ? 'bg-gray-800/50 border-gray-700'
                                    : 'bg-white/50 border-gray-200'
                                }
                  backdrop-blur-sm hover:shadow-lg transition-all duration-300
                  ${favorites.has(city.id) ? 'ring-2 ring-yellow-400' : ''}
                `}
                            >
                                {/* City Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{city.name}</h3>
                                        <p className="text-gray-500 text-sm">{city.country}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleFavorite(city.id)}
                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            {favorites.has(city.id) ? (
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            ) : (
                                                <StarOff className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => removeCity(city.id)}
                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <X className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Weather Info */}
                                {city.weather && (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                        <span className="text-4xl mr-3">
                          {getWeatherIcon(city.weather.weather?.[0]?.main)}
                        </span>
                                                <div>
                                                    <div className="text-3xl font-bold">
                                                        {Math.round(city.weather.main?.temp)}°C
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {city.weather.weather?.[0]?.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weather Details */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center">
                                                <Thermometer className="w-4 h-4 mr-2 text-orange-400" />
                                                <span>Feels {Math.round(city.weather.main?.feels_like)}°C</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Wind className="w-4 h-4 mr-2 text-blue-400" />
                                                <span>{city.weather.wind?.speed} m/s</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{city.weather.main?.humidity}% humidity</span>
                                            </div>
                                            <div className="flex items-center text-gray-500">
                                                <span>{Math.round(city.weather.main?.pressure)} hPa</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Last Updated */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500">
                                        Added {new Date(city.addedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {cities.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No cities added yet</h3>
                        <p className="text-gray-500">Search and add cities to track their weather</p>
                    </div>
                )}

                {/* Action Buttons */}
                {cities.length > 0 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={refreshAllCities}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Refreshing...' : 'Refresh All Cities'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultipleCities;