import React, { useState, useEffect } from 'react';
import { Search, MapPin, Settings, Moon, Sun, Wind, Eye, Droplets, Gauge, Sunrise, Sunset, Thermometer } from 'lucide-react';
import './App.css';

// Utility functions
const weatherAPI = {
    API_KEY: '38b64d931ea106a38a71f9ec1643ba9d', // Replace with actual API key
    BASE_URL: 'https://api.openweathermap.org/data/2.5',

    async getCurrentWeather(lat, lon) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    },

    async getForecast(lat, lon) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    },

    async getWeatherByCity(city) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/weather?q=${city}&appid=${this.API_KEY}&units=metric`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather by city:', error);
            throw error;
        }
    }
};

const geolocation = {
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }
};

const dateUtils = {
    formatTime(timestamp, timezone = 0) {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    },

    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
};

// Weather Display Component
const WeatherDisplay = ({ weather, isDark }) => {
    if (!weather) return null;

    const getWeatherIcon = (condition) => {
        const iconMap = {
            'clear sky': '☀️',
            'few clouds': '🌤️',
            'scattered clouds': '⛅',
            'broken clouds': '☁️',
            'shower rain': '🌦️',
            'rain': '🌧️',
            'thunderstorm': '⛈️',
            'snow': '🌨️',
            'mist': '🌫️'
        };
        return iconMap[condition.toLowerCase()] || '🌤️';
    };

    return (
        <div className="weather-main">
            <div className="location">
                <MapPin size={16} />
                <span>{weather.name}, {weather.sys.country}</span>
            </div>

            <div className="current-weather">
                <div className="weather-icon">
                    {getWeatherIcon(weather.weather[0].description)}
                </div>
                <div className="temperature">
                    <span className="temp-main">{Math.round(weather.main.temp)}°C</span>
                    <span className="temp-feels">Feels like {Math.round(weather.main.feels_like)}°C</span>
                </div>
            </div>

            <div className="weather-description">
                {weather.weather[0].description.split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
            </div>

            <div className="weather-metrics">
                <div className="metric">
                    <Droplets size={20} />
                    <span>Humidity</span>
                    <span>{weather.main.humidity}%</span>
                </div>
                <div className="metric">
                    <Wind size={20} />
                    <span>Wind Speed</span>
                    <span>{weather.wind.speed} m/s</span>
                </div>
                <div className="metric">
                    <Gauge size={20} />
                    <span>Pressure</span>
                    <span>{weather.main.pressure} hPa</span>
                </div>
                <div className="metric">
                    <Eye size={20} />
                    <span>Visibility</span>
                    <span>{(weather.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div className="metric">
                    <Sunrise size={20} />
                    <span>Sunrise</span>
                    <span>{dateUtils.formatTime(weather.sys.sunrise, weather.timezone)}</span>
                </div>
                <div className="metric">
                    <Sunset size={20} />
                    <span>Sunset</span>
                    <span>{dateUtils.formatTime(weather.sys.sunset, weather.timezone)}</span>
                </div>
            </div>
        </div>
    );
};

// Search Bar Component
const SearchBar = ({ onSearch, isDark }) => {
    const [query, setQuery] = useState('');

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            onSearch(query.trim());
            setQuery('');
        }
    };

    const handleSearchClick = () => {
        if (query.trim()) {
            onSearch(query.trim());
            setQuery('');
        }
    };

    return (
        <div className="search-bar">
            <Search size={20} onClick={handleSearchClick} style={{ cursor: 'pointer' }} />
            <input
                type="text"
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
            />
        </div>
    );
};

// Main App Component
const App = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDark, setIsDark] = useState(true);
    const [currentTime, setCurrentTime] = useState(dateUtils.getCurrentTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dateUtils.getCurrentTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadCurrentLocationWeather();
    }, []);

    const loadCurrentLocationWeather = async () => {
        try {
            setLoading(true);
            setError(null);

            const position = await geolocation.getCurrentPosition();
            const weatherData = await weatherAPI.getCurrentWeather(position.lat, position.lon);
            const forecastData = await weatherAPI.getForecast(position.lat, position.lon);

            setWeather(weatherData);
            setForecast(forecastData);
        } catch (err) {
            setError('Unable to get weather data. Please check your location settings.');
            console.error('Weather loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCitySearch = async (city) => {
        try {
            setLoading(true);
            setError(null);

            const weatherData = await weatherAPI.getWeatherByCity(city);
            setWeather(weatherData);

            // Get forecast for the searched city
            const forecastData = await weatherAPI.getForecast(weatherData.coord.lat, weatherData.coord.lon);
            setForecast(forecastData);
        } catch (err) {
            setError(`Unable to find weather data for "${city}". Please try another city.`);
            console.error('City search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <div className={`app ${isDark ? 'dark' : 'light'}`}>
            <div className="container">
                <header className="app-header">
                    <div className="header-left">
                        <h1>Weather App</h1>
                        <span className="current-time">{currentTime}</span>
                    </div>
                    <div className="header-right">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="settings-btn">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <SearchBar onSearch={handleCitySearch} isDark={isDark} />

                {loading && (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>Loading weather data...</p>
                    </div>
                )}

                {error && (
                    <div className="error">
                        <p>{error}</p>
                        <button onClick={loadCurrentLocationWeather}>Try Again</button>
                    </div>
                )}

                {weather && !loading && (
                    <div className="weather-content">
                        <WeatherDisplay weather={weather} isDark={isDark} />

                        {forecast && forecast.list && (
                            <div className="forecast-section">
                                <h3>5-Day Forecast</h3>
                                <div className="forecast-cards">
                                    {forecast.list
                                        .filter((_, index) => index % 8 === 0)
                                        .slice(0, 5)
                                        .map((item, index) => (
                                            <div key={index} className="forecast-card">
                                                <div className="forecast-day">
                                                    {index === 0 ? 'Today' : dateUtils.formatDate(item.dt)}
                                                </div>
                                                <div className="forecast-icon">
                                                    {item.weather[0].main === 'Rain' ? '🌧️' :
                                                        item.weather[0].main === 'Clouds' ? '☁️' :
                                                            item.weather[0].main === 'Clear' ? '☀️' : '🌤️'}
                                                </div>
                                                <div className="forecast-temps">
                                                    <span className="high">{Math.round(item.main.temp_max)}°</span>
                                                    <span className="low">{Math.round(item.main.temp_min)}°</span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;