import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Layers, Eye, Wind, Thermometer, CloudRain, Sun, Zap } from 'lucide-react';

const MapPage = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState('temp_new');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [markers, setMarkers] = useState([]);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Delhi default

    const weatherLayers = [
        { id: 'temp_new', name: 'Temperature', icon: Thermometer, color: '#ff6b6b' },
        { id: 'precipitation_new', name: 'Precipitation', icon: CloudRain, color: '#4ecdc4' },
        { id: 'pressure_new', name: 'Pressure', icon: Eye, color: '#45b7d1' },
        { id: 'wind_new', name: 'Wind Speed', icon: Wind, color: '#96ceb4' },
        { id: 'clouds_new', name: 'Clouds', icon: Sun, color: '#feca57' }
    ];

    // Initialize map when component mounts
    useEffect(() => {
        initializeMap();
        getCurrentLocation();
    }, []);

    // Update weather layer when selection changes
    useEffect(() => {
        if (map) {
            updateWeatherLayer();
        }
    }, [selectedLayer, map]);

    const initializeMap = () => {
        // Simulated map initialization (would use Leaflet or similar in real app)
        const mockMap = {
            center: mapCenter,
            zoom: 6,
            layers: [],
            addLayer: (layer) => console.log('Adding layer:', layer),
            removeLayer: (layer) => console.log('Removing layer:', layer),
            on: (event, callback) => console.log('Event listener added:', event),
            setView: (center, zoom) => {
                setMapCenter(center);
                console.log('Map view set to:', center, zoom);
            }
        };

        setMap(mockMap);
        setLoading(false);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter([latitude, longitude]);
                    addWeatherMarker(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const addWeatherMarker = async (lat, lon) => {
        try {
            // Simulate API call for weather data
            const mockWeatherData = {
                coord: { lat, lon },
                weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
                main: { temp: 28, feels_like: 32, humidity: 65, pressure: 1013 },
                wind: { speed: 3.5, deg: 180 },
                name: 'Current Location'
            };

            const newMarker = {
                id: Date.now(),
                position: [lat, lon],
                weather: mockWeatherData
            };

            setMarkers(prev => [...prev, newMarker]);
            setWeatherData(mockWeatherData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    const updateWeatherLayer = () => {
        console.log('Updating weather layer to:', selectedLayer);
        // In a real implementation, this would add/remove OpenWeatherMap tile layers
    };

    const handleMapClick = (event) => {
        // Simulate map click coordinates
        const lat = mapCenter[0] + (Math.random() - 0.5) * 2;
        const lon = mapCenter[1] + (Math.random() - 0.5) * 2;
        addWeatherMarker(lat, lon);
    };

    const WeatherMarker = ({ marker }) => (
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-48 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white">
                        {marker.weather.name}
                    </h3>
                    <MapPin className="w-4 h-4 text-blue-500" />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {Math.round(marker.weather.main.temp)}°C
            </span>
                        <div className="text-right">
                            <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                {marker.weather.weather[0].description}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                Feels like {Math.round(marker.weather.main.feels_like)}°C
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>💧 {marker.weather.main.humidity}%</div>
                        <div>💨 {marker.weather.wind.speed} m/s</div>
                        <div>🔽 {marker.weather.main.pressure} hPa</div>
                        <div>🧭 {marker.weather.wind.deg}°</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Interactive Weather Map
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Explore real-time weather conditions around the world
                    </p>
                </div>

                {/* Controls */}
                <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-gray-800 dark:text-white">Weather Layers</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {weatherLayers.map((layer) => {
                            const IconComponent = layer.icon;
                            return (
                                <button
                                    key={layer.id}
                                    onClick={() => setSelectedLayer(layer.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                        selectedLayer === layer.id
                                            ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span className="text-sm font-medium">{layer.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Map Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="h-96 relative bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-600">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                {/* Simulated Map Background */}
                                <div
                                    className="w-full h-full cursor-crosshair relative"
                                    onClick={handleMapClick}
                                >
                                    {/* Grid overlay to simulate map */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="grid grid-cols-8 grid-rows-6 h-full">
                                            {Array.from({ length: 48 }).map((_, i) => (
                                                <div key={i} className="border border-gray-400"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weather Markers */}
                                    {markers.map((marker, index) => (
                                        <div
                                            key={marker.id}
                                            className="absolute"
                                            style={{
                                                left: `${20 + index * 15}%`,
                                                top: `${30 + index * 10}%`
                                            }}
                                        >
                                            <WeatherMarker marker={marker} />
                                        </div>
                                    ))}

                                    {/* Click instruction */}
                                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                                        Click anywhere to add weather marker
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Map Legend */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Weather Stations</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Location</span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Zoom: 6x | Layer: {weatherLayers.find(l => l.id === selectedLayer)?.name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Weather Summary */}
                {weatherData && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Selected Location Weather
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Thermometer className="w-5 h-5" />
                                    <span className="text-sm font-medium">Temperature</span>
                                </div>
                                <div className="text-2xl font-bold">{Math.round(weatherData.main.temp)}°C</div>
                                <div className="text-sm opacity-90">Feels like {Math.round(weatherData.main.feels_like)}°C</div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Wind className="w-5 h-5" />
                                    <span className="text-sm font-medium">Wind</span>
                                </div>
                                <div className="text-2xl font-bold">{weatherData.wind.speed} m/s</div>
                                <div className="text-sm opacity-90">{weatherData.wind.deg}° direction</div>
                            </div>

                            <div className="bg-gradient-to-r from-teal-400 to-green-500 text-white p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-5 h-5" />
                                    <span className="text-sm font-medium">Humidity</span>
                                </div>
                                <div className="text-2xl font-bold">{weatherData.main.humidity}%</div>
                                <div className="text-sm opacity-90">Relative humidity</div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-5 h-5" />
                                    <span className="text-sm font-medium">Pressure</span>
                                </div>
                                <div className="text-2xl font-bold">{weatherData.main.pressure}</div>
                                <div className="text-sm opacity-90">hPa</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;