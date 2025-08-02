import React, { useState, useEffect } from 'react';
import {
    Search, MapPin, Settings, Moon, Sun, Wind, Eye, Droplets, Gauge,
    Sunrise, Sunset, Thermometer, AlertTriangle, Navigation, Clock,
    Heart, Star, Bell, TrendingUp, Umbrella, Shirt, Calendar, Share2
} from 'lucide-react';

// Enhanced Weather API with more endpoints
const weatherAPI = {
    API_KEY: '38b64d931ea106a38a71f9ec1643ba9d', // Replace with actual API key
    BASE_URL: 'https://api.openweathermap.org/data/2.5',

    async getCurrentWeather(lat, lon) {
        // Simulated API response for demo
        return {
            name: "Delhi",
            sys: { country: "IN", sunrise: 1691200800, sunset: 1691247600 },
            main: {
                temp: 31,
                feels_like: 38,
                humidity: 82,
                pressure: 1002
            },
            weather: [{
                main: "Clouds",
                description: "broken clouds",
                icon: "04d"
            }],
            wind: { speed: 2.2 },
            visibility: 10000,
            coord: { lat: lat, lon: lon },
            timezone: 19800
        };
    },

    async getForecast(lat, lon) {
        // Simulated 5-day forecast
        const today = new Date();
        const forecast = [];

        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            forecast.push({
                dt: Math.floor(date.getTime() / 1000),
                main: {
                    temp_max: 32 - i,
                    temp_min: 28 - i,
                    temp: 30 - i
                },
                weather: [{
                    main: i % 2 === 0 ? "Rain" : "Clouds",
                    description: i % 2 === 0 ? "light rain" : "broken clouds"
                }]
            });
        }

        return { list: forecast };
    },

    async getHourlyForecast(lat, lon) {
        // Simulated hourly forecast
        const hourly = [];
        const now = new Date();

        for (let i = 0; i < 24; i++) {
            const time = new Date(now);
            time.setHours(now.getHours() + i);

            hourly.push({
                dt: Math.floor(time.getTime() / 1000),
                main: { temp: 30 + Math.sin(i * 0.3) * 5 },
                weather: [{
                    main: i % 4 === 0 ? "Rain" : "Clear",
                    description: i % 4 === 0 ? "light rain" : "clear sky"
                }],
                pop: i % 4 === 0 ? 0.8 : 0.1
            });
        }

        return { list: hourly };
    },

    async getAirQuality(lat, lon) {
        // Simulated air quality data
        return {
            coord: { lat, lon },
            list: [{
                main: { aqi: 3 },
                components: {
                    co: 233.4,
                    no: 0.01,
                    no2: 13.4,
                    o3: 54.3,
                    so2: 8.2,
                    pm2_5: 15.3,
                    pm10: 20.1,
                    nh3: 4.6
                }
            }]
        };
    },

    async getWeatherAlerts(lat, lon) {
        // Simulated weather alerts
        return {
            alerts: [
                {
                    sender_name: "India Meteorological Department",
                    event: "Heat Wave Warning",
                    start: Math.floor(Date.now() / 1000),
                    end: Math.floor(Date.now() / 1000) + 86400 * 2,
                    description: "Heat wave conditions are likely to prevail over Delhi and adjoining areas."
                }
            ]
        };
    }
};

// Enhanced App Component
const EnhancedWeatherApp = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDark, setIsDark] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [activeTab, setActiveTab] = useState('current');
    const [favorites, setFavorites] = useState(['Delhi', 'Mumbai', 'Bangalore']);
    const [tempUnit, setTempUnit] = useState('C');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadWeatherData();
    }, []);

    const loadWeatherData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Simulate geolocation
            const position = { lat: 28.6139, lon: 77.2090 }; // Delhi coordinates

            const [weatherData, forecastData, hourlyData, airQualityData, alertsData] = await Promise.all([
                weatherAPI.getCurrentWeather(position.lat, position.lon),
                weatherAPI.getForecast(position.lat, position.lon),
                weatherAPI.getHourlyForecast(position.lat, position.lon),
                weatherAPI.getAirQuality(position.lat, position.lon),
                weatherAPI.getWeatherAlerts(position.lat, position.lon)
            ]);

            setWeather(weatherData);
            setForecast(forecastData);
            setHourlyForecast(hourlyData);
            setAirQuality(airQualityData);
            setAlerts(alertsData);
        } catch (err) {
            setError('Unable to load weather data');
        } finally {
            setLoading(false);
        }
    };

    const convertTemp = (temp) => {
        if (tempUnit === 'F') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    };

    const getAQIColor = (aqi) => {
        const colors = {
            1: '#00E400', // Good
            2: '#FFFF00', // Fair
            3: '#FF7E00', // Moderate
            4: '#FF0000', // Poor
            5: '#8F3F97'  // Very Poor
        };
        return colors[aqi] || '#999';
    };

    const getAQILabel = (aqi) => {
        const labels = {
            1: 'Good',
            2: 'Fair',
            3: 'Moderate',
            4: 'Poor',
            5: 'Very Poor'
        };
        return labels[aqi] || 'Unknown';
    };

    const WeatherHeader = () => (
        <header className="flex justify-between items-center mb-8 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Weather App</h1>
                <span className="text-white/80 text-sm">{currentTime}</span>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                >
                    °{tempUnit}
                </button>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );

    const SearchBar = () => {
        const [query, setQuery] = useState('');

        return (
            <div className="flex items-center gap-4 p-4 mb-8 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full">
                <Search size={20} className="text-white/70" />
                <input
                    type="text"
                    placeholder="Search for a city..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                />
            </div>
        );
    };

    const TabNavigation = () => (
        <div className="flex gap-2 mb-8 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
            {[
                { id: 'current', label: 'Current', icon: Thermometer },
                { id: 'hourly', label: 'Hourly', icon: Clock },
                { id: 'forecast', label: '5-Day', icon: Calendar },
                { id: 'air', label: 'Air Quality', icon: Wind },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
            ].map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                            activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <Icon size={16} />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );

    const CurrentWeather = () => {
        if (!weather) return null;

        const getWeatherIcon = (condition) => {
            const iconMap = {
                'clear sky': '☀️',
                'few clouds': '🌤️',
                'scattered clouds': '⛅',
                'broken clouds': '☁️',
                'shower rain': '🌦️',
                'rain': '🌧️',
                'light rain': '🌦️',
                'thunderstorm': '⛈️',
                'snow': '🌨️',
                'mist': '🌫️'
            };
            return iconMap[condition.toLowerCase()] || '🌤️';
        };

        return (
            <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8">
                <div className="flex items-center gap-2 mb-6 text-white/80">
                    <MapPin size={16} />
                    <span>{weather.name}, {weather.sys.country}</span>
                </div>

                <div className="flex items-center gap-8 mb-8">
                    <div className="text-6xl">{getWeatherIcon(weather.weather[0].description)}</div>
                    <div>
                        <div className="text-5xl font-bold text-white mb-2">
                            {convertTemp(weather.main.temp)}°{tempUnit}
                        </div>
                        <div className="text-white/70 text-lg">
                            Feels like {convertTemp(weather.main.feels_like)}°{tempUnit}
                        </div>
                    </div>
                </div>

                <div className="text-white/90 text-xl mb-8 capitalize">
                    {weather.weather[0].description}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { icon: Droplets, label: 'Humidity', value: `${weather.main.humidity}%` },
                        { icon: Wind, label: 'Wind Speed', value: `${weather.wind.speed} m/s` },
                        { icon: Gauge, label: 'Pressure', value: `${weather.main.pressure} hPa` },
                        { icon: Eye, label: 'Visibility', value: `${(weather.visibility / 1000).toFixed(1)} km` },
                        { icon: Sunrise, label: 'Sunrise', value: new Date((weather.sys.sunrise + weather.timezone) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) },
                        { icon: Sunset, label: 'Sunset', value: new Date((weather.sys.sunset + weather.timezone) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }
                    ].map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <div key={index} className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl">
                                <Icon size={20} className="text-white/80" />
                                <div>
                                    <div className="text-white/70 text-sm">{metric.label}</div>
                                    <div className="text-white font-semibold">{metric.value}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const HourlyForecast = () => {
        if (!hourlyForecast) return null;

        return (
            <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">24-Hour Forecast</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {hourlyForecast.list.slice(0, 24).map((hour, index) => {
                        const time = new Date(hour.dt * 1000);
                        const isRain = hour.weather[0].main === 'Rain';

                        return (
                            <div key={index} className="flex-shrink-0 text-center p-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl min-w-[100px]">
                                <div className="text-white/70 text-sm mb-2">
                                    {time.getHours()}:00
                                </div>
                                <div className="text-2xl mb-2">
                                    {isRain ? '🌧️' : '☀️'}
                                </div>
                                <div className="text-white font-semibold mb-1">
                                    {convertTemp(hour.main.temp)}°
                                </div>
                                {isRain && (
                                    <div className="flex items-center justify-center gap-1 text-blue-300 text-xs">
                                        <Umbrella size={12} />
                                        <span>{Math.round(hour.pop * 100)}%</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const FiveDayForecast = () => {
        if (!forecast) return null;

        return (
            <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">5-Day Forecast</h3>
                <div className="grid gap-4">
                    {forecast.list.map((day, index) => {
                        const date = new Date(day.dt * 1000);
                        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        const isRain = day.weather[0].main === 'Rain';

                        return (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">{isRain ? '🌧️' : '☁️'}</div>
                                    <div>
                                        <div className="text-white font-semibold">{dayName}</div>
                                        <div className="text-white/70 text-sm capitalize">{day.weather[0].description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isRain && (
                                        <div className="flex items-center gap-1 text-blue-300">
                                            <Umbrella size={16} />
                                            <span className="text-sm">Rain</span>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <div className="text-white font-bold">{convertTemp(day.main.temp_max)}°</div>
                                        <div className="text-white/60">{convertTemp(day.main.temp_min)}°</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const AirQuality = () => {
        if (!airQuality) return null;

        const aqi = airQuality.list[0].main.aqi;
        const components = airQuality.list[0].components;

        return (
            <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Air Quality</h3>

                <div className="mb-8 p-6 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl text-center">
                    <div
                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                        style={{ backgroundColor: getAQIColor(aqi) }}
                    >
                        {aqi}
                    </div>
                    <div className="text-xl font-semibold text-white mb-2">{getAQILabel(aqi)}</div>
                    <div className="text-white/70">Air Quality Index</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'PM2.5', value: components.pm2_5, unit: 'μg/m³', good: components.pm2_5 < 15 },
                        { label: 'PM10', value: components.pm10, unit: 'μg/m³', good: components.pm10 < 25 },
                        { label: 'NO₂', value: components.no2, unit: 'μg/m³', good: components.no2 < 40 },
                        { label: 'O₃', value: components.o3, unit: 'μg/m³', good: components.o3 < 100 },
                        { label: 'CO', value: components.co, unit: 'μg/m³', good: components.co < 10000 },
                        { label: 'SO₂', value: components.so2, unit: 'μg/m³', good: components.so2 < 20 }
                    ].map((pollutant, index) => (
                        <div key={index} className="p-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/70 text-sm">{pollutant.label}</span>
                                <div className={`w-2 h-2 rounded-full ${pollutant.good ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            </div>
                            <div className="text-white font-bold">{pollutant.value.toFixed(1)}</div>
                            <div className="text-white/60 text-xs">{pollutant.unit}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const WeatherAlerts = () => {
        if (!alerts || !alerts.alerts?.length) {
            return (
                <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
                    <div className="text-green-400 text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Active Alerts</h3>
                    <p className="text-white/70">Weather conditions are normal in your area.</p>
                </div>
            );
        }

        return (
            <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Weather Alerts</h3>
                <div className="space-y-4">
                    {alerts.alerts.map((alert, index) => (
                        <div key={index} className="p-6 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={24} />
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold text-lg mb-2">{alert.event}</h4>
                                    <p className="text-white/80 mb-3">{alert.description}</p>
                                    <div className="text-white/60 text-sm">
                                        <span>From: {new Date(alert.start * 1000).toLocaleDateString()}</span>
                                        <span className="mx-2">•</span>
                                        <span>Until: {new Date(alert.end * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-white/60 text-sm mt-1">
                                        Source: {alert.sender_name}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const FavoriteCities = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Heart size={16} />
                Favorite Cities
            </h3>
            <div className="flex gap-3 overflow-x-auto">
                {favorites.map((city, index) => (
                    <button
                        key={index}
                        className="flex-shrink-0 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl text-white hover:bg-white/20 transition-all"
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading weather data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
            <div className="max-w-6xl mx-auto">
                <WeatherHeader />
                <SearchBar />
                <FavoriteCities />
                <TabNavigation />

                {error && (
                    <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 mb-8 text-center">
                        <p className="text-white mb-4">{error}</p>
                        <button
                            onClick={loadWeatherData}
                            className="px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="mb-8">
                    {activeTab === 'current' && <CurrentWeather />}
                    {activeTab === 'hourly' && <HourlyForecast />}
                    {activeTab === 'forecast' && <FiveDayForecast />}
                    {activeTab === 'air' && <AirQuality />}
                    {activeTab === 'alerts' && <WeatherAlerts />}
                </div>
            </div>
        </div>
    );
};

export default EnhancedWeatherApp;