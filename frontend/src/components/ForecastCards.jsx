import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, ChevronRight, Clock } from 'lucide-react';

const ForecastCards = ({ forecastData, isDark = false }) => {
    const [activeTab, setActiveTab] = useState('daily');

    // Mock data if no forecastData provided
    const data = forecastData || {
        daily: [
            { day: 'Today', condition: 'Broken Clouds', high: 35, low: 28, icon: 'cloud' },
            { day: 'Tomorrow', condition: 'Partly Cloudy', high: 34, low: 27, icon: 'sun' },
            { day: 'Saturday', condition: 'Light Rain', high: 30, low: 24, icon: 'rain' },
            { day: 'Sunday', condition: 'Sunny', high: 36, low: 29, icon: 'sun' },
            { day: 'Monday', condition: 'Thunderstorms', high: 32, low: 25, icon: 'rain' }
        ],
        hourly: [
            { time: '2 PM', temp: 33, condition: 'Cloudy', icon: 'cloud' },
            { time: '3 PM', temp: 35, condition: 'Partly Cloudy', icon: 'sun' },
            { time: '4 PM', temp: 34, condition: 'Cloudy', icon: 'cloud' },
            { time: '5 PM', temp: 32, condition: 'Light Rain', icon: 'rain' },
            { time: '6 PM', temp: 30, condition: 'Rain', icon: 'rain' },
            { time: '7 PM', temp: 28, condition: 'Heavy Rain', icon: 'rain' },
            { time: '8 PM', temp: 27, condition: 'Cloudy', icon: 'cloud' },
            { time: '9 PM', temp: 26, condition: 'Clear', icon: 'sun' }
        ]
    };

    const getWeatherIcon = (iconType, size = 32) => {
        const iconProps = {
            size,
            className: `${isDark ? 'text-gray-300' : 'text-gray-600'} drop-shadow-sm`
        };

        switch (iconType) {
            case 'cloud': return <Cloud {...iconProps} />;
            case 'rain': return <CloudRain {...iconProps} />;
            case 'snow': return <CloudSnow {...iconProps} />;
            case 'sun': return <Sun {...iconProps} />;
            default: return <Sun {...iconProps} />;
        }
    };

    const TabButton = ({ id, label, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive
                    ? isDark
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'bg-white/40 text-gray-800 shadow-lg'
                    : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className={`rounded-3xl p-6 backdrop-blur-md border transition-all duration-300 ${
            isDark
                ? 'bg-gray-900/30 border-gray-700/50'
                : 'bg-white/20 border-white/30'
        } shadow-2xl`}>

            {/* Header with Tabs */}
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Weather Forecast
                </h2>
                <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white/20'}`}>
                    <TabButton
                        id="daily"
                        label="5-Day"
                        isActive={activeTab === 'daily'}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="hourly"
                        label="Hourly"
                        isActive={activeTab === 'hourly'}
                        onClick={setActiveTab}
                    />
                </div>
            </div>

            {/* Daily Forecast */}
            {activeTab === 'daily' && (
                <div className="space-y-3">
                    {data.daily.map((day, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02] ${
                                isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/30 border-white/20 hover:bg-white/40'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-16 text-left">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {day.day}
                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getWeatherIcon(day.icon)}
                                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {day.condition}
                  </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {day.high}°
                  </span>
                                    <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day.low}°
                  </span>
                                </div>
                                <ChevronRight
                                    size={16}
                                    className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hourly Forecast */}
            {activeTab === 'hourly' && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Next 24 hours
            </span>
                    </div>

                    {data.hourly.map((hour, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02] ${
                                isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/30 border-white/20 hover:bg-white/40'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-16 text-left">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {hour.time}
                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getWeatherIcon(hour.icon, 24)}
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {hour.condition}
                  </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {hour.temp}°
                </span>
                                <ChevronRight
                                    size={16}
                                    className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ForecastCards;