import React, { useState, useEffect, useRef } from 'react';
import { Satellite, Layers, ZoomIn, ZoomOut, RotateCcw, Download, Settings, MapPin, Calendar, Clock } from 'lucide-react';

const SatelliteImagery = ({ location, weatherData }) => {
    const [selectedLayer, setSelectedLayer] = useState('clouds');
    const [opacity, setOpacity] = useState(0.7);
    const [zoom, setZoom] = useState(8);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const [timeSelection, setTimeSelection] = useState('current');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const canvasRef = useRef(null);

    const layers = [
        {
            id: 'clouds',
            name: 'Cloud Cover',
            icon: '☁️',
            description: 'Real-time cloud coverage',
            color: 'text-blue-400',
            gradient: 'from-blue-500/30 to-white/20'
        },
        {
            id: 'precipitation',
            name: 'Precipitation',
            icon: '🌧️',
            description: 'Rain and snow patterns',
            color: 'text-cyan-400',
            gradient: 'from-cyan-500/30 to-blue-500/30'
        },
        {
            id: 'temperature',
            name: 'Temperature',
            icon: '🌡️',
            description: 'Surface temperature map',
            color: 'text-red-400',
            gradient: 'from-red-500/30 to-orange-500/30'
        },
        {
            id: 'pressure',
            name: 'Pressure',
            icon: '📊',
            description: 'Atmospheric pressure',
            color: 'text-purple-400',
            gradient: 'from-purple-500/30 to-pink-500/30'
        },
        {
            id: 'wind',
            name: 'Wind Speed',
            icon: '💨',
            description: 'Wind velocity patterns',
            color: 'text-green-400',
            gradient: 'from-green-500/30 to-teal-500/30'
        }
    ];

    const timeOptions = [
        { value: 'current', label: 'Current', hours: 0 },
        { value: '1h', label: '1 Hour Ago', hours: 1 },
        { value: '3h', label: '3 Hours Ago', hours: 3 },
        { value: '6h', label: '6 Hours Ago', hours: 6 },
        { value: '12h', label: '12 Hours Ago', hours: 12 },
        { value: '24h', label: '24 Hours Ago', hours: 24 }
    ];

    useEffect(() => {
        if (location && selectedLayer) {
            fetchSatelliteData();
        }
    }, [location, selectedLayer, zoom, timeSelection]);

    const fetchSatelliteData = async () => {
        setLoading(true);

        try {
            // In a real implementation, you would call actual satellite APIs like:
            // - OpenWeatherMap Satellite API
            // - NASA GIBS (Global Imagery Browse Services)
            // - Mapbox Satellite API
            // - Google Earth Engine API

            // Mock implementation with realistic delay
            await new Promise(resolve => setTimeout(resolve, 1200));

            // Generate more realistic mock data based on layer type
            const mockImageUrl = generateMockSatelliteImage(selectedLayer, location, zoom);
            setImageUrl(mockImageUrl);

        } catch (error) {
            console.error('Failed to fetch satellite data:', error);
            setImageUrl(null);
        } finally {
            setLoading(false);
        }
    };

    const generateMockSatelliteImage = (layer, loc, zoomLevel) => {
        // This would be replaced with actual API calls
        const baseUrl = 'https://via.placeholder.com';
        const width = Math.min(800, 400 + zoomLevel * 30);
        const height = Math.min(600, 300 + zoomLevel * 25);

        const layerColors = {
            clouds: '4A90E2/ffffff',
            precipitation: '50C8E8/ffffff',
            temperature: 'E94B3C/ffffff',
            pressure: '8E44AD/ffffff',
            wind: '27AE60/ffffff'
        };

        const color = layerColors[layer] || '333333/ffffff';
        const timestamp = Date.now();

        return `${baseUrl}/${width}x${height}/${color}?text=${layer.toUpperCase()}+SATELLITE&t=${timestamp}`;
    };

    const handleLayerChange = (layerId) => {
        setSelectedLayer(layerId);
    };

    const handleZoomIn = () => {
        setZoom(Math.min(zoom + 1, 15));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(zoom - 1, 3));
    };

    const handleReset = () => {
        setZoom(8);
        setOpacity(0.7);
        setTimeSelection('current');
    };

    const handleDownload = () => {
        if (imageUrl) {
            // Create a canvas to combine the satellite image with overlays
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw the satellite image
                    ctx.drawImage(img, 0, 0);

                    // Add overlay based on selected layer
                    const currentLayer = layers.find(l => l.id === selectedLayer);
                    if (currentLayer) {
                        ctx.globalAlpha = opacity;
                        ctx.fillStyle = getLayerOverlayColor(selectedLayer);
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.globalAlpha = 1;
                    }

                    // Convert to blob and download
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `satellite-${selectedLayer}-${location?.name || 'location'}-${new Date().toISOString().split('T')[0]}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    });
                };

                img.src = imageUrl;
            }
        }
    };

    const getLayerOverlayColor = (layerId) => {
        const colors = {
            clouds: 'rgba(74, 144, 226, 0.3)',
            precipitation: 'rgba(80, 200, 232, 0.3)',
            temperature: 'rgba(233, 75, 60, 0.3)',
            pressure: 'rgba(142, 68, 173, 0.3)',
            wind: 'rgba(39, 174, 96, 0.3)'
        };
        return colors[layerId] || 'rgba(128, 128, 128, 0.3)';
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const formatTimeAgo = (timeValue) => {
        const option = timeOptions.find(opt => opt.value === timeValue);
        if (!option || option.hours === 0) return 'Current';

        const date = new Date(Date.now() - (option.hours * 60 * 60 * 1000));
        return date.toLocaleString();
    };

    const currentLayer = layers.find(layer => layer.id === selectedLayer);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Satellite className="text-blue-400" size={28} />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Satellite Imagery</h2>
                        <p className="text-sm text-white/60">Real-time weather visualization</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Toggle Fullscreen"
                    >
                        <MapPin className="text-white" size={20} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Reset View"
                    >
                        <RotateCcw className="text-white" size={20} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Download Image"
                        disabled={!imageUrl || loading}
                    >
                        <Download className={`${!imageUrl || loading ? 'text-white/40' : 'text-white'}`} size={20} />
                    </button>
                </div>
            </div>

            {/* Layer Selection */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                    <Layers className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Weather Layers</h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {layers.map((layer) => (
                        <button
                            key={layer.id}
                            onClick={() => handleLayerChange(layer.id)}
                            className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                                selectedLayer === layer.id
                                    ? 'bg-blue-500/30 border-blue-400 transform scale-105 shadow-lg'
                                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                            }`}
                        >
                            <div className="text-2xl mb-2">{layer.icon}</div>
                            <div className={`text-sm font-medium ${layer.color}`}>
                                {layer.name}
                            </div>
                            <div className="text-xs text-white/60 mt-1">
                                {layer.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Enhanced Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                    <Settings className="text-gray-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Display Controls</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Zoom Controls */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Zoom Level: {zoom}
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                disabled={zoom <= 3}
                            >
                                <ZoomOut size={16} className={`${zoom <= 3 ? 'text-white/40' : 'text-white'}`} />
                            </button>
                            <input
                                type="range"
                                min="3"
                                max="15"
                                value={zoom}
                                onChange={(e) => setZoom(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((zoom-3)/(15-3))*100}%, rgba(255,255,255,0.2) ${((zoom-3)/(15-3))*100}%, rgba(255,255,255,0.2) 100%)`
                                }}
                            />
                            <button
                                onClick={handleZoomIn}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                disabled={zoom >= 15}
                            >
                                <ZoomIn size={16} className={`${zoom >= 15 ? 'text-white/40' : 'text-white'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Opacity Control */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Opacity: {Math.round(opacity * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #10B981 0%, #10B981 ${opacity*100}%, rgba(255,255,255,0.2) ${opacity*100}%, rgba(255,255,255,0.2) 100%)`
                            }}
                        />
                    </div>

                    {/* Time Control */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            <Clock size={16} className="inline mr-1" />
                            Time Selection
                        </label>
                        <select
                            value={timeSelection}
                            onChange={(e) => setTimeSelection(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        >
                            {timeOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-gray-800">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Refresh Control */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Auto Refresh
                        </label>
                        <button
                            onClick={fetchSatelliteData}
                            disabled={loading}
                            className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-lg text-white transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh Now'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Satellite Image Display */}
            <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <span className={`text-2xl mr-2`}>{currentLayer?.icon}</span>
                            {currentLayer?.name} - {location?.name || 'Current Location'}
                        </h3>
                        <p className="text-sm text-white/60">
                            {currentLayer?.description} • {formatTimeAgo(timeSelection)}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-white/60">Last Updated</div>
                        <div className="text-sm text-white">
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>

                <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${isFullscreen ? 'h-full' : ''}`} style={{ minHeight: isFullscreen ? 'auto' : '500px' }}>
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Satellite className="text-blue-400 animate-spin mx-auto mb-4" size={48} />
                                <div className="text-white/60 mb-2">Loading satellite imagery...</div>
                                <div className="text-white/40 text-sm">Fetching {currentLayer?.name.toLowerCase()} data</div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-full">
                            {/* Enhanced Base Map */}
                            <div className={`w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center ${isFullscreen ? 'h-full' : 'h-96'}`}>
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={`${currentLayer?.name} satellite view`}
                                        className="w-full h-full object-cover"
                                        onLoad={() => setLoading(false)}
                                    />
                                ) : (
                                    <div className="text-center text-white/60">
                                        <Satellite size={64} className="mx-auto mb-4" />
                                        <div className="text-lg font-medium">Satellite View</div>
                                        <div className="text-sm">{currentLayer?.name}</div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Weather Layer Overlay */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${currentLayer?.gradient || 'from-blue-500/30 to-purple-500/30'} mix-blend-overlay transition-opacity duration-300`}
                                style={{ opacity }}
                            />

                            {/* Enhanced Interactive Elements */}
                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                <div className="text-white text-sm space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <MapPin size={14} />
                                        <span className="font-medium">{location?.name || 'Unknown Location'}</span>
                                    </div>
                                    <div>Lat: {location?.lat?.toFixed(4) || '0.0000'}</div>
                                    <div>Lng: {location?.lng?.toFixed(4) || '0.0000'}</div>
                                    <div>Zoom: {zoom}x</div>
                                    <div>Layer: {currentLayer?.name}</div>
                                </div>
                            </div>

                            {/* Enhanced Legend */}
                            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/10 max-w-xs">
                                <div className="text-white text-xs">
                                    <div className="font-medium mb-3 flex items-center">
                                        <span className="mr-2">{currentLayer?.icon}</span>
                                        {currentLayer?.name} Legend
                                    </div>
                                    <div className="space-y-2">
                                        {selectedLayer === 'clouds' && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-white rounded-sm"></div>
                                                    <span>Heavy Clouds (80-100%)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                                                    <span>Moderate Clouds (40-80%)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-gray-600 rounded-sm"></div>
                                                    <span>Light Clouds (10-40%)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-transparent border border-gray-400 rounded-sm"></div>
                                                    <span>Clear Sky (0-10%)</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedLayer === 'precipitation' && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-blue-600 rounded-sm"></div>
                                                    <span>Heavy Rain (>10mm/h)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-blue-400 rounded-sm"></div>
                                                    <span>Moderate Rain (2-10mm/h)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-blue-200 rounded-sm"></div>
                                                    <span>Light Rain (0.1-2mm/h)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-transparent border border-gray-400 rounded-sm"></div>
                                                    <span>No Precipitation</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedLayer === 'temperature' && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-red-600 rounded-sm"></div>
                                                    <span>Hot (>30°C)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-orange-400 rounded-sm"></div>
                                                    <span>Warm (20-30°C)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-yellow-400 rounded-sm"></div>
                                                    <span>Mild (10-20°C)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-blue-400 rounded-sm"></div>
                                                    <span>Cold (10°C)</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedLayer === 'pressure' && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-purple-600 rounded-sm"></div>
                                                    <span>High (>1020 hPa)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-purple-400 rounded-sm"></div>
                                                    <span>Normal (1000-1020 hPa)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-pink-400 rounded-sm"></div>
                                                    <span>Low (1000 hPa)</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedLayer === 'wind' && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-green-600 rounded-sm"></div>
                                                    <span>Strong (>15 m/s)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-green-400 rounded-sm"></div>
                                                    <span>Moderate (5-15 m/s)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-teal-400 rounded-sm"></div>
                                                    <span>Light (1-5 m/s)</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-3 bg-transparent border border-gray-400 rounded-sm"></div>
                                                    <span>Calm (1 m/s)</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Close Fullscreen Button */}
                            {isFullscreen && (
                                <button
                                    onClick={toggleFullscreen}
                                    className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black/80 rounded-lg transition-colors border border-white/10"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Enhanced Image Info */}
                <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center space-x-4">
                        <span>Resolution: {zoom > 10 ? 'High' : zoom > 6 ? 'Medium' : 'Low'}</span>
                        <span>Coverage: {zoom > 8 ? 'Local' : 'Regional'}</span>
                        <span>Source: Satellite</span>
                        <span className={`px-2 py-1 rounded text-xs ${currentLayer?.color} bg-white/10`}>
              {currentLayer?.name}
            </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>Updated: {new Date().toLocaleString()}</span>
                    </div>
                </div>

                {/* Hidden canvas for download functionality */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Enhanced Weather Data Integration */}
            {weatherData && (
                <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <span className="mr-2">🌤️</span>
                        Current Conditions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <div className="text-2xl font-bold text-white mb-1">
                                {weatherData.clouds?.all || 0}%
                            </div>
                            <div className="text-sm text-white/70">Cloud Cover</div>
                            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${weatherData.clouds?.all || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <div className="text-2xl font-bold text-white mb-1">
                                {weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) : 'N/A'} km
                            </div>
                            <div className="text-sm text-white/70">Visibility</div>
                            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((weatherData.visibility || 0) / 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <div className="text-2xl font-bold text-white mb-1">
                                {weatherData.wind?.speed || 0} m/s
                            </div>
                            <div className="text-sm text-white/70">Wind Speed</div>
                            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((weatherData.wind?.speed || 0) * 5, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <div className="text-2xl font-bold text-white mb-1">
                                {weatherData.main?.pressure || 0} hPa
                            </div>
                            <div className="text-sm text-white/70">Pressure</div>
                            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(((weatherData.main?.pressure || 1000) - 950) / 100 * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SatelliteImagery;