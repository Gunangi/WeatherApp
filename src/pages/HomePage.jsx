// src/pages/HomePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import Forecast from '../components/Forecast';
import AirPollutionDisplay from '../components/AirPollutionDisplay';
import { getCurrentWeather, getForecast, getAirPollution } from '../api/weatherApi';
import { AppContext } from '../context/AppContext';
import { MapPin } from 'lucide-react';

// Add this to the top of HomePage.jsx after imports
console.log('HomePage component loaded');

const HomePage = () => {
    const [city, setCity] = useState('Nagpur'); // Default city
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [airPollutionData, setAirPollutionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { unit } = useContext(AppContext);

    const fetchWeatherData = async (selectedCity) => {
        setLoading(true);
        setError(null);
        try {
            const weatherRes = await getCurrentWeather(selectedCity);
            const forecastRes = await getForecast(selectedCity);
            const { lat, lon } = weatherRes.data.coord;
            const airPollutionRes = await getAirPollution(lat, lon);

            setWeatherData(weatherRes.data);
            setForecastData(forecastRes.data);
            setAirPollutionData(airPollutionRes.data);
        } catch (err) {
            setError('Could not fetch weather data. Please check the city name and try again.');
            setWeatherData(null);
            setForecastData(null);
            setAirPollutionData(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch weather for the default or searched city
    useEffect(() => {
        fetchWeatherData(city);
    }, [city]); // Dependency on city

    // Fetch weather based on geolocation on initial load
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // This part is more complex as OpenWeatherMap API needs a city name for current/forecast
                // For now, we will stick to the default city on load.
                // A reverse geocoding API would be needed to get city from coords.
                console.log('User location:', position.coords);
            },
            () => {
                console.log('Geolocation permission denied. Using default location.');
            }
        );
    }, []); // Empty dependency array means this runs once on mount

    // Add this in the HomePage component before the return statement
    console.log('HomePage render - loading:', loading, 'error:', error, 'weatherData:', !!weatherData);

    return (
        <div className="container mx-auto p-4">
            <SearchBar onSearch={setCity} />

            {loading && <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Loading weather data...</p>}

            {error && <p className="text-center text-red-500 dark:text-red-400 mt-8">{error}</p>}

            {!loading && !error && weatherData && (
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-3">
                        <WeatherCard weatherData={weatherData} unit={unit} />
                    </div>
                    <div className="lg:col-span-2">
                        <Forecast forecastData={forecastData} unit={unit} />
                    </div>
                    <div>
                        <AirPollutionDisplay airPollutionData={airPollutionData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;