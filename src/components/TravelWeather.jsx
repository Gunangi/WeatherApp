import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Plane, Plus, X, Thermometer, Cloud, Droplets, Wind, Sun, Moon } from 'lucide-react';

const TravelWeather = () => {
    const [trips, setTrips] = useState([]);
    const [newTrip, setNewTrip] = useState({
        name: '',
        destinations: [{ city: '', country: '', startDate: '', endDate: '' }],
        type: 'leisure'
    });
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(false);

    const tripTypes = [
        { value: 'leisure', label: 'Leisure', icon: '🏖️' },
        { value: 'business', label: 'Business', icon: '💼' },
        { value: 'adventure', label: 'Adventure', icon: '🏔️' },
        { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
        { value: 'solo', label: 'Solo Travel', icon: '🎒' }
    ];

    const addDestination = () => {
        setNewTrip({
            ...newTrip,
            destinations: [...newTrip.destinations, { city: '', country: '', startDate: '', endDate: '' }]
        });
    };

    const removeDestination = (index) => {
        if (newTrip.destinations.length > 1) {
            setNewTrip({
                ...newTrip,
                destinations: newTrip.destinations.filter((_, i) => i !== index)
            });
        }
    };

    const updateDestination = (index, field, value) => {
        const updatedDestinations = newTrip.destinations.map((dest, i) =>
            i === index ? { ...dest, [field]: value } : dest
        );
        setNewTrip({ ...newTrip, destinations: updatedDestinations });
    };

    const addTrip = async () => {
        if (!newTrip.name || !newTrip.destinations[0].city) return;

        const trip = {
            id: Date.now(),
            ...newTrip,
            createdAt: new Date()
        };

        setTrips([...trips, trip]);
        await fetchWeatherForTrip(trip);
        setNewTrip({
            name: '',
            destinations: [{ city: '', country: '', startDate: '', endDate: '' }],
            type: 'leisure'
        });
    };

    const fetchWeatherForTrip = async (trip) => {
        setLoading(true);
        try {
            const weatherPromises = trip.destinations.map(async (destination) => {
                const query = destination.country
                    ? `${destination.city},${destination.country}`
                    : destination.city;

                // Fetch current weather
                const currentResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
                );
                const currentData = await currentResponse.json();

                // Fetch forecast
                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
                );
                const forecastData = await forecastResponse.json();

                return {
                    destination: destination.city,
                    current: currentData,
                    forecast: forecastData.list.slice(0, 5), // Next 5 forecasts
                    startDate: destination.startDate,
                    endDate: destination.endDate
                };
            });

            const results = await Promise.all(weatherPromises);
            setWeatherData(prev => ({
                ...prev,
                [trip.id]: results
            }));
        } catch (error) {
            console.error('Error fetching weather for trip:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPackingRecommendations = (weatherData) => {
        if (!weatherData || !weatherData.current) return [];

        const temp = weatherData.current.main?.temp;
        const condition = weatherData.current.weather?.[0]?.main?.toLowerCase();
        const recommendations = [];

        // Temperature-based recommendations
        if (temp < 0) {
            recommendations.push('Heavy winter coat', 'Thermal underwear', 'Winter boots', 'Gloves and hat');
        } else if (temp < 10) {
            recommendations.push('Warm jacket', 'Long pants', 'Closed shoes', 'Light sweater');
        } else if (temp < 20) {
            recommendations.push('Light jacket', 'Jeans or pants', 'Comfortable shoes');
        } else if (temp < 30) {
            recommendations.push('T-shirts', 'Light pants or shorts', 'Comfortable walking shoes');
        } else {
            recommendations.push('Light clothing', 'Shorts', 'Sandals', 'Sun hat', 'Sunscreen');
        }

        // Weather condition recommendations
        if (condition?.includes('rain')) {
            recommendations.push('Umbrella', 'Waterproof jacket', 'Water-resistant shoes');
        }
        if (condition?.includes('snow')) {
            recommendations.push('Snow boots', 'Winter gear', 'Warm socks');
        }
        if (condition?.includes('sun') || condition?.includes('clear')) {
            recommendations.push('Sunglasses', 'Sunscreen', 'Hat');
        }

        return [...new Set(recommendations)]; // Remove duplicates
    };

    const getTravelTips = (tripType, weatherData) => {
        const tips = [];

        if (!weatherData || !weatherData.current) return tips;

        const temp = weatherData.current.main?.temp;
        const condition = weatherData.current.weather?.[0]?.main?.toLowerCase();

        // Trip type specific tips
        if (tripType === 'adventure') {
            tips.push('Check trail conditions before hiking');
            if (temp < 5) tips.push('Consider postponing outdoor activities');
        }

        if (tripType === 'family') {
            tips.push('Pack extra clothes for children');
            if (condition?.includes('rain')) tips.push('Plan indoor activities as backup');
        }

        if (tripType === 'business') {
            tips.push('Pack formal weather-appropriate attire');
            if (condition?.includes('rain')) tips.push('Allow extra travel time');
        }

        // General weather tips
        if (temp > 35) {
            tips.push('Stay hydrated and avoid prolonged sun exposure');
        }
        if (temp < -10) {
            tips.push('Check flight schedules for weather delays');
        }

        return tips;
    };

    const removeTrip = (tripId) => {
        setTrips(trips.filter(t => t.id !== tripId));
        setWeatherData(prev => {
            const newData = { ...prev };
            delete newData[tripId];
            return newData;
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Travel Weather Planning
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Plan your trips with detailed weather forecasts for multiple destinations
                </p>
            </div>

            {/* Add New Trip Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Plan New Trip
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Trip Name
                        </label>
                        <input
                            type="text"
                            value={newTrip.name}
                            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Europe Summer 2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Trip Type
                        </label>
                        <select
                            value={newTrip.type}
                            onChange={(e) => setNewTrip({ ...newTrip, type: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {tripTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Destinations */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Destinations</h3>
                        <button
                            onClick={addDestination}
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Destination
                        </button>
                    </div>

                    {newTrip.destinations.map((destination, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={destination.city}
                                    onChange={(e) => updateDestination(index, 'city', e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                    placeholder="City name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={destination.country}
                                    onChange={(e) => updateDestination(index, 'country', e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                    placeholder="Country"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={destination.startDate}
                                    onChange={(e) => updateDestination(index, 'startDate', e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={destination.endDate}
                                    onChange={(e) => updateDestination(index, 'endDate', e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex items-end">
                                {index > 0 && (
                                    <button
                                        onClick={() => removeDestination(index)}
                                        className="p-2 text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addTrip}
                    disabled={!newTrip.name || !newTrip.destinations[0].city}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    <Plane className="w-4 h-4 inline mr-2" />
                    Create Trip
                </button>
            </div>

            {/* Trips List */}
            <div className="space-y-8">
                {trips.map(trip => {
                    const tripWeather = weatherData[trip.id];

                    return (
                        <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {trip.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {tripTypes.find(t => t.value === trip.type)?.icon} {tripTypes.find(t => t.value === trip.type)?.label}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeTrip(trip.id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                >
                                    Remove Trip
                                </button>
                            </div>

                            {/* Destinations Weather */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {trip.destinations.map((destination, index) => {
                                    const destWeather = tripWeather?.[index];
                                    const packingItems = getPackingRecommendations(destWeather);
                                    const travelTips = getTravelTips(trip.type, destWeather);

                                    return (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="w-5 h-5 text-blue-500" />
                                                <h4 className="font-semibold text-gray-800 dark:text-white">
                                                    {destination.city}
                                                    {destination.country && `, ${destination.country}`}
                                                </h4>
                                            </div>

                                            {destination.startDate && destination.endDate && (
                                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(destination.startDate).toLocaleDateString()} - {new Date(destination.endDate).toLocaleDateString()}
                                                </div>
                                            )}

                                            {destWeather ? (
                                                <div className="space-y-4">
                                                    {/* Current Weather */}
                                                    <div className="bg-white dark:bg-gray-600 rounded p-3">
                                                        <h5 className="font-medium text-gray-800 dark:text-white mb-2">Current Weather</h5>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <Thermometer className="w-4 h-4 text-orange-500" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                  {Math.round(destWeather.current.main?.temp || 0)}°C
                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Cloud className="w-4 h-4 text-gray-500" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                  {destWeather.current.weather?.[0]?.description || 'N/A'}
                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Droplets className="w-4 h-4 text-blue-500" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                  {destWeather.current.main?.humidity || 0}%
                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Wind className="w-4 h-4 text-green-500" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                  {destWeather.current.wind?.speed || 0} m/s
                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Packing Recommendations */}
                                                    {packingItems.length > 0 && (
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                                                            <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                                                Packing Essentials
                                                            </h5>
                                                            <div className="flex flex-wrap gap-1">
                                                                {packingItems.slice(0, 6).map((item, i) => (
                                                                    <span key={i} className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    {item}
                                  </span>
                                                                ))}
                                                                {packingItems.length > 6 && (
                                                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                    +{packingItems.length - 6} more
                                  </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Travel Tips */}
                                                    {travelTips.length > 0 && (
                                                        <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                                                            <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">
                                                                Travel Tips
                                                            </h5>
                                                            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                                                {travelTips.map((tip, i) => (
                                                                    <li key={i}>• {tip}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Loading...</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {trips.length === 0 && (
                    <div className="text-center py-12">
                        <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                            No Trips Planned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Create your first trip to get weather forecasts and travel recommendations
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelWeather;