// src/components/WeatherMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Layers, Zap, CloudRain, Thermometer, Wind, Eye, RotateCcw } from 'lucide-react';

const WeatherMap = ({ currentLocation, onLocationSelect, className = "" }) => {
    const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
    const [zoom, setZoom] = useState(5);
    const [activeLayer, setActiveLayer] = useState('clouds');
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([]);

    const weatherLayers = [
        { id: 'clouds', name: 'Clouds', icon: <Layers className="w-4 h-4" />, opacity: 0.7 },
        { id: 'precipitation', name: 'Rain', icon: <CloudRain className="w-4 h-4" />, opacity: 0.8 },
        { id: 'temp', name: 'Temperature', icon: <Thermometer className="w-4 h-4" />, opacity: 0.6 },
        { id: 'wind', name: 'Wind', icon: <Wind className="w-4 h-4" />, opacity: 0.7 },
        { id: 'pressure', name: 'Pressure', icon: <Eye className="w-4 h-4" />, opacity: 0.6 }
    ];

    useEffect(() => {
        if (currentLocation && currentLocation.lat && currentLocation.lon) {
            setMapCenter({ lat: currentLocation.lat, lng: currentLocation.lon });
            setZoom(10);
        }
    }, [currentLocation]);

    const handleMapClick = (lat, lng, cityName) => {
        if (onLocationSelect) {
            onLocationSelect({ lat, lng, city: cityName || 'Unknown Location' });
        }

        // Add marker
        const newMarker = {
            id: Date.now(),
            lat,
            lng,
            name: cityName || `${lat.toFixed(2)}, ${lng.toFixed(2)}`
        };
        setMarkers(prev => [...prev.slice(-4), newMarker]); // Keep last 5 markers
    };

    const resetView = () => {
        setMapCenter({ lat: 20.5937, lng: 78.9629 });
        setZoom(5);
        setMarkers([]);
    };

    const getLayerUrl = (layerId) => {
        const apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
        return `https://tile.openweathermap.org/map/${layerId}_new/{z}/{x}/{y}.png?appid=${apiKey}`;
    };

    // Mock weather data for demonstration
    const mockCityWeatherData = [
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, temp: 32, condition: 'Sunny' },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025, temp: 35, condition: 'Hot' },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946, temp: 28, condition: 'Pleasant' },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707, temp: 33, condition: 'Humid' },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639, temp: 31, condition: 'Cloudy' },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, temp: 30, condition: 'Clear' },
        { name: 'Pune', lat: 18.5204, lng: 73.8567, temp: 29, condition: 'Mild' },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, temp: 36, condition: 'Very Hot' }
    ];

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Interactive Weather Map
                    </h3>
                    <button
                        onClick={resetView}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Layer Controls */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {weatherLayers.map(layer => (
                        <button
                            key={layer.id}
                            onClick={() => setActiveLayer(layer.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeLayer === layer.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {layer.icon}
                            <span>{layer.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-600">
                {/* Mock Map Background */}
                <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                        {/* India outline mockup */}
                        <path
                            d="M100,80 Q120,60 140,80 L160,100 Q180,120 160,140 L140,160 Q120,180 100,160 L80,140 Q60,120 80,100 Z"
                            fill="currentColor"
                            className="text-green-500"
                        />
                    </svg>
                </div>

                {/* Weather Layer Overlay */}
                <div className={`absolute inset-0 opacity-${Math.round(weatherLayers.find(l => l.id === activeLayer)?.opacity * 100) || 70}`}>
                    {activeLayer === 'clouds' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-200 to-white animate-pulse"></div>
                    )}
                    {activeLayer === 'precipitation' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-200"></div>
                    )}
                    {activeLayer === 'temp' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-yellow-200 to-red-200"></div>
                    )}
                    {activeLayer === 'wind' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-green-200"></div>
                    )}
                    {activeLayer === 'pressure' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200"></div>
                    )}
                </div>

                {/* City Markers */}
                {mockCityWeatherData.map((city, index) => (
                    <div
                        key={city.name}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                            left: `${((city.lng - 68) / (97 - 68)) * 100}%`,
                            top: `${(1 - (city.lat - 8) / (37 - 8)) * 100}%`
                        }}
                        onClick={() => handleMapClick(city.lat, city.lng, city.name)}
                    >
                        <div className="group relative">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:bg-blue-600 transition-colors">
                                {city.temp}°
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                    <div className="font-medium">{city.name}</div>
                                    <div>{city.temp}°C - {city.condition}</div>
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* User-added Markers */}
                {markers.map((marker) => (
                    <div
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${((marker.lng - 68) / (97 - 68)) * 100}%`,
                            top: `${(1 - (marker.lat - 8) / (37 - 8)) * 100}%`
                        }}
                    >
                        <MapPin className="w-6 h-6 text-red-500 drop-shadow-md" />
                    </div>
                ))}

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                            <div className="loading-spinner mx-auto mb-2"></div>
                            <p>Loading weather data...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Click on any location to get weather data</p>
                        <p className="text-xs mt-1">
                            Showing: {weatherLayers.find(l => l.id === activeLayer)?.name} layer
                        </p>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex flex-col space-y-1">
                        <button
                            onClick={() => setZoom(prev => Math.min(prev + 1, 15))}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            +
                        </button>
                        <button
                            onClick={() => setZoom(prev => Math.max(prev - 1, 3))}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            -
                        </button>
                    </div>
                </div>

                {/* Current Location Info */}
                {currentLocation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Current: {currentLocation.name || 'Your Location'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherMap;