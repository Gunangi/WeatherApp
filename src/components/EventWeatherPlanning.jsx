import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Thermometer, Cloud, Droplets, Wind, AlertTriangle } from 'lucide-react';

const EventWeatherPlanning = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        name: '',
        location: '',
        date: '',
        time: '',
        type: 'outdoor'
    });
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(false);

    const eventTypes = [
        { value: 'outdoor', label: 'Outdoor Event', icon: '🌳' },
        { value: 'sports', label: 'Sports', icon: '⚽' },
        { value: 'wedding', label: 'Wedding', icon: '💒' },
        { value: 'festival', label: 'Festival', icon: '🎉' },
        { value: 'concert', label: 'Concert', icon: '🎵' },
        { value: 'picnic', label: 'Picnic', icon: '🧺' }
    ];

    const addEvent = async () => {
        if (!newEvent.name || !newEvent.location || !newEvent.date) return;

        const event = {
            id: Date.now(),
            ...newEvent,
            dateTime: new Date(`${newEvent.date}T${newEvent.time || '12:00'}`)
        };

        setEvents([...events, event]);
        await fetchWeatherForEvent(event);
        setNewEvent({ name: '', location: '', date: '', time: '', type: 'outdoor' });
    };

    const fetchWeatherForEvent = async (event) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${event.location}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
            );
            const data = await response.json();

            // Find forecast closest to event date
            const eventDate = new Date(event.dateTime);
            const forecast = data.list.find(item => {
                const forecastDate = new Date(item.dt * 1000);
                return forecastDate.toDateString() === eventDate.toDateString();
            }) || data.list[0];

            setWeatherData(prev => ({
                ...prev,
                [event.id]: {
                    ...forecast,
                    location: data.city.name
                }
            }));
        } catch (error) {
            console.error('Error fetching weather:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherRecommendation = (weather, eventType) => {
        const temp = weather?.main?.temp;
        const condition = weather?.weather?.[0]?.main?.toLowerCase();
        const windSpeed = weather?.wind?.speed;
        const humidity = weather?.main?.humidity;

        let recommendations = [];
        let alerts = [];

        // Temperature recommendations
        if (temp < 5) {
            recommendations.push('Heavy winter clothing recommended');
            alerts.push('Very cold conditions - consider indoor alternatives');
        } else if (temp < 15) {
            recommendations.push('Warm clothing and layers recommended');
        } else if (temp > 35) {
            recommendations.push('Light clothing, sun protection essential');
            alerts.push('Extreme heat - ensure adequate hydration and shade');
        }

        // Weather condition recommendations
        if (condition.includes('rain')) {
            recommendations.push('Bring umbrellas and waterproof gear');
            if (eventType === 'outdoor') {
                alerts.push('Rain expected - consider backup indoor venue');
            }
        }

        if (condition.includes('snow')) {
            recommendations.push('Winter gear and non-slip footwear');
            alerts.push('Snow conditions - check accessibility and safety');
        }

        if (windSpeed > 10) {
            recommendations.push('Secure any loose decorations or equipment');
            if (eventType === 'outdoor') {
                alerts.push('High winds - consider wind-resistant setup');
            }
        }

        if (humidity > 80) {
            recommendations.push('Consider ventilation and cooling options');
        }

        return { recommendations, alerts };
    };

    const removeEvent = (eventId) => {
        setEvents(events.filter(e => e.id !== eventId));
        setWeatherData(prev => {
            const newData = { ...prev };
            delete newData[eventId];
            return newData;
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Event Weather Planning
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Plan your events with accurate weather forecasts and recommendations
                </p>
            </div>

            {/* Add New Event Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Add New Event
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Name
                        </label>
                        <input
                            type="text"
                            value={newEvent.name}
                            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter event name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="City name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Type
                        </label>
                        <select
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {eventTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Time (Optional)
                        </label>
                        <input
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={addEvent}
                            disabled={!newEvent.name || !newEvent.location || !newEvent.date}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            Add Event
                        </button>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {events.map(event => {
                    const weather = weatherData[event.id];
                    const { recommendations, alerts } = weather ? getWeatherRecommendation(weather, event.type) : { recommendations: [], alerts: [] };

                    return (
                        <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {event.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mt-2">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {event.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.dateTime).toLocaleDateString()}
                                        </div>
                                        {event.time && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {event.time}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeEvent(event.id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                >
                                    Remove
                                </button>
                            </div>

                            {weather && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Weather Information */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                            Weather Forecast
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-700 dark:text-gray-300">
                          {Math.round(weather.main.temp)}°C
                        </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Cloud className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-700 dark:text-gray-300">
                          {weather.weather[0].description}
                        </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Droplets className="w-5 h-5 text-blue-500" />
                                                <span className="text-gray-700 dark:text-gray-300">
                          {weather.main.humidity}%
                        </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Wind className="w-5 h-5 text-green-500" />
                                                <span className="text-gray-700 dark:text-gray-300">
                          {weather.wind.speed} m/s
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations & Alerts */}
                                    <div>
                                        {alerts.length > 0 && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    <h5 className="font-semibold text-red-800 dark:text-red-300">
                                                        Weather Alerts
                                                    </h5>
                                                </div>
                                                <ul className="space-y-1">
                                                    {alerts.map((alert, index) => (
                                                        <li key={index} className="text-red-700 dark:text-red-300 text-sm">
                                                            • {alert}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {recommendations.length > 0 && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                                    Recommendations
                                                </h5>
                                                <ul className="space-y-1">
                                                    {recommendations.map((rec, index) => (
                                                        <li key={index} className="text-blue-700 dark:text-blue-300 text-sm">
                                                            • {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {loading && !weather && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                    Loading weather data...
                  </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {events.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                            No Events Planned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Add your first event to get weather planning recommendations
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventWeatherPlanning;