import React, { useState } from 'react';
import { Search, MapPin, Star, Clock, User, Settings, Bell } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const {
        currentWeather,
        location,
        searchHistory,
        favoriteLocations,
        fetchWeatherByCity,
        loading,
        error
    } = useWeather();

    const { theme, isDark } = useTheme();

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            try {
                await fetchWeatherByCity(searchQuery.trim());
                setSearchQuery('');
                setShowSearchResults(false);
            } catch (error) {
                console.error('Search failed:', error);
            }
        }
    };

    // Handle search input change
    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSearchResults(e.target.value.length > 0);
    };

    // Select from search suggestions
    const selectSearchSuggestion = async (suggestion) => {
        try {
            if (suggestion.type === 'history') {
                await fetchWeatherData(suggestion.lat, suggestion.lon, suggestion.city);
            } else if (suggestion.type === 'favorite') {
                await fetchWeatherData(suggestion.lat, suggestion.lon, suggestion.city);
            }
            setSearchQuery('');
            setShowSearchResults(false);
        } catch (error) {
            console.error('Failed to load suggestion:', error);
        }
    };

    // Get current time for location
    const getCurrentTime = () => {
        if (currentWeather?.timezone) {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const localTime = new Date(utc + (currentWeather.timezone * 1000));
            return localTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        return new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <header className={`
      sticky top-0 z-40 border-b backdrop-blur-md
      ${isDark
            ? 'bg-gray-900/95 border-gray-700'
            : 'bg-white/95 border-gray-200'
        }
    `}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo and Location */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">W</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                WeatherApp
                            </h1>
                        </div>

                        {/* Current Location Info */}
                        {location.city && (
                            <div className="hidden md:flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{location.city}, {location.country}</span>
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{getCurrentTime()}</span>
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md mx-4 relative">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                    placeholder="Search for cities..."
                                    className={`
                    w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200
                    ${isDark
                                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                    }
                    focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  `}
                                />
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        {showSearchResults && (searchHistory.length > 0 || favoriteLocations.length > 0) && (
                            <div className={`
                absolute top-full mt-2 w-full rounded-lg border shadow-lg z-50
                ${isDark
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-200'
                            }
                backdrop-blur-md
              `}>
                                {/* Favorites */}
                                {favoriteLocations.length > 0 && (
                                    <div className="p-2">
                                        <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <Star className="w-3 h-3 mr-1" />
                                            Favorites
                                        </div>
                                        {favoriteLocations.slice(0, 3).map((fav, index) => (
                                            <button
                                                key={`fav-${index}`}
                                                onClick={() => selectSearchSuggestion({...fav, type: 'favorite'})}
                                                className={`
                          w-full flex items-center px-3 py-2 text-left rounded-md transition-colors
                          ${isDark
                                                    ? 'hover:bg-gray-700'
                                                    : 'hover:bg-gray-100'
                                                }
                        `}
                                            >
                                                <MapPin className="w-4 h-4 mr-2 text-yellow-500" />
                                                <span className="text-sm">{fav.city}, {fav.country}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Recent Searches */}
                                {searchHistory.length > 0 && (
                                    <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Recent
                                        </div>
                                        {searchHistory.slice(0, 5).map((item, index) => (
                                            <button
                                                key={`history-${index}`}
                                                onClick={() => selectSearchSuggestion({...item, type: 'history'})}
                                                className={`
                          w-full flex items-center px-3 py-2 text-left rounded-md transition-colors
                          ${isDark
                                                    ? 'hover:bg-gray-700'
                                                    : 'hover:bg-gray-100'
                                                }
                        `}
                                            >
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="text-sm">{item.city}, {item.country}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2">

                        {/* Notifications */}
                        <button className={`
              p-2 rounded-lg transition-colors
              ${isDark
                            ? 'hover:bg-gray-800'
                            : 'hover:bg-gray-100'
                        }
            `}>
                            <Bell className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-100'
                                }
                `}
                            >
                                <User className="w-5 h-5" />
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className={`
                  absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-50
                  ${isDark
                                    ? 'bg-gray-800 border-gray-600'
                                    : 'bg-white border-gray-200'
                                }
                  backdrop-blur-md
                `}>
                                    <div className="p-2">
                                        <button className={`
                      w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-sm
                      ${isDark
                                            ? 'hover:bg-gray-700'
                                            : 'hover:bg-gray-100'
                                        }
                    `}>
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </button>
                                        <button className={`
                      w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-sm
                      ${isDark
                                            ? 'hover:bg-gray-700'
                                            : 'hover:bg-gray-100'
                                        }
                    `}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Location Info */}
            {location.city && (
                <div className="md:hidden px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{location.city}, {location.country}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{getCurrentTime()}</span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;