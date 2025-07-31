import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Clock, ThermometerSun, Droplets, Wind, Sun, CloudRain, Snowflake, Star } from 'lucide-react';

const ActivitySuggestions = ({ weatherData, location, forecastData }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [timeOfDay, setTimeOfDay] = useState('current');
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: 'all', name: 'All Activities', icon: Activity },
        { id: 'outdoor', name: 'Outdoor', icon: Sun },
        { id: 'indoor',  name: 'Indoor', icon: CloudRain },
        { id: 'sports', name: 'Sports', icon: Activity },
        { id: 'leisure', name: 'Leisure', icon: Star },
        { id: 'travel', name: 'Travel', icon: MapPin }
    ];

    const timeSlots = [
        { id: 'current', name: 'Now' },
        { id: 'morning', name: 'Morning' },
        { id: 'afternoon', name: 'Afternoon' },
        { id: 'evening', name: 'Evening' }
    ];

    useEffect(() => {
        if (weatherData) {
            generateRecommendations();
        }
    }, [weatherData, selectedCategory, timeOfDay]);

    const generateRecommendations = () => {
        setLoading(true);

        setTimeout(() => {
            const temp = weatherData.main?.temp || 20;
            const humidity = weatherData.main?.humidity || 50;
            const windSpeed = weatherData.wind?.speed || 3;
            const condition = weatherData.weather?.[0]?.main?.toLowerCase() || 'clear';
            const isRaining = condition === 'rain';
            const isSnowing = condition === 'snow';
            const isCloudy = condition === 'clouds';

            let allRecommendations = [];

            // Outdoor Activities
            if (temp > 15 && !isRaining && !isSnowing) {
                allRecommendations.push(
                    {
                        id: 1,
                        category: 'outdoor',
                        title: 'Go for a Walk',
                        description: 'Perfect weather for a leisurely stroll in the park',
                        suitability: temp > 20 ? 95 : 80,
                        icon: '🚶‍♂️',
                        duration: '30-60 minutes',
                        location: 'Local park or neighborhood',
                        tips: ['Wear comfortable shoes', 'Bring water if it\'s warm'],
                        weatherFactors: ['Temperature is comfortable', 'No precipitation expected']
                    },
                    {
                        id: 2,
                        category: 'outdoor',
                        title: 'Cycling',
                        description: 'Great conditions for a bike ride',
                        suitability: windSpeed < 5 ? 90 : 70,
                        icon: '🚴‍♂️',
                        duration: '45-90 minutes',
                        location: 'Bike trails or quiet roads',
                        tips: ['Check tire pressure', 'Wear helmet', 'Stay hydrated'],
                        weatherFactors: ['Good visibility', 'Manageable wind conditions']
                    }
                );
            }

            if (temp > 25 && !isRaining) {
                allRecommendations.push(
                    {
                        id: 3,
                        category: 'outdoor',
                        title: 'Beach Day',
                        description: 'Excellent weather for beach activities',
                        suitability: 95,
                        icon: '🏖️',
                        duration: '2-4 hours',
                        location: 'Nearby beach or lake',
                        tips: ['Apply sunscreen', 'Bring plenty of water', 'Seek shade periodically'],
                        weatherFactors: ['High temperature perfect for swimming', 'Clear conditions']
                    },
                    {
                        id: 4,
                        category: 'sports',
                        title: 'Outdoor Sports',
                        description: 'Perfect for tennis, basketball, or soccer',
                        suitability: humidity < 70 ? 90 : 75,
                        icon: '⚽',
                        duration: '60-120 minutes',
                        location: 'Sports courts or fields',
                        tips: ['Start hydrating early', 'Take breaks in shade', 'Wear breathable clothing'],
                        weatherFactors: ['Warm temperature ideal for activity', 'Good grip conditions']
                    }
                );
            }

            // Indoor Activities
            if (isRaining || isSnowing || temp < 5) {
                allRecommendations.push(
                    {
                        id: 5,
                        category: 'indoor',
                        title: 'Visit a Museum',
                        description: 'Perfect weather to explore indoor cultural attractions',
                        suitability: 90,
                        icon: '🏛️',
                        duration: '2-3 hours',
                        location: 'Local museums or galleries',
                        tips: ['Check opening hours', 'Look for special exhibitions', 'Consider guided tours'],
                        weatherFactors: ['Weather makes indoor activities more appealing']
                    },
                    {
                        id: 6,
                        category: 'indoor',
                        title: 'Shopping',
                        description: 'Great day for indoor shopping and browsing',
                        suitability: 85,
                        icon: '🛍️',
                        duration: '2-4 hours',
                        location: 'Shopping centers or malls',
                        tips: ['Make a list beforehand', 'Compare prices', 'Take breaks at cafes'],
                        weatherFactors: ['Indoor climate-controlled environment']
                    }
                );
            }

            // Weather-specific activities
            if (isRaining) {
                allRecommendations.push(
                    {
                        id: 7,
                        category: 'indoor',
                        title: 'Cozy Reading Session',
                        description: 'Perfect rainy day activity with the sound of rain',
                        suitability: 95,
                        icon: '📚',
                        duration: '1-3 hours',
                        location: 'Home or local library',
                        tips: ['Make hot tea or coffee', 'Find a comfortable spot', 'Have good lighting'],
                        weatherFactors: ['Rain creates perfect ambient sound', 'Indoor comfort ideal']
                    },
                    {
                        id: 8,
                        category: 'leisure',
                        title: 'Cooking Project',
                        description: 'Great time to try that new recipe',
                        suitability: 90,
                        icon: '👨‍🍳',
                        duration: '1-2 hours',
                        location: 'Home kitchen',
                        tips: ['Check you have all ingredients', 'Prep ingredients first', 'Clean as you go'],
                        weatherFactors: ['Indoor activity perfect for rainy weather']
                    }
                );
            }

            if (condition === 'clear' && temp > 18) {
                allRecommendations.push(
                    {
                        id: 9,
                        category: 'outdoor',
                        title: 'Photography Walk',
                        description: 'Excellent lighting conditions for outdoor photography',
                        suitability: 95,
                        icon: '📸',
                        duration: '60-120 minutes',
                        location: 'Scenic areas or urban landscapes',
                        tips: ['Golden hour is best', 'Bring extra batteries', 'Try different angles'],
                        weatherFactors: ['Clear skies provide excellent natural lighting']
                    },
                    {
                        id: 10,
                        category: 'leisure',
                        title: 'Outdoor Dining',
                        description: 'Perfect weather for patio dining or picnic',
                        suitability: windSpeed < 4 ? 90 : 70,
                        icon: '🍽️',
                        duration: '60-90 minutes',
                        location: 'Restaurants with patios or parks',
                        tips: ['Make reservations for popular spots', 'Bring a light jacket for evening'],
                        weatherFactors: ['Pleasant temperature for outdoor eating']
                    }
                );
            }

            // Snow activities
            if (isSnowing && temp < 2) {
                allRecommendations.push(
                    {
                        id: 11,
                        category: 'outdoor',
                        title: 'Snow Activities',
                        description: 'Perfect conditions for winter sports and fun',
                        suitability: 95,
                        icon: '⛄',
                        duration: '60-180 minutes',
                        location: 'Local hills or snow-covered areas',
                        tips: ['Dress in layers', 'Wear waterproof clothing', 'Stay warm and dry'],
                        weatherFactors: ['Fresh snowfall creates ideal conditions']
                    }
                );
            }

            // Wind-based activities
            if (windSpeed > 6 && !isRaining) {
                allRecommendations.push(
                    {
                        id: 12,
                        category: 'outdoor',
                        title: 'Kite Flying',
                        description: 'Excellent wind conditions for kite flying',
                        suitability: 90,
                        icon: '🪁',
                        duration: '30-90 minutes',
                        location: 'Open fields or beach',
                        tips: ['Choose an open area', 'Check for power lines', 'Have fun!'],
                        weatherFactors: ['Strong winds perfect for kite flying']
                    }
                );
            }

            // Filter by category
            let filteredRecommendations = selectedCategory === 'all'
                ? allRecommendations
                : allRecommendations.filter(rec => rec.category === selectedCategory);

            // Sort by suitability
            filteredRecommendations.sort((a, b) => b.suitability - a.suitability);

            setRecommendations(filteredRecommendations);
            setLoading(false);
        }, 500);
    };

    const getSuitabilityColor = (suitability) => {
        if (suitability >= 90) return 'text-green-400';
        if (suitability >= 75) return 'text-yellow-400';
        if (suitability >= 60) return 'text-orange-400';
        return 'text-red-400';
    };

    const getSuitabilityBg = (suitability) => {
        if (suitability >= 90) return 'from-green-500/20 to-emerald-500/20';
        if (suitability >= 75) return 'from-yellow-500/20 to-amber-500/20';
        if (suitability >= 60) return 'from-orange-500/20 to-red-500/20';
        return 'from-red-500/20 to-pink-500/20';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Activity className="text-green-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Activity Recommendations</h2>
            </div>

            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Activity Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(category => {
                                const IconComponent = category.icon;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            selectedCategory === category.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                                        }`}
                                    >
                                        <IconComponent size={16} />
                                        <span>{category.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Filter */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Time of Day</label>
                        <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setTimeOfDay(slot.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        timeOfDay === slot.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}
                                >
                                    {slot.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weather Summary */}
                <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <ThermometerSun className="text-red-400" size={20} />
                            <span className="text-white">{weatherData?.main?.temp}°C</span>

                            <Droplets className="text-blue-400" size={20} />
                            <span className="text-white">{weatherData?.main?.humidity}%</span>

                            <Wind className="text-gray-400" size={20} />
                            <span className="text-white">{weatherData?.wind?.speed} m/s</span>
                        </div>
                        <div className="text-white/70 capitalize">
                            {weatherData?.weather?.[0]?.description}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                            <div className="h-6 bg-white/20 rounded mb-4"></div>
                            <div className="h-16 bg-white/20 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-white/20 rounded"></div>
                                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((recommendation) => (
                        <div
                            key={recommendation.id}
                            className={`bg-gradient-to-br ${getSuitabilityBg(recommendation.suitability)} backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-3xl">{recommendation.icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{recommendation.title}</h3>
                                        <p className="text-white/70 text-sm">{recommendation.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${getSuitabilityColor(recommendation.suitability)}`}>
                                        {recommendation.suitability}%
                                    </div>
                                    <div className="text-xs text-white/60">Suitability</div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Clock className="text-blue-400" size={16} />
                                    <span className="text-white/80 text-sm">{recommendation.duration}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <MapPin className="text-green-400" size={16} />
                                    <span className="text-white/80 text-sm">{recommendation.location}</span>
                                </div>

                                {/* Weather Factors */}
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="text-sm font-medium text-white/90 mb-2">Why it's recommended:</div>
                                    <ul className="text-xs text-white/70 space-y-1">
                                        {recommendation.weatherFactors.map((factor, index) => (
                                            <li key={index}>• {factor}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tips */}
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-sm font-medium text-white/90 mb-2">Tips:</div>
                                    <ul className="text-xs text-white/70 space-y-1">
                                        {recommendation.tips.map((tip, index) => (
                                            <li key={index}>• {tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/10 text-center">
                    <Activity className="text-white/40 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Available</h3>
                    <p className="text-white/60">
                        Try adjusting your filters or check back when weather data is available
                    </p>
                </div>
            )}

            {/* Weekly Activity ForecastCards */}
            {forecastData && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">5-Day Activity Outlook</h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const temp = 20 + Math.random() * 10;
                            const condition = ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)];
                            const date = new Date();
                            date.setDate(date.getDate() + index);

                            let bestActivity = 'Indoor Activities';
                            let activityIcon = '🏠';

                            if (condition === 'Clear' && temp > 20) {
                                bestActivity = 'Outdoor Sports';
                                activityIcon = '⚽';
                            } else if (condition === 'Cloudy' && temp > 15) {
                                bestActivity = 'Walking/Hiking';
                                activityIcon = '🚶‍♂️';
                            } else if (condition === 'Rain') {
                                bestActivity = 'Museums/Shopping';
                                activityIcon = '🏛️';
                            } else if (condition === 'Snow') {
                                bestActivity = 'Winter Sports';
                                activityIcon = '⛄';
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
                                    <div className="text-2xl mb-2">{activityIcon}</div>
                                    <div className="text-xs text-white/70">
                                        {bestActivity}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivitySuggestions;