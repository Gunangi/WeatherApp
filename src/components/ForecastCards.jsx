// src/components/ForecastCards.jsx

import React from 'react';

const ForecastCards = ({ forecastData, unit }) => {
    if (!forecastData) return null;

    // OpenWeatherMap provides forecast data every 3 hours. We need to process it to get a daily forecast.
    // We'll pick the forecast for midday (12:00) each day.
    const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

    const getDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">5-Day Forecast</h3>
            <div className="space-y-4">
                {dailyForecasts.map((day, index) => {
                    const temp = unit === 'celsius' ? day.main.temp : (day.main.temp * 9/5) + 32;
                    const tempUnit = unit === 'celsius' ? '°C' : '°F';

                    return (
                        <div key={index} className="flex items-center justify-between">
                            <p className="w-1/4 text-gray-600 dark:text-gray-300">{getDayOfWeek(day.dt_txt)}</p>
                            <img
                                src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                                alt={day.weather[0].description}
                                className="w-10 h-10"
                            />
                            <p className="w-1/4 text-right text-gray-800 dark:text-gray-200 font-medium">
                                {Math.round(temp)}{tempUnit}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ForecastCards;