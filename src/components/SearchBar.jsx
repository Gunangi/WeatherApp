// src/components/SearchBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Clock } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Load recent searches from localStorage on component mount
    useEffect(() => {
        const saved = localStorage.getItem('recentWeatherSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to parse recent searches:', error);
            }
        }
    }, []);

    // Popular cities suggestions
    const popularCities = [
        'New York', 'London', 'Tokyo', 'Paris', 'Sydney',
        'Mumbai', 'Delhi', 'Beijing', 'Los Angeles', 'Chicago'
    ];

    const handleSearch = async (searchTerm) => {
        const cityToSearch = searchTerm || query;
        if (!cityToSearch.trim()) return;

        setIsLoading(true);
        setShowSuggestions(false);

        try {
            // Add to recent searches
            const newRecentSearches = [
                cityToSearch.trim(),
                ...recentSearches.filter(city => city.toLowerCase() !== cityToSearch.toLowerCase())
            ].slice(0, 5); // Keep only last 5 searches

            setRecentSearches(newRecentSearches);
            localStorage.setItem('recentWeatherSearches', JSON.stringify(newRecentSearches));

            // Call the parent search function
            await onSearch(cityToSearch.trim());
            setQuery('');
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const handleSuggestionClick = (city) => {
        setQuery(city);
        handleSearch(city);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentWeatherSearches');
    };

    const handleInputFocus = () => {
        setShowSuggestions(true);
    };

    const handleInputBlur = (e) => {
        // Delay hiding suggestions to allow click on suggestions
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(e.relatedTarget)) {
                setShowSuggestions(false);
            }
        }, 150);
    };

    const filteredPopularCities = popularCities.filter(city =>
        city.toLowerCase().includes(query.toLowerCase()) &&
        !recentSearches.some(recent => recent.toLowerCase() === city.toLowerCase())
    );

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search for a city..."
                        className="search-input pr-16"
                        disabled={isLoading}
                    />

                    {/* Clear button */}
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}

                    {/* Search button */}
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="search-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="loading-spinner w-5 h-5 border-2"></div>
                        ) : (
                            <Search size={20} />
                        )}
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-2 glass-card max-h-80 overflow-y-auto z-50"
                    >
                        {/* Recent searches */}
                        {recentSearches.length > 0 && (
                            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                        <Clock size={16} className="mr-2" />
                                        Recent Searches
                                    </h3>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {recentSearches.map((city, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(city)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center"
                                        >
                                            <MapPin size={14} className="mr-2 text-gray-400" />
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular cities */}
                        {filteredPopularCities.length > 0 && (
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    {query ? 'Matching Cities' : 'Popular Cities'}
                                </h3>
                                <div className="space-y-1">
                                    {filteredPopularCities.slice(0, 6).map((city, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(city)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center"
                                        >
                                            <MapPin size={14} className="mr-2 text-gray-400" />
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results */}
                        {query && filteredPopularCities.length === 0 && recentSearches.length === 0 && (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                Press Enter to search for "{query}"
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default SearchBar;
