// src/components/Enhanced_SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, X, ChevronDown } from 'lucide-react';
import GPSLocationDetector from './GPSLocationDetector';
import LocationHistory from './LocationHistory';
import { getCurrentWeather } from '../api/weatherApi';

const EnhancedSearchBar = ({ onSearch, onLocationDetected }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');

    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setShowHistory(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock city suggestions - in real app, this would be an API call
    const searchSuggestions = async (searchQuery) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        // Mock data - in real app, use OpenWeatherMap Geocoding API
        const mockCities = [
            { name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.0060 },
            { name: 'London', country: 'GB', state: 'England', lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', country: 'JP', state: 'Tokyo', lat: 35.6762, lon: 139.6503 },
            { name: 'Paris', country: 'FR', state: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
            { name: 'Sydney', country: 'AU', state: 'NSW', lat: -33.8688, lon: 151.2093 },
            { name: 'Mumbai', country: 'IN', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
            { name: 'Delhi', country: 'IN', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
            { name: 'Nagpur', country: 'IN', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
            { name: 'Berlin', country: 'DE', state: 'Berlin', lat: 52.5200, lon: 13.4050 },
            { name: 'Toronto', country: 'CA', state: 'Ontario', lat: 43.6532, lon: -79.3832 }
        ];

        const filtered = mockCities.filter(city =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.state.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8);

        setSuggestions(filtered);
        setShowSuggestions(true);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setError('');

        if (value.trim()) {
            searchSuggestions(value);
            setShowHistory(false);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSearch = async (searchTerm) => {
        const cityToSearch = searchTerm || query;
        if (!cityToSearch.trim()) return;

        setIsLoading(true);
        setError('');
        setShowSuggestions(false);
        setShowHistory(false);

        try {
            await onSearch(cityToSearch.trim());
            setQuery('');
        } catch (error) {
            console.error('Search failed:', error);
            setError('Failed to fetch weather data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSearch(suggestion.name);
    };

    const handleGPSLocation = async (location) => {
        setIsLoading(true);
        setError('');

        try {
            // In real app, make API call to get city name from coordinates
            // For now, we'll use a mock reverse geocoding
            const cityName = await reverseGeocode(location.latitude, location.longitude);

            if (onLocationDetected) {
                onLocationDetected({
                    city: cityName,
                    ...location
                });
            }

            await onSearch(cityName);
        } catch (error) {
            console.error('GPS location search failed:', error);
            setError('Failed to get weather for your location');
        } finally {
            setIsLoading(false);
        }
    };

    // Mock reverse geocoding - in real app, use proper geocoding service
    const reverseGeocode = async (lat, lon) => {
        // Mock implementation
        if (Math.abs(lat - 21.1458) < 0.1 && Math.abs(lon - 79.0882) < 0.1) {
            return 'Nagpur';
        }
        return 'Current Location';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const handleInputFocus = () => {
        if (!query.trim()) {
            setShowHistory(true);
            setShowSuggestions(false);
        }
    };

    const clearQuery = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        setError('');
        inputRef.current?.focus();
    };

    return (
        <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder="Search for a city..."
                        className="search-input w-full px-6 py-4 text-lg bg-white/90 dark:bg-gray-800/90 border-2 border-transparent rounded-full shadow-lg focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 pr-24"
                        disabled={isLoading}
                    />

                    {/* Clear button */}
                    {query && (
                        <button
                            type="button"
                            onClick={clearQuery}
                            className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}

                    {/* Search button */}
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="search-button absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Search size={20} />
                        )}
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {suggestion.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {suggestion.state}, {suggestion.country}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            {/* GPS Location Detector */}
            <div className="mt-4 flex justify-center">
                <GPSLocationDetector
                    onLocationDetected={handleGPSLocation}
                    onError={setError}
                />
            </div>

            {/* Location History */}
            <div className="relative mt-2">
                <LocationHistory
                    visible={showHistory}
                    onLocationSelect={handleSearch}
                    onToggleFavorite={(location, isFavorite) => {
                        console.log(`${location.name} ${isFavorite ? 'added to' : 'removed from'} favorites`);
                    }}
                />
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Mumbai', 'Delhi', 'Nagpur', 'Bangalore'].map((city) => (
                    <button
                        key={city}
                        onClick={() => handleSearch(city)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors disabled:opacity-50"
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EnhancedSearchBar;
