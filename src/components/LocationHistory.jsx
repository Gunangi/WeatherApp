// src/components/LocationHistory.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Clock, MapPin, Star, Trash2, Search } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const LocationHistory = ({ onLocationSelect, onToggleFavorite, visible = false }) => {
    const [recentLocations, setRecentLocations] = useState([]);
    const [favoriteLocations, setFavoriteLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const { userId } = useContext(AppContext);

    useEffect(() => {
        if (visible) {
            loadLocationHistory();
            loadFavoriteLocations();
        }
    }, [visible, userId]);

    const loadLocationHistory = async () => {
        try {
            setLoading(true);
            // In a real app, this would be an API call
            const savedHistory = localStorage.getItem(`locationHistory_${userId}`);
            if (savedHistory) {
                const history = JSON.parse(savedHistory);
                setRecentLocations(history.slice(0, 10)); // Show last 10 searches
            }
        } catch (error) {
            console.error('Failed to load location history:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavoriteLocations = async () => {
        try {
            // In a real app, this would be an API call to backend
            const savedFavorites = localStorage.getItem(`favoriteLocations_${userId}`);
            if (savedFavorites) {
                setFavoriteLocations(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error('Failed to load favorite locations:', error);
        }
    };

    const addToHistory = (location) => {
        try {
            const savedHistory = localStorage.getItem(`locationHistory_${userId}`);
            let history = savedHistory ? JSON.parse(savedHistory) : [];

            // Remove if already exists to avoid duplicates
            history = history.filter(item => item.name !== location.name);

            // Add to beginning
            history.unshift({
                ...location,
                searchedAt: new Date().toISOString(),
                searchCount: (history.find(h => h.name === location.name)?.searchCount || 0) + 1
            });

            // Keep only last 50 items
            history = history.slice(0, 50);

            localStorage.setItem(`locationHistory_${userId}`, JSON.stringify(history));
            setRecentLocations(history.slice(0, 10));
        } catch (error) {
            console.error('Failed to save location to history:', error);
        }
    };

    const toggleFavorite = async (location) => {
        try {
            const savedFavorites = localStorage.getItem(`favoriteLocations_${userId}`);
            let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

            const existingIndex = favorites.findIndex(fav => fav.name === location.name);

            if (existingIndex >= 0) {
                // Remove from favorites
                favorites.splice(existingIndex, 1);
            } else {
                // Add to favorites
                favorites.push({
                    ...location,
                    addedAt: new Date().toISOString(),
                    isDefault: favorites.length === 0 // First favorite becomes default
                });
            }

            localStorage.setItem(`favoriteLocations_${userId}`, JSON.stringify(favorites));
            setFavoriteLocations(favorites);

            onToggleFavorite?.(location, existingIndex === -1);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const removeFromHistory = (locationName) => {
        try {
            const savedHistory = localStorage.getItem(`locationHistory_${userId}`);
            if (savedHistory) {
                let history = JSON.parse(savedHistory);
                history = history.filter(item => item.name !== locationName);
                localStorage.setItem(`locationHistory_${userId}`, JSON.stringify(history));
                setRecentLocations(history.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to remove from history:', error);
        }
    };

    const handleLocationSelect = (location) => {
        addToHistory(location);
        onLocationSelect?.(location.name);
    };

    const isFavorite = (locationName) => {
        return favoriteLocations.some(fav => fav.name === locationName);
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}mo ago`;
    };

    if (!visible) return null;

    return (
        <div className="location-history bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            {loading ? (
                <div className="p-4 text-center">
                    <div className="loading-spinner mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading locations...</p>
                </div>
            ) : (
                <>
                    {/* Favorite Locations */}
                    {favoriteLocations.length > 0 && (
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                Favorites
                            </h3>
                            <div className="space-y-1">
                                {favoriteLocations.map((location, index) => (
                                    <div
                                        key={`fav-${index}`}
                                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                                        onClick={() => handleLocationSelect(location)}
                                    >
                                        <div className="flex items-center space-x-2 flex-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {location.nickname || location.name}
                                                </p>
                                                {location.country && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {location.country}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(location);
                                            }}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                        >
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Searches */}
                    {recentLocations.length > 0 && (
                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                                Recent Searches
                            </h3>
                            <div className="space-y-1">
                                {recentLocations.map((location, index) => (
                                    <div
                                        key={`recent-${index}`}
                                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                                        onClick={() => handleLocationSelect(location)}
                                    >
                                        <div className="flex items-center space-x-2 flex-1">
                                            <Search className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {location.name}
                                                </p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                    {location.country && <span>{location.country}</span>}
                                                    {location.searchedAt && (
                                                        <span>• {formatTimeAgo(location.searchedAt)}</span>
                                                    )}
                                                    {location.searchCount > 1 && (
                                                        <span>• {location.searchCount} searches</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(location);
                                                }}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            >
                                                <Star
                                                    className={`w-4 h-4 ${
                                                        isFavorite(location.name)
                                                            ? 'text-yellow-500 fill-current'
                                                            : 'text-gray-400'
                                                    }`}
                                                />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromHistory(location.name);
                                                }}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {recentLocations.length === 0 && favoriteLocations.length === 0 && (
                        <div className="p-6 text-center">
                            <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No recent searches yet
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Start searching for cities to see your history here
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LocationHistory;