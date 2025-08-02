import React, { useState, useEffect } from 'react';
import {
    Search, MapPin, Settings, Moon, Sun, Wind, Eye, Droplets, Gauge,
    Sunrise, Sunset, Thermometer, AlertTriangle, Navigation, Clock,
    Heart, Star, Bell, TrendingUp, Umbrella, Shirt, Calendar, Share2,
    Menu, X, Grid, List, Map, BarChart3
} from 'lucide-react';
import './App.css';

// Import all your components (simulated for demo)
// In your actual app, these would be real imports:
// import WeatherDisplay from './components/WeatherDisplay';
// import AirQuality from './components/AirQuality';
// import ForecastCards from './components/ForecastCards';
// import WeatherAlerts from './components/WeatherAlerts';
// import SearchBar from './components/SearchBar';
// import SettingsPanel from './components/SettingsPanel';
// import ThemeToggle from './components/ThemeToggle';
// import ActivitySuggestions from './components/ActivitySuggestions';
// import ClothingSuggestions from './components/ClothingSuggestions';
// import HistoricalWeather from './components/HistoricalWeather';
// import LocationHistory from './components/LocationHistory';
// import TravelPlanner from './components/TravelPlanner';
// import WeatherComparison from './components/WeatherComparison';
// import WeatherWidgets from './components/WeatherWidgets';

// Import contexts (simulated for demo)
// import { WeatherContext } from './context/WeatherContext';
// import { ThemeContext } from './context/ThemeContext';
// import { UserContext } from './context/UserContext';

// Import hooks (simulated for demo)
// import { useGeolocation } from './hooks/useGeolocation';
// import { useNotifications } from './hooks/useNotifications';
// import { useWeather } from './hooks/useWeather';
// import { useWidgets } from './hooks/useWidgets';

// Import utils (simulated for demo)
// import { weatherAPI } from './utils/weatherAPI';
// import { dateUtils } from './utils/dateUtils';
// import { geolocation } from './utils/geolocation';
// import { localStorage } from './utils/localStorage';
// import { notification } from './utils/notification';
// import { unitConversions } from './utils/unitConversions';
// import { widgetUtils } from './utils/widgetUtils';

const IntegratedWeatherApp = () => {
    // Main state management
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [historicalData, setHistoricalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI state
    const [isDark, setIsDark] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // User preferences
    const [tempUnit, setTempUnit] = useState('C');
    const [favorites, setFavorites] = useState(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']);
    const [notifications, setNotifications] = useState(true);
    const [location, setLocation] = useState({ city: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.2090 });

    // Widget and layout state
    const [activeWidgets, setActiveWidgets] = useState([
        'current-weather', 'forecast', 'air-quality', 'alerts'
    ]);
    const [viewMode, setViewMode] = useState('grid'); // grid, list, map

    // Simulated data for demo
    const simulatedWeather = {
        name: "Delhi",
        sys: { country: "IN", sunrise: 1691200800, sunset: 1691247600 },
        main: { temp: 31, feels_like: 38, humidity: 82, pressure: 1002 },
        weather: [{ main: "Clouds", description: "broken clouds", icon: "04d" }],
        wind: { speed: 2.2 },
        visibility: 10000,
        coord: { lat: 28.6139, lon: 77.2090 },
        timezone: 19800
    };

    const simulatedForecast = {
        list: Array.from({ length: 5 }, (_, i) => ({
            dt: Math.floor(Date.now() / 1000) + (i * 86400),
            main: { temp_max: 32 - i, temp_min: 28 - i, temp: 30 - i },
            weather: [{ main: i % 2 === 0 ? "Rain" : "Clouds", description: i % 2 === 0 ? "light rain" : "broken clouds" }]
        }))
    };

    const simulatedAirQuality = {
        list: [{
            main: { aqi: 3 },
            components: { co: 233.4, no: 0.01, no2: 13.4, o3: 54.3, so2: 8.2, pm2_5: 15.3, pm10: 20.1, nh3: 4.6 }
        }]
    };

    const simulatedAlerts = [
        {
            sender_name: "India Meteorological Department",
            event: "Heat Wave Warning",
            start: Math.floor(Date.now() / 1000),
            end: Math.floor(Date.now() / 1000) + 86400 * 2,
            description: "Heat wave conditions are likely to prevail over Delhi and adjoining areas."
        }
    ];

    // Initialize app
    useEffect(() => {
        initializeApp();
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const initializeApp = async () => {
        try {
            setLoading(true);
            // Simulate loading data
            await new Promise(resolve => setTimeout(resolve, 1000));

            setWeather(simulatedWeather);
            setForecast(simulatedForecast);
            setAirQuality(simulatedAirQuality);
            setAlerts(simulatedAlerts);

        } catch (err) {
            setError('Failed to load weather data');
        } finally {
            setLoading(false);
        }
    };

    // Navigation items
    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Grid },
        { id: 'current', label: 'Current Weather', icon: Thermometer },
        { id: 'hourly', label: 'Hourly Forecast', icon: Clock },
        { id: 'forecast', label: '5-Day Forecast', icon: Calendar },
        { id: 'air-quality', label: 'Air Quality', icon: Wind },
        { id: 'alerts', label: 'Weather Alerts', icon: AlertTriangle },
        { id: 'maps', label: 'Weather Maps', icon: Map },
        { id: 'historical', label: 'Historical Data', icon: BarChart3 },
        { id: 'activities', label: 'Activity Suggestions', icon: TrendingUp },
        { id: 'clothing', label: 'Clothing Suggestions', icon: Shirt },
        { id: 'travel', label: 'Travel Planner', icon: Navigation },
        { id: 'comparison', label: 'City Comparison', icon: BarChart3 },
        { id: 'widgets', label: 'Weather Widgets', icon: Grid }
    ];

    // Header Component
    const Header = () => (
        <header className="flex justify-between items-center mb-8 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all lg:hidden"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Weather App</h1>
                    <span className="text-white/80 text-sm">{currentTime}</span>
                </div>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                >
                    °{tempUnit}
                </button>
                <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                >
                    {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );

    // Sidebar Component
    const Sidebar = () => (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`
        fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 z-50 transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-white">Navigation</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-white/70 hover:text-white lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveView(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                    ${activeView === item.id
                                        ? 'bg-white/20 text-white'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }
                  `}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Favorite Cities */}
                    <div className="mt-8">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Heart size={16} />
                            Favorite Cities
                        </h3>
                        <div className="space-y-2">
                            {favorites.slice(0, 5).map((city, index) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl text-white hover:bg-white/20 transition-all"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Search Component
    const SearchComponent = () => {
        const [query, setQuery] = useState('');

        return (
            <div className="mb-8">
                <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full">
                    <Search size={20} className="text-white/70" />
                    <input
                        type="text"
                        placeholder="Search for a city..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="text-white/70 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Widget Components (simplified versions)
    const CurrentWeatherWidget = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6 text-white/80">
                <MapPin size={16} />
                <span>{weather?.name}, {weather?.sys.country}</span>
            </div>
            <div className="flex items-center gap-8 mb-8">
                <div className="text-6xl">☁️</div>
                <div>
                    <div className="text-5xl font-bold text-white mb-2">31°C</div>
                    <div className="text-white/70 text-lg">Feels like 38°C</div>
                </div>
            </div>
            <div className="text-white/90 text-xl mb-8 capitalize">Broken Clouds</div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl">
                    <Droplets size={20} className="text-white/80" />
                    <div>
                        <div className="text-white/70 text-sm">Humidity</div>
                        <div className="text-white font-semibold">82%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl">
                    <Wind size={20} className="text-white/80" />
                    <div>
                        <div className="text-white/70 text-sm">Wind</div>
                        <div className="text-white font-semibold">2.2 m/s</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ForecastWidget = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">5-Day Forecast</h3>
            <div className="space-y-4">
                {['Today', 'Sun, Aug 4', 'Mon, Aug 5', 'Tue, Aug 6', 'Wed, Aug 7'].map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="text-2xl">{index % 2 === 0 ? '🌧️' : '☁️'}</div>
                            <div>
                                <div className="text-white font-semibold">{day}</div>
                                <div className="text-white/70 text-sm">{index % 2 === 0 ? 'Light rain' : 'Cloudy'}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-bold">{32 - index}°</div>
                            <div className="text-white/60">{28 - index}°</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const AirQualityWidget = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Air Quality</h3>
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white bg-orange-500">
                    3
                </div>
                <div className="text-xl font-semibold text-white mb-2">Moderate</div>
                <div className="text-white/70">Air Quality Index</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'PM2.5', value: '15.3' },
                    { label: 'PM10', value: '20.1' },
                    { label: 'NO₂', value: '13.4' },
                    { label: 'O₃', value: '54.3' }
                ].map((pollutant, index) => (
                    <div key={index} className="p-4 bg-white/10 rounded-2xl">
                        <div className="text-white/70 text-sm mb-1">{pollutant.label}</div>
                        <div className="text-white font-bold">{pollutant.value}</div>
                        <div className="text-white/60 text-xs">μg/m³</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const AlertsWidget = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Weather Alerts</h3>
            <div className="p-6 bg-red-500/20 border border-red-500/30 rounded-2xl">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="text-red-400 mt-1" size={24} />
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-2">Heat Wave Warning</h4>
                        <p className="text-white/80 mb-3">Heat wave conditions are likely to prevail over Delhi and adjoining areas.</p>
                        <div className="text-white/60 text-sm">
                            India Meteorological Department
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Activity Suggestions Widget
    const ActivitySuggestionsWidget = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Activity Suggestions</h3>
            <div className="space-y-4">
                {[
                    { activity: 'Indoor Activities', icon: '🏠', reason: 'High temperature outside' },
                    { activity: 'Stay Hydrated', icon: '💧', reason: 'Heat wave conditions' },
                    { activity: 'Avoid Outdoor Sports', icon: '⚽', reason: 'Poor air quality' }
                ].map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
                        <div className="text-2xl">{suggestion.icon}</div>
                        <div>
                            <div className="text-white font-semibold">{suggestion.activity}</div>
                            <div className="text-white/70 text-sm">{suggestion.reason}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Clothing Suggestions Widget
    const ClothingSuggestionsWidget = () => (
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">What to Wear</h3>
            <div className="space-y-4">
                {[
                    { item: 'Light Cotton Clothes', icon: '👕', temp: '31°C' },
                    { item: 'Sun Hat', icon: '🧢', reason: 'UV Protection' },
                    { item: 'Sunglasses', icon: '🕶️', reason: 'Bright sunlight' }
                ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                            <div className="text-white font-semibold">{item.item}</div>
                            <div className="text-white/70 text-sm">{item.temp || item.reason}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Main content renderer
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading weather data...</p>
                    </div>
                </div>
            );
        }

        switch (activeView) {
            case 'dashboard':
                return (
                    <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                        <CurrentWeatherWidget />
                        <ForecastWidget />
                        <AirQualityWidget />
                        <AlertsWidget />
                        <ActivitySuggestionsWidget />
                        <ClothingSuggestionsWidget />
                    </div>
                );

            case 'current':
                return <CurrentWeatherWidget />;

            case 'forecast':
                return <ForecastWidget />;

            case 'air-quality':
                return <AirQualityWidget />;

            case 'alerts':
                return <AlertsWidget />;

            case 'activities':
                return <ActivitySuggestionsWidget />;

            case 'clothing':
                return <ClothingSuggestionsWidget />;

            default:
                return (
                    <div className="text-center p-8 bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl">
                        <h2 className="text-2xl font-bold text-white mb-4">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
                        <p className="text-white/70">This feature is coming soon!</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
            <div className="flex">
                <Sidebar />

                <div className="flex-1 p-4 lg:p-8">
                    <Header />
                    <SearchComponent />

                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 mb-8 text-center">
                            <p className="text-white mb-4">{error}</p>
                            <button
                                onClick={initializeApp}
                                className="px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <main>
                        {renderContent()}
                    </main>
                </div>
            </div>

            {/* Settings Modal */}
            {settingsOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Settings</h2>
                            <button
                                onClick={() => setSettingsOpen(false)}
                                className="text-white/70 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-white font-semibold mb-2">Temperature Unit</label>
                                <div className="flex gap-2">
                                    {['C', 'F'].map((unit) => (
                                        <button
                                            key={unit}
                                            onClick={() => setTempUnit(unit)}
                                            className={`px-4 py-2 rounded-xl transition-all ${
                                                tempUnit === unit
                                                    ? 'bg-white/30 text-white'
                                                    : 'bg-white/10 text-white/70 hover:text-white'
                                            }`}
                                        >
                                            °{unit}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={notifications}
                                        onChange={(e) => setNotifications(e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <span className="text-white">Enable Notifications</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">View Mode</label>
                                <div className="flex gap-2">
                                    {['grid', 'list'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`px-4 py-2 rounded-xl transition-all capitalize ${
                                                viewMode === mode
                                                    ? 'bg-white/30 text-white'
                                                    : 'bg-white/10 text-white/70 hover:text-white'
                                            }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedWeatherApp;
