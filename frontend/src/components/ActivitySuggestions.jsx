import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Snowflake, MapPin, Clock, Users, Star, RefreshCw } from 'lucide-react';

const ActivitySuggestions = ({ weatherData, location }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [timeOfDay, setTimeOfDay] = useState('current');

    // Mock weather data if not provided
    const currentWeather = weatherData || {
        temperature: 28,
        condition: 'partly-cloudy',
        humidity: 65,
        windSpeed: 8,
        uvIndex: 6,
        precipitation: 10,
        visibility: 9.2
    };

    const activities = [
        // Outdoor Activities
        {
            id: 1,
            name: 'Morning Jog',
            category: 'fitness',
            type: 'outdoor',
            duration: '30-45 min',
            groupSize: '1-2',
            icon: '🏃‍♂️',
            description: 'Perfect weather for a refreshing morning run in the park.',
            idealConditions: {
                temperature: [15, 25],
                precipitation: [0, 20],
                windSpeed: [0, 15],
                uvIndex: [0, 7]
            },
            rating: 9.2,
            tips: ['Wear breathable clothing', 'Stay hydrated', 'Choose shaded routes']
        },
        {
            id: 2,
            name: 'Outdoor Photography',
            category: 'creative',
            type: 'outdoor',
            duration: '1-3 hours',
            groupSize: '1-4',
            icon: '📸',
            description: 'Great lighting conditions for capturing stunning outdoor photos.',
            idealConditions: {
                temperature: [10, 30],
                precipitation: [0, 30],
                windSpeed: [0, 20],
                visibility: [5, 10]
            },
            rating: 8.7,
            tips: ['Golden hour lighting', 'Protect equipment from moisture', 'Use polarizing filters']
        },
        {
            id: 3,
            name: 'Picnic in the Park',
            category: 'leisure',
            type: 'outdoor',
            duration: '2-4 hours',
            groupSize: '2-8',
            icon: '🧺',
            description: 'Wonderful weather for enjoying a relaxing picnic outdoors.',
            idealConditions: {
                temperature: [18, 28],
                precipitation: [0, 10],
                windSpeed: [0, 12],
                uvIndex: [0, 8]
            },
            rating: 8.5,
            tips: ['Bring sunscreen', 'Pack plenty of water', 'Choose shaded spots']
        },
        {
            id: 4,
            name: 'Beach Volleyball',
            category: 'sports',
            type: 'outdoor',
            duration: '1-2 hours',
            groupSize: '4-8',
            icon: '🏐',
            description: 'Perfect conditions for an energetic beach volleyball match.',
            idealConditions: {
                temperature: [20, 32],
                precipitation: [0, 5],
                windSpeed: [0, 25],
                uvIndex: [0, 9]
            },
            rating: 9.0,
            tips: ['Wear UV protection', 'Stay hydrated', 'Play during cooler hours']
        },

        // Indoor Activities
        {
            id: 5,
            name: 'Museum Visit',
            category: 'cultural',
            type: 'indoor',
            duration: '2-4 hours',
            groupSize: '1-6',
            icon: '🏛️',
            description: 'Perfect weather for exploring indoor cultural attractions.',
            idealConditions: {
                temperature: [-10, 40],
                precipitation: [0, 100],
                windSpeed: [0, 50]
            },
            rating: 7.8,
            tips: ['Check opening hours', 'Book tickets in advance', 'Comfortable walking shoes']
        },
        {
            id: 6,
            name: 'Cooking Class',
            category: 'learning',
            type: 'indoor',
            duration: '2-3 hours',
            groupSize: '2-12',
            icon: '👨‍🍳',
            description: 'Great indoor activity to learn new culinary skills.',
            idealConditions: {
                temperature: [-10, 40],
                precipitation: [0, 100],
                windSpeed: [0, 50]
            },
            rating: 8.3,
            tips: ['Bring apron', 'Come hungry', 'Take notes for recipes']
        },
        {
            id: 7,
            name: 'Indoor Rock Climbing',
            category: 'fitness',
            type: 'indoor',
            duration: '1-2 hours',
            groupSize: '2-6',
            icon: '🧗‍♀️',
            description: 'Challenge yourself with indoor climbing regardless of weather.',
            idealConditions: {
                temperature: [-10, 40],
                precipitation: [0, 100],
                windSpeed: [0, 50]
            },
            rating: 8.9,
            tips: ['Wear comfortable clothes', 'Rent climbing shoes', 'Start with easier routes']
        },

        // Seasonal Activities
        {
            id: 8,
            name: 'Hiking Trail',
            category: 'adventure',
            type: 'outdoor',
            duration: '2-6 hours',
            groupSize: '2-8',
            icon: '🥾',
            description: 'Excellent conditions for exploring nature trails.',
            idealConditions: {
                temperature: [5, 25],
                precipitation: [0, 20],
                windSpeed: [0, 20],
                visibility: [3, 10]
            },
            rating: 9.1,
            tips: ['Wear proper footwear', 'Bring water and snacks', 'Check trail conditions']
        },
        {
            id: 9,
            name: 'Outdoor Yoga',
            category: 'wellness',
            type: 'outdoor',
            duration: '45-90 min',
            groupSize: '1-20',
            icon: '🧘‍♀️',
            description: 'Peaceful weather perfect for connecting with nature through yoga.',
            idealConditions: {
                temperature: [16, 26],
                precipitation: [0, 5],
                windSpeed: [0, 10],
                uvIndex: [0, 6]
            },
            rating: 8.8,
            tips: ['Bring yoga mat', 'Find level ground', 'Practice early morning or evening']
        },
        {
            id: 10,
            name: 'Coffee Shop Reading',
            category: 'leisure',
            type: 'indoor',
            duration: '1-3 hours',
            groupSize: '1-2',
            icon: '☕',
            description: 'Cozy indoor activity perfect for any weather condition.',
            idealConditions: {
                temperature: [-10, 40],
                precipitation: [0, 100],
                windSpeed: [0, 50]
            },
            rating: 7.5,
            tips: ['Bring a good book', 'Try local specialties', 'Find comfortable seating']
        }
    ];

    const calculateSuitability = (activity) => {
        const { temperature, precipitation, windSpeed, uvIndex, visibility } = currentWeather;
        const conditions = activity.idealConditions;

        let score = 0;
        let maxScore = 0;

        // Temperature score
        if (conditions.temperature) {
            maxScore += 30;
            if (temperature >= conditions.temperature[0] && temperature <= conditions.temperature[1]) {
                score += 30;
            } else {
                const tempDiff = Math.min(
                    Math.abs(temperature - conditions.temperature[0]),
                    Math.abs(temperature - conditions.temperature[1])
                );
                score += Math.max(0, 30 - tempDiff * 2);
            }
        }

        // Precipitation score
        if (conditions.precipitation) {
            maxScore += 25;
            if (precipitation <= conditions.precipitation[1]) {
                score += 25;
            } else {
                score += Math.max(0, 25 - (precipitation - conditions.precipitation[1]) * 2);
            }
        }

        // Wind speed score
        if (conditions.windSpeed) {
            maxScore += 20;
            if (windSpeed <= conditions.windSpeed[1]) {
                score += 20;
            } else {
                score += Math.max(0, 20 - (windSpeed - conditions.windSpeed[1]));
            }
        }

        // UV Index score
        if (conditions.uvIndex) {
            maxScore += 15;
            if (uvIndex <= conditions.uvIndex[1]) {
                score += 15;
            } else {
                score += Math.max(0, 15 - (uvIndex - conditions.uvIndex[1]) * 2);
            }
        }

        // Visibility score
        if (conditions.visibility) {
            maxScore += 10;
            if (visibility >= conditions.visibility[0]) {
                score += 10;
            } else {
                score += Math.max(0, 10 - (conditions.visibility[0] - visibility) * 2);
            }
        }

        return maxScore > 0 ? Math.round((score / maxScore) * 100) : 75;
    };

    const getFilteredActivities = () => {
        let filtered = activities;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(activity =>
                activity.category === selectedCategory || activity.type === selectedCategory
            );
        }

        return filtered
            .map(activity => ({
                ...activity,
                suitability: calculateSuitability(activity)
            }))
            .sort((a, b) => b.suitability - a.suitability);
    };

    const getSuitabilityColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getSuitabilityBg = (score) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/30';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
        if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const categories = [
        { id: 'all', name: 'All Activities', icon: '🌟' },
        { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
        { id: 'indoor', name: 'Indoor', icon: '🏠' },
        { id: 'fitness', name: 'Fitness', icon: '💪' },
        { id: 'leisure', name: 'Leisure', icon: '😌' },
        { id: 'adventure', name: 'Adventure', icon: '⛰️' },
        { id: 'cultural', name: 'Cultural', icon: '🎭' }
    ];

    const filteredActivities = getFilteredActivities();
    const topRecommendations = filteredActivities.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Sun className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Activity Suggestions</h2>
                        <p className="text-gray-400">Perfect activities for current weather</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Weather Summary */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{location || 'Current Location'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Updated 5 minutes ago</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-gray-400">Temperature</div>
                        <div className="text-white font-semibold">{currentWeather.temperature}°C</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400">Rain Chance</div>
                        <div className="text-white font-semibold">{currentWeather.precipitation}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400">Wind</div>
                        <div className="text-white font-semibold">{currentWeather.windSpeed} m/s</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400">UV Index</div>
                        <div className="text-white font-semibold">{currentWeather.uvIndex}</div>
                    </div>
                </div>
            </div>

            {/* Top Recommendations */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Top Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topRecommendations.map((activity, index) => (
                        <div key={activity.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{activity.icon}</span>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSuitabilityBg(activity.suitability)}`}>
                                    {activity.suitability}% match
                                </div>
                            </div>
                            <h4 className="font-semibold text-white mb-1">{activity.name}</h4>
                            <p className="text-xs text-gray-300 mb-2">{activity.description}</p>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{activity.duration}</span>
                                <span>{activity.groupSize} people</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                            selectedCategory === category.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        <span>{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                    </button>
                ))}
            </div>

            {/* Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map(activity => (
                    <div
                        key={activity.id}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{activity.icon}</span>
                                <div>
                                    <h3 className="font-bold text-white">{activity.name}</h3>
                                    <p className="text-sm text-gray-400 capitalize">{activity.category}</p>
                                </div>
                            </div>
                            <div className={`text-right ${getSuitabilityColor(activity.suitability)}`}>
                                <div className="font-bold text-lg">{activity.suitability}%</div>
                                <div className="text-xs text-gray-400">match</div>
                            </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                            {activity.description}
                        </p>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span className="text-gray-300">{activity.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-400" />
                                    <span className="text-gray-300">{activity.groupSize}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm text-white font-medium">{activity.rating}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    activity.type === 'outdoor' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                  {activity.type}
                </span>
                            </div>

                            <div className="border-t border-white/10 pt-3">
                                <div className="text-xs text-gray-400 mb-2">Tips:</div>
                                <div className="flex flex-wrap gap-1">
                                    {activity.tips.slice(0, 2).map((tip, index) => (
                                        <span key={index} className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">
                      {tip}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-400">
                Showing {filteredActivities.length} activities • Recommendations update with weather changes
            </div>
        </div>
    );
};

export default ActivitySuggestions;