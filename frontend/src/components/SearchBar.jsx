import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, X, Loader } from 'lucide-react';

const SearchBar = ({ onSearch, recentSearches = [], isDark = false, isLoading = false }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Mock recent searches if none provided
    const mockRecentSearches = recentSearches.length > 0 ? recentSearches : [
        { city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
        { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
        { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
        { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 }
    ];

    // Mock suggestions based on query
    const getMockSuggestions = (searchQuery) => {
        const allCities = [
            { city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
            { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
            { city: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946 },
            { city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
            { city: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
            { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
            { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
            { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
            { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
            { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 }
        ];

        if (!searchQuery) return [];

        return allCities.filter(city =>
            city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.country.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
    };

    useEffect(() => {
        if (query.length > 0) {
            const newSuggestions = getMockSuggestions(query);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch && onSearch({ city: query.trim() });
            setIsOpen(false);
        }
    };

    const handleLocationSelect = (location) => {
        setQuery(location.city);
        onSearch && onSearch(location);
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const clearSearch = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude: lat, longitude: lon } = position.coords;
                    onSearch && onSearch({ lat, lon, city: 'Current Location' });
                    setQuery('Current Location');
                    setIsOpen(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md mx-auto">
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                    isDark
                        ? 'bg-gray-900/30 border-gray-700/50 focus-within:border-blue-400/50'
                        : 'bg-white/20 border-white/30 focus-within:border-blue-500/50'
                } shadow-lg focus-within:shadow-xl`}>

                    <Search
                        size={20}
                        className={`${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors`}
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={handleInputFocus}
                        placeholder="Search for a city..."
                        className={`flex-1 bg-transparent outline-none placeholder-gray-400 ${
                            isDark ? 'text-white' : 'text-gray-800'
                        }`}
                    />

                    {/* Loading or Clear Button */}
                    {isLoading ? (
                        <Loader size={16} className="animate-spin text-blue-500" />
                    ) : query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className={`p-1 rounded-full transition-colors ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                            }`}
                        >
                            <X size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        </button>
                    )}

                    {/* Current Location Button */}
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        className={`p-2 rounded-full transition-all duration-200 ${
                            isDark
                                ? 'text-blue-400 hover:bg-blue-400/20'
                                : 'text-blue-600 hover:bg-blue-600/20'
                        }`}
                        title="Use current location"
                    >
                        <MapPin size={16} />
                    </button>
                </div>
            </form>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl backdrop-blur-md border overflow-hidden z-50 ${
                    isDark
                        ? 'bg-gray-900/90 border-gray-700/50'
                        : 'bg-white/90 border-white/30'
                } shadow-2xl`}>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div>
                            <div className="px-4 py-2 border-b border-gray-200/20">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Suggestions
                </span>
                            </div>
                            {suggestions.map((location, index) => (
                                <button
                                    key={`suggestion-${index}`}
                                    onClick={() => handleLocationSelect(location)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                        isDark
                                            ? 'hover:bg-white/10 text-white'
                                            : 'hover:bg-black/5 text-gray-800'
                                    }`}
                                >
                                    <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                    <div>
                                        <div className="font-medium">{location.city}</div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {location.country}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {mockRecentSearches.length > 0 && (
                        <div>
                            <div className="px-4 py-2 border-b border-gray-200/20">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Recent Searches
                </span>
                            </div>
                            {mockRecentSearches.slice(0, 4).map((location, index) => (
                                <button
                                    key={`recent-${index}`}
                                    onClick={() => handleLocationSelect(location)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                        isDark
                                            ? 'hover:bg-white/10 text-white'
                                            : 'hover:bg-black/5 text-gray-800'
                                    }`}
                                >
                                    <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                    <div>
                                        <div className="font-medium">{location.city}</div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {location.country}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {query && suggestions.length === 0 && (
                        <div className="px-4 py-6 text-center">
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No cities found for "{query}"
                            </div>
                            <button
                                onClick={handleSubmit}
                                className={`mt-2 text-sm font-medium transition-colors ${
                                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                                }`}
                            >
                                Search anyway
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;