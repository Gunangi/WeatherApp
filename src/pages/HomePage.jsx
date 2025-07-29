import React, { useState, useEffect, useContext } from 'react';
import SearchBar from '../components/Enhanced_SearchBar';
import WeatherCard from '../components/WeatherCard';
import Forecast from '../components/Forecast';
import AirPollutionDisplay from '../components/AirPollutionDisplay';
import { getCurrentWeather, getForecast, getAirPollution } from '../api/weatherApi';
import { AppContext } from '../context/AppContext';

const HomePage = () => {
    const [city, setCity] = useState('Nagpur');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [airPollutionData, setAirPollutionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { unit } = useContext(AppContext);

    console.log('HomePage loaded - city:', city, 'loading:', loading, 'error:', error);

    const fetchWeatherData = async (selectedCity) => {
        console.log('Fetching weather for:', selectedCity);
        setLoading(true);
        setError(null);

        try {
            const weatherRes = await getCurrentWeather(selectedCity);
            console.log('Weather response:', weatherRes);

            const forecastRes = await getForecast(selectedCity);
            const { lat, lon } = weatherRes.data.coord;
            const airPollutionRes = await getAirPollution(lat, lon);

            setWeatherData(weatherRes.data);
            setForecastData(forecastRes.data);
            setAirPollutionData(airPollutionRes.data);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('Could not fetch weather data. Please check the city name and try again.');
            setWeatherData(null);
            setForecastData(null);
            setAirPollutionData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData(city);
    }, [city]);

    return (
        <div className="container mx-auto p-4">
            <SearchBar onSearch={setCity} />

            {loading && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    Loading weather data...
                </p>
            )}

            {error && (
                <p className="text-center text-red-500 dark:text-red-400 mt-8">
                    {error}
                </p>
            )}

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