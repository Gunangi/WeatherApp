import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Trash2, Search, Heart, Navigation } from 'lucide-react';

const LocationHistory = ({ onLocationSelect, currentLocation }) => {
    const [recentSearches, setRecentSearches] = useState([
        { id: 1, name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090, timestamp: Date.now() - 3600000 },
        { id: 2, name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, timestamp: Date.now() - 7200000 },
        { id: 3, name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, timestamp: Date.now() - 86400000 },
        { id: 4, name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, timestamp: Date.now() - 172800000 },
        { id: 5, name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, timestamp: Date.now() - 259200000 }
    ]);

    const [favoriteLocations, setFavoriteLocations] = useState([
        { id: 1, name: 'Home - Nagpur', country: 'India', lat: 21.1458, lon: 79.0882, isHome: true },
        { id: 2, name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, isHome: false },
        { id: 3, name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, isHome: false },
        { id: 4, name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, isHome: false }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('recent');

    const formatTimeAgo = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const toggleFavorite = (location) => {
        const isFavorite = favoriteLocations.some(fav => fav.name === location.name);

        if (isFavorite) {
            setFavoriteLocations(prev => prev.filter(fav => fav.name !== location.name));
        } else {
            const newFavorite = {
                id: Date.now(),
                name: location.name,
                country: location.country,
                lat: location.lat,
                lon: location.lon,
                isHome: false
            };
            setFavoriteLocations(prev => [...prev, newFavorite]);
        }
    };

    const removeFromRecent = (locationId) => {
        setRecentSearches(prev => prev.filter(location => location.id !== locationId));
    };

    const removeFavorite = (locationId) => {
        setFavoriteLocations(prev => prev.filter(location => location.id !== locationId));
    };

    const setAsHome = (location) => {
        setFavoriteLocations(prev => prev.map(fav => ({
            ...fav,
            isHome: fav.id === location.id,
            name: fav.id === location.id ? `Home - ${fav.name.replace('Home - ', '')}` : fav.name.replace('Home - ', '')
        })));
    };

    const filteredRecent = recentSearches.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFavorites = favoriteLocations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const LocationCard = ({ location, type, onSelect, onRemove, onToggleFavorite, onSetHome }) => {
        const isFavorite = favoriteLocations.some(fav => fav.name === location.name);
        const isCurrentLocation = currentLocation &&
            Math.abs(currentLocation.lat - location.lat) < 0.01 &&
            Math.abs(currentLocation.lon - location.lon) < 0.01;

        return (
            <div className={`group bg-white/10 backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] ${
                isCurrentLocation ? 'border-blue-400 bg-blue-500/20' : 'border-white/20'
            }`}>
                <div className="flex items-center justify-between mb-2">
                    <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => onSelect(location)}
                    >
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                {location.name}
                                {location.isHome && <Navigation className="w-4 h-4 text-green-400" />}
                                {isCurrentLocation && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
                            </h3>
                            <p className="text-sm text-gray-300">{location.country}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {type === 'recent' && (
                            <button
                                onClick={() => onToggleFavorite(location)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isFavorite ? 'text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        )}

                        {type === 'favorite' && !location.isHome && (
                            <button
                                onClick={() => onSetHome(location)}
                                className="p-2 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors"
                                title="Set as home"
                            >
                                <Navigation className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={() => onRemove(location.id)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {type === 'recent' && (
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(location.timestamp)}</span>
                        </div>
                        <span>{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
                    </div>
                )}

                {type === 'favorite' && (
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>Favorite</span>
                        </div>
                        <span>{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Locations</h2>
                <div className="flex bg-white/10 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('recent')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'recent'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'favorites'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Favorites
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Content */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeTab === 'recent' && (
                    <>
                        {filteredRecent.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-300">Recent Searches</h3>
                                </div>
                                {filteredRecent.map(location => (
                                    <LocationCard
                                        key={location.id}
                                        location={location}
                                        type="recent"
                                        onSelect={onLocationSelect}
                                        onRemove={removeFromRecent}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">No recent searches found</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'favorites' && (
                    <>
                        {filteredFavorites.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    <h3 className="font-semibold text-gray-300">Favorite Locations</h3>
                                </div>
                                {filteredFavorites.map(location => (
                                    <LocationCard
                                        key={location.id}
                                        location={location}
                                        type="favorite"
                                        onSelect={onLocationSelect}
                                        onRemove={removeFavorite}
                                        onSetHome={setAsHome}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">No favorite locations yet</p>
                                <p className="text-sm text-gray-500 mt-2">Add locations to favorites from recent searches</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{filteredRecent.length} recent searches</span>
                    <span>{filteredFavorites.length} favorites</span>
                </div>
            </div>
        </div>
    );
};

export default LocationHistory;