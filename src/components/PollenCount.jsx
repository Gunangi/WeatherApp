import React, { useState, useEffect } from 'react';
import { Flower2, AlertTriangle, TrendingUp, TrendingDown, Wind, Calendar } from 'lucide-react';

const PollenCount = ({ location, weatherData }) => {
    const [pollenData, setPollenData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPollen, setSelectedPollen] = useState('all');

    // Mock pollen data - replace with actual API call
    useEffect(() => {
        const fetchPollenData = async () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setPollenData({
                    overall: 65,
                    level: 'High',
                    types: {
                        tree: { level: 78, name: 'Tree Pollen', trend: 'up', peak: 'March-May' },
                        grass: { level: 45, name: 'Grass Pollen', trend: 'stable', peak: 'May-July' },
                        weed: { level: 32, name: 'Weed Pollen', trend: 'down', peak: 'August-October' },
                        mold: { level: 28, name: 'Mold Spores', trend: 'up', peak: 'Fall-Spring' }
                    },
                    forecast: [
                        { day: 'Today', tree: 78, grass: 45, weed: 32, mold: 28 },
                        { day: 'Tomorrow', tree: 82, grass: 50, weed: 28, mold: 25 },
                        { day: 'Day 3', tree: 75, grass: 55, weed: 25, mold: 30 },
                        { day: 'Day 4', tree: 70, grass: 48, weed: 30, mold: 32 },
                        { day: 'Day 5', tree: 68, grass: 42, weed: 35, mold: 35 }
                    ],
                    recommendations: [
                        'Keep windows closed during high pollen days',
                        'Take allergy medication before going outside',
                        'Shower and change clothes after outdoor activities',
                        'Use air purifiers indoors',
                        'Monitor daily pollen forecasts'
                    ]
                });
                setLoading(false);
            }, 1000);
        };

        if (location) {
            fetchPollenData();
        }
    }, [location]);

    const getPollenLevel = (count) => {
        if (count <= 30) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500/20', bgGradient: 'from-green-500/20' };
        if (count <= 60) return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/20', bgGradient: 'from-yellow-500/20' };
        if (count <= 90) return { level: 'High', color: 'text-orange-500', bg: 'bg-orange-500/20', bgGradient: 'from-orange-500/20' };
        return { level: 'Very High', color: 'text-red-500', bg: 'bg-red-500/20', bgGradient: 'from-red-500/20' };
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="text-red-400" size={16} />;
            case 'down':
                return <TrendingDown className="text-green-400" size={16} />;
            default:
                return <div className="w-4 h-4 rounded-full bg-yellow-400"></div>;
        }
    };

    const getPollenColor = (type) => {
        const colors = {
            tree: 'bg-green-500',
            grass: 'bg-yellow-500',
            weed: 'bg-orange-500',
            mold: 'bg-purple-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                <div className="flex items-center space-x-2 mb-6">
                    <Flower2 className="text-pink-400 animate-pulse" size={24} />
                    <div className="h-6 bg-white/20 rounded w-32"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-20 bg-white/20 rounded"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-white/20 rounded"></div>
                        <div className="h-16 bg-white/20 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!pollenData) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                    <Flower2 className="text-pink-400" size={24} />
                    <h2 className="text-xl font-bold">Pollen Count</h2>
                </div>
                <p className="text-white/70">Pollen data not available for this location.</p>
            </div>
        );
    }

    const overallLevel = getPollenLevel(pollenData.overall);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
                <Flower2 className="text-pink-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Pollen Count</h2>
            </div>

            {/* Overall Pollen Level */}
            <div className={`bg-gradient-to-br ${overallLevel.bgGradient} to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Overall Pollen Level</h3>
                        <div className="flex items-center space-x-3">
                            <div className={`text-4xl font-bold ${overallLevel.color}`}>
                                {pollenData.overall}
                            </div>
                            <div>
                                <div className={`text-lg font-semibold ${overallLevel.color}`}>
                                    {overallLevel.level}
                                </div>
                                <div className="text-sm text-white/70">AQI Scale</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <AlertTriangle className={overallLevel.color.replace('text-', 'text-')} size={32} />
                        <div className="text-xs text-white/60 mt-1">Alert Level</div>
                    </div>
                </div>

                {/* Weather Impact */}
                <div className="flex items-center space-x-2 text-sm text-white/70">
                    <Wind size={16} />
                    <span>
            Wind: {weatherData?.wind?.speed || 0} m/s -
                        {weatherData?.wind?.speed > 5 ? ' High dispersal' : ' Low dispersal'}
          </span>
                </div>
            </div>

            {/* Pollen Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(pollenData.types).map(([type, data]) => {
                    const level = getPollenLevel(data.level);
                    return (
                        <div
                            key={type}
                            className={`bg-gradient-to-br ${level.bgGradient} to-gray-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${getPollenColor(type)}`}></div>
                                    <h4 className="font-semibold text-white">{data.name}</h4>
                                </div>
                                {getTrendIcon(data.trend)}
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className={`text-2xl font-bold ${level.color}`}>
                                        {data.level}
                                    </div>
                                    <div className={`text-sm ${level.color}`}>
                                        {level.level}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/60 mb-1">Peak Season</div>
                                    <div className="text-xs text-white/80">{data.peak}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">5-Day Pollen Forecast</h3>
                </div>

                <div className="space-y-3">
                    {pollenData.forecast.map((day, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <div className="font-medium text-white w-20">
                                {day.day}
                            </div>

                            <div className="flex space-x-4 flex-1 justify-end">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-white/80">Tree: {day.tree}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm text-white/80">Grass: {day.grass}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <span className="text-sm text-white/80">Weed: {day.weed}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-sm text-white/80">Mold: {day.mold}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Allergy Recommendations</h3>
                <div className="space-y-3">
                    {pollenData.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                            <p className="text-white/80 text-sm">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PollenCount;