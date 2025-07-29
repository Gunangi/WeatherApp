import React, { useState, useEffect } from 'react';
import { Shirt, Thermometer, Wind, CloudRain, Sun, Snowflake, Umbrella } from 'lucide-react';

const ClothingSuggestions = ({ weatherData, forecastData, userPreferences = {} }) => {
    const [clothingSuggestions, setClothingSuggestions] = useState(null);
    const [selectedGender, setSelectedGender] = useState(userPreferences.gender || 'unisex');
    const [selectedStyle, setSelectedStyle] = useState(userPreferences.style || 'casual');
    const [loading, setLoading] = useState(true);

    const genderOptions = [
        { id: 'unisex', name: 'Unisex' },
        { id: 'men', name: 'Men' },
        { id: 'women', name: 'Women' }
    ];

    const styleOptions = [
        { id: 'casual', name: 'Casual' },
        { id: 'business', name: 'Business' },
        { id: 'sporty', name: 'Sporty' },
        { id: 'formal', name: 'Formal' }
    ];

    useEffect(() => {
        if (weatherData) {
            generateClothingSuggestions();
        }
    }, [weatherData, selectedGender, selectedStyle]);

    const generateClothingSuggestions = () => {
        setLoading(true);

        setTimeout(() => {
            const temp = weatherData.main?.temp || 20;
            const feelsLike = weatherData.main?.feels_like || temp;
            const humidity = weatherData.main?.humidity || 50;
            const windSpeed = weatherData.wind?.speed || 0;
            const condition = weatherData.weather?.[0]?.main?.toLowerCase() || 'clear';
            const isRaining = condition === 'rain';
            const isSnowing = condition === 'snow';
            const isCloudy = condition === 'clouds';

            let suggestions = {
                layers: [],
                accessories: [],
                footwear: [],
                colors: [],
                materials: [],
                comfort: 0,
                style: selectedStyle,
                weatherIcon: '☀️'
            };

            // Temperature-based clothing suggestions
            if (temp < 0) {
                suggestions.weatherIcon = '🥶';
                suggestions.layers = [
                    'Thermal underwear',
                    'Insulated base layer',
                    'Warm sweater or fleece',
                    'Heavy winter coat or parka',
                    'Insulated gloves',
                    'Warm hat/beanie',
                    'Scarf or neck warmer'
                ];
                suggestions.footwear = ['Insulated winter boots', 'Thick wool socks'];
                suggestions.materials = ['Wool', 'Down insulation', 'Fleece', 'Waterproof fabrics'];
                suggestions.comfort = 85;
            } else if (temp < 5) {
                suggestions.weatherIcon = '🧥';
                suggestions.layers = [
                    'Long-sleeve base layer',
                    'Warm sweater or cardigan',
                    'Winter coat or heavy jacket',
                    'Gloves',
                    'Warm hat'
                ];
                suggestions.footwear = ['Closed-toe shoes', 'Boots', 'Warm socks'];
                suggestions.materials = ['Wool', 'Fleece', 'Cotton blends'];
                suggestions.comfort = 75;
            } else if (temp < 10) {
                suggestions.weatherIcon = '🧥';
                suggestions.layers = [
                    'Long-sleeve shirt',
                    'Sweater or light jacket',
                    'Medium-weight coat'
                ];
                suggestions.footwear = ['Closed-toe shoes', 'Light boots'];
                suggestions.materials = ['Cotton', 'Light wool', 'Denim'];
                suggestions.comfort = 80;
            } else if (temp < 15) {
                suggestions.weatherIcon = '👕';
                suggestions.layers = [
                    'Long-sleeve shirt or light sweater',
                    'Light jacket or cardigan'
                ];
                suggestions.footwear = ['Comfortable shoes', 'Sneakers'];
                suggestions.materials = ['Cotton', 'Light knits'];
                suggestions.comfort = 85;
            } else if (temp < 20) {
                suggestions.weatherIcon = '👕';
                suggestions.layers = [
                    'Long-sleeve shirt or t-shirt',
                    'Light cardigan or jacket (optional)'
                ];
                suggestions.footwear = ['Comfortable shoes', 'Sneakers', 'Loafers'];
                suggestions.materials = ['Cotton', 'Linen blends'];
                suggestions.comfort = 90;
            } else if (temp < 25) {
                suggestions.weatherIcon = '👕';
                suggestions.layers = [
                    'T-shirt or polo shirt',
                    'Light cardigan for air conditioning'
                ];
                suggestions.footwear = ['Light shoes', 'Sneakers', 'Flats'];
                suggestions.materials = ['Cotton', 'Linen', 'Breathable fabrics'];
                suggestions.comfort = 95;
            } else if (temp < 30) {
                suggestions.weatherIcon = '☀️';
                suggestions.layers = [
                    'Light t-shirt or tank top',
                    'Shorts or lightweight pants'
                ];
                suggestions.footwear = ['Sandals', 'Light sneakers', 'Canvas shoes'];
                suggestions.materials = ['Cotton', 'Linen', 'Moisture-wicking fabrics'];
                suggestions.comfort = 90;
            } else {
                suggestions.weatherIcon = '🌡️';
                suggestions.layers = [
                    'Light, breathable t-shirt',
                    'Shorts',
                    'Sun hat'
                ];
                suggestions.footwear = ['Sandals', 'Breathable sneakers'];
                suggestions.materials = ['Linen', 'Moisture-wicking fabrics', 'Lightweight cotton'];
                suggestions.comfort = 85;
            }

            // Weather condition adjustments
            if (isRaining) {
                suggestions.weatherIcon = '🌧️';
                suggestions.accessories.push('Umbrella', 'Waterproof jacket', 'Rain boots');
                suggestions.materials.push('Waterproof fabrics', 'Quick-dry materials');
                suggestions.comfort -= 10;
            }

            if (isSnowing) {
                suggestions.weatherIcon = '❄️';
                suggestions.accessories.push('Waterproof gloves', 'Snow boots', 'Warm hat');
                suggestions.materials.push('Waterproof outer layer', 'Insulated materials');
            }

            // Wind adjustments
            if (windSpeed > 5) {
                suggestions.accessories.push('Light jacket or windbreaker');
                if (!suggestions.accessories.includes('Umbrella') && isRaining) {
                    suggestions.accessories.push('Rain jacket (umbrella may be difficult in wind)');
                }
                suggestions.comfort -= 5;
            }

            // Humidity adjustments
            if (humidity > 70 && temp > 20) {
                suggestions.materials = suggestions.materials.filter(m => m !== 'Wool');
                suggestions.materials.push('Moisture-wicking fabrics', 'Breathable cotton');
                suggestions.comfort -= 5;
            }

            // Style-based adjustments
            if (selectedStyle === 'business') {
                suggestions.layers = suggestions.layers.map(layer => {
                    if (layer.includes('t-shirt')) return layer.replace('t-shirt', 'dress shirt');
                    if (layer.includes('shorts')) return layer.replace('shorts', 'dress pants');
                    return layer;
                });
                suggestions.footwear = suggestions.footwear.map(shoe => {
                    if (shoe.includes('sneakers')) return 'dress shoes';
                    if (shoe.includes('sandals')) return 'closed-toe dress shoes';
                    return shoe;
                });
            } else if (selectedStyle === 'sporty') {
                suggestions.materials.push('Athletic fabrics', 'Moisture-wicking materials');
                suggestions.footwear = suggestions.footwear.map(shoe => {
                    if (!shoe.includes('athletic') && !shoe.includes('sneakers')) {
                        return 'athletic shoes';
                    }
                    return shoe;
                });
            }

            // Color suggestions based on temperature and weather
            if (temp > 25) {
                suggestions.colors = ['Light colors', 'White', 'Pastels', 'Light blue', 'Beige'];
            } else if (temp < 10) {
                suggestions.colors = ['Dark colors', 'Black', 'Navy', 'Dark gray', 'Burgundy'];
            } else {
                suggestions.colors = ['Medium tones', 'Earth colors', 'Blues', 'Greens'];
            }

            // Add UV protection for sunny days
            if (condition === 'clear' && temp > 20) {
                suggestions.accessories.push('Sunglasses', 'Sun hat', 'Sunscreen');
            }

            setClothingSuggestions(suggestions);
            setLoading(false);
        }, 500);
    };

    const getComfortColor = (comfort) => {
        if (comfort >= 90) return 'text-green-400';
        if (comfort >= 75) return 'text-yellow-400';
        if (comfort >= 60) return 'text-orange-400';
        return 'text-red-400';
    };

    const getComfortBg = (comfort) => {
        if (comfort >= 90) return 'from-green-500/20 to-emerald-500/20';
        if (comfort >= 75) return 'from-yellow-500/20 to-amber-500/20';
        if (comfort >= 60) return 'from-orange-500/20 to-red-500/20';
        return 'from-red-500/20 to-pink-500/20';
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                <div className="flex items-center space-x-2 mb-6">
                    <Shirt className="text-blue-400 animate-pulse" size={24} />
                    <div className="h-6 bg-white/20 rounded w-48"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-32 bg-white/20 rounded"></div>
                    <div className="h-32 bg-white/20 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Shirt className="text-blue-400" size={24} />
                <h2 className="text-2xl font-bold text-white">What to Wear</h2>
            </div>

            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Style Preference</label>
                        <div className="grid grid-cols-2 gap-2">
                            {styleOptions.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedStyle === style.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Clothing Style</label>
                        <div className="grid grid-cols-3 gap-2">
                            {genderOptions.map(gender => (
                                <button
                                    key={gender.id}
                                    onClick={() => setSelectedGender(gender.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedGender === gender.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}
                                >
                                    {gender.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Summary */}
            <div className={`bg-gradient-to-br ${getComfortBg(clothingSuggestions?.comfort)} backdrop-blur-md rounded-2xl p-6 border border-white/10`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="text-4xl">{clothingSuggestions?.weatherIcon}</div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {weatherData?.main?.temp}°C (feels like {weatherData?.main?.feels_like}°C)
                            </h3>
                            <p className="text-white/70 capitalize">
                                {weatherData?.weather?.[0]?.description}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getComfortColor(clothingSuggestions?.comfort)}`}>
                            {clothingSuggestions?.comfort}%
                        </div>
                        <div className="text-sm text-white/70">Comfort Level</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        <Thermometer className="text-red-400" size={16} />
                        <span className="text-white/80 text-sm">{weatherData?.main?.temp}°C</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Wind className="text-gray-400" size={16} />
                        <span className="text-white/80 text-sm">{weatherData?.wind?.speed} m/s</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CloudRain className="text-blue-400" size={16} />
                        <span className="text-white/80 text-sm">{weatherData?.main?.humidity}%</span>
                    </div>
                </div>
            </div>

            {/* Clothing Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Main Clothing */}
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center space-x-2 mb-4">
                        <Shirt className="text-blue-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Main Clothing</h3>
                    </div>
                    <ul className="space-y-2">
                        {clothingSuggestions?.layers.map((layer, index) => (
                            <li key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-white/80 text-sm">{layer}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footwear */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-green-400 text-xl">👟</span>
                        <h3 className="text-lg font-semibold text-white">Footwear</h3>
                    </div>
                    <ul className="space-y-2">
                        {clothingSuggestions?.footwear.map((shoe, index) => (
                            <li key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-white/80 text-sm">{shoe}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Accessories */}
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center space-x-2 mb-4">
                        <Umbrella className="text-purple-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Accessories</h3>
                    </div>
                    {clothingSuggestions?.accessories.length > 0 ? (
                        <ul className="space-y-2">
                            {clothingSuggestions.accessories.map((accessory, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <span className="text-white/80 text-sm">{accessory}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-white/60 text-sm">No special accessories needed</p>
                    )}
                </div>
            </div>

            {/* Materials and Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommended Materials */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Recommended Materials</h3>
                    <div className="flex flex-wrap gap-2">
                        {clothingSuggestions?.materials.map((material, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm"
                            >
                {material}
              </span>
                        ))}
                    </div>
                </div>

                {/* Color Palette */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Suggested Colors</h3>
                    <div className="flex flex-wrap gap-2">
                        {clothingSuggestions?.colors.map((color, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-sm"
                            >
                {color}
              </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5-Day Clothing Forecast */}
            {forecastData && (
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">5-Day Clothing Forecast</h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const temp = 15 + Math.random() * 15;
                            const condition = ['Clear', 'Cloudy', 'Rain'][Math.floor(Math.random() * 3)];
                            const date = new Date();
                            date.setDate(date.getDate() + index);

                            let clothingIcon = '👕';
                            let suggestion = 'Light clothing';

                            if (temp < 10) {
                                clothingIcon = '🧥';
                                suggestion = 'Warm layers';
                            } else if (temp > 25) {
                                clothingIcon = '🩱';
                                suggestion = 'Light & breathable';
                            } else if (condition === 'Rain') {
                                clothingIcon = '☂️';
                                suggestion = 'Waterproof gear';
                            }

                            return (
                                <div key={index} className="bg-white/10 rounded-xl p-4 text-center">
                                    <div className="text-sm text-white/70 mb-1">
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className="text-lg font-bold text-white mb-2">
                                        {Math.round(temp)}°C
                                    </div>
                                    <div className="text-sm text-white/80 mb-3">
                                        {condition}
                                    </div>
                                    <div className="text-2xl mb-2">{clothingIcon}</div>
                                    <div className="text-xs text-white/70">
                                        {suggestion}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Styling Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-white mb-2">Weather-based tips:</h4>
                        <ul className="text-sm text-white/80 space-y-1">
                            <li>• Layer clothing for easy temperature adjustment</li>
                            <li>• Choose breathable fabrics in humid conditions</li>
                            <li>• Waterproof outer layers for rainy weather</li>
                            <li>• Light colors reflect heat in sunny weather</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-white mb-2">Comfort tips:</h4>
                        <ul className="text-sm text-white/80 space-y-1">
                            <li>• Check the "feels like" temperature</li>
                            <li>• Consider indoor air conditioning</li>
                            <li>• Bring an extra layer for temperature changes</li>
                            <li>• Choose comfortable footwear for the day's activities</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClothingSuggestions;