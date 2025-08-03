import React, { useState, useEffect, Suspense } from 'react';
import {
    Search, MapPin, Settings, Moon, Sun, Wind, Eye, Droplets, Gauge,
    Sunrise, Sunset, Thermometer, AlertTriangle, Navigation, Clock,
    Heart, Star, Bell, TrendingUp, Umbrella, Shirt, Calendar, Share2,
    Menu, X, Grid, List, Map, BarChart3, Loader
} from 'lucide-react';
import './App.css';

// Context Providers
import { WeatherContext } from './context/WeatherContext';
import { ThemeContext } from './context/ThemeContext';
import { UserContext } from './context/UserContext';

// Custom Hooks
import { useGeolocation } from './hooks/useGeolocation';
import { useNotifications } from './hooks/useNotifications';
import { useWeather } from './hooks/useWeather';
import { useWidgets } from './hooks/useWidgets';

// Utils
import { weatherAPI } from './utils/weatherAPI';
import { dateUtils } from './utils/dateUtils';
import { geolocation } from './utils/geolocation';
import storageManager from './utils/localStorage';
import notificationManager from './utils/notification';
import { unitConversions } from './utils/unitConversions';
import { widgetUtils } from './utils/widgetUtils';

// Components - Lazy loaded for better performance
const WeatherDisplay = React.lazy(() => import('./components/WeatherDisplay'));
const AirQuality = React.lazy(() => import('./components/AirQuality'));
const ForecastCards = React.lazy(() => import('./components/ForecastCards'));
const WeatherAlerts = React.lazy(() => import('./components/WeatherAlerts'));
const SearchBar = React.lazy(() => import('./components/SearchBar'));
const SettingsPanel = React.lazy(() => import('./components/SettingsPanel'));
const ThemeToggle = React.lazy(() => import('./components/ThemeToggle'));
const ActivitySuggestions = React.lazy(() => import('./components/ActivitySuggestions'));
const ClothingSuggestions = React.lazy(() => import('./components/ClothingSuggestions'));
const HistoricalWeather = React.lazy(() => import('./components/HistoricalWeather'));
const LocationHistory = React.lazy(() => import('./components/LocationHistory'));
const TravelPlanner = React.lazy(() => import('./components/TravelPlanner'));
const WeatherComparison = React.lazy(() => import('./components/WeatherComparison'));
const WeatherWidgets = React.lazy(() => import('./components/WeatherWidgets'));
const BaseWidget = React.lazy(() => import('./components/BaseWidget'));

// Loading Component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <div className="text-center">
            <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white text-lg">Loading...</p>
        </div>
    </div>
);

const App = () => {
    // State Management
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [historicalData, setHistoricalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI State
    const [isDark, setIsDark] = useState(() =>
        storageManager.getItem('theme') === 'dark' ||
        (!storageManager.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeView, setActiveView] = useState(() =>
        storageManager.getItem('activeView') || 'dashboard'
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // User Preferences
    const [tempUnit, setTempUnit] = useState(() =>
        storageManager.getItem('tempUnit') || 'C'
    );
    const [favorites, setFavorites] = useState(() =>
        JSON.parse(storageManager.getItem('favorites')) ||
        ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']
    );
    const [notifications, setNotifications] = useState(() =>
        JSON.parse(storageManager.getItem('notifications')) !== false
    );
    const [location, setLocation] = useState(() =>
        JSON.parse(storageManager.getItem('lastLocation')) ||
        { city: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.2090 }
    );

    // Widget and Layout State
    const [activeWidgets, setActiveWidgets] = useState(() =>
        JSON.parse(storageManager.getItem('activeWidgets')) ||
        ['current-weather', 'forecast', 'air-quality', 'alerts']
    );
    const [viewMode, setViewMode] = useState(() =>
        storageManager.getItem('viewMode') || 'grid'
    );

    // Custom Hooks
    const { position, error: geoError, getCurrentPosition } = useGeolocation();
    const { requestPermission, showNotification } = useNotifications();
    const {
        fetchCurrentWeather,
        fetchForecast,
        fetchHourlyForecast,
        fetchAirQuality,
        fetchAlerts,
        fetchHistoricalData
    } = useWeather();
    const { availableWidgets, widgetConfigs } = useWidgets();

    // Initialize app and setup event listeners
    useEffect(() => {
        initializeApp();
        setupEventListeners();

        // Update time every second
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup
        return () => {
            clearInterval(timeInterval);
            cleanupEventListeners();
        };
    }, []);

    // Save preferences to localStorage when they change
    useEffect(() => {
        storageManager.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    useEffect(() => {
        storageManager.setItem('activeView', activeView);
    }, [activeView]);

    useEffect(() => {
        storageManager.setItem('tempUnit', tempUnit);
    }, [tempUnit]);

    useEffect(() => {
        storageManager.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        storageManager.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        storageManager.setItem('lastLocation', JSON.stringify(location));
    }, [location]);

    useEffect(() => {
        storageManager.setItem('activeWidgets', JSON.stringify(activeWidgets));
    }, [activeWidgets]);

    useEffect(() => {
        storageManager.setItem('viewMode', viewMode);
    }, [viewMode]);

    // Initialize application
    const initializeApp = async () => {
        try {
            setLoading(true);
            setError(null);

            // Request notification permission if enabled
            if (notifications) {
                await requestPermission();
            }

            // Get user location if available
            if (position) {
                setLocation({
                    ...location,
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            }

            // Load initial weather data
            await loadWeatherData(location);

        } catch (err) {
            console.error('App initialization error:', err);
            setError('Failed to initialize the application');
        } finally {
            setLoading(false);
        }
    };

    // Load weather data for a location
    const loadWeatherData = async (locationData) => {
        try {
            setLoading(true);

            const [
                currentWeather,
                forecastData,
                hourlyData,
                airQualityData,
                alertsData,
                historicalWeatherData
            ] = await Promise.allSettled([
                fetchCurrentWeather(locationData.lat, locationData.lon),
                fetchForecast(locationData.lat, locationData.lon),
                fetchHourlyForecast(locationData.lat, locationData.lon),
                fetchAirQuality(locationData.lat, locationData.lon),
                fetchAlerts(locationData.lat, locationData.lon),
                fetchHistoricalData(locationData.lat, locationData.lon, 7) // Last 7 days
            ]);

            // Handle successful responses
            if (currentWeather.status === 'fulfilled') {
                setWeather(currentWeather.value);
            }

            if (forecastData.status === 'fulfilled') {
                setForecast(forecastData.value);
            }

            if (hourlyData.status === 'fulfilled') {
                setHourlyForecast(hourlyData.value);
            }

            if (airQualityData.status === 'fulfilled') {
                setAirQuality(airQualityData.value);
            }

            if (alertsData.status === 'fulfilled') {
                setAlerts(alertsData.value);

                // Show notifications for new alerts
                if (notifications && alertsData.value.length > 0) {
                    alertsData.value.forEach(alert => {
                        showNotification(
                            alert.event,
                            alert.description,
                            { tag: `alert-${alert.start}` }
                        );
                    });
                }
            }

            if (historicalWeatherData.status === 'fulfilled') {
                setHistoricalData(historicalWeatherData.value);
            }

        } catch (err) {
            console.error('Weather data loading error:', err);
            setError('Failed to load weather data');
        } finally {
            setLoading(false);
        }
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Handle online/offline status
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Handle app visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Handle keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    };

    // Cleanup event listeners
    const cleanupEventListeners = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('keydown', handleKeyboardShortcuts);
    };

    // Event handlers
    const handleOnline = () => {
        console.log('App is online');
        loadWeatherData(location);
    };

    const handleOffline = () => {
        console.log('App is offline');
        showNotification('Offline', 'You are now offline. Some features may be limited.');
    };

    const handleVisibilityChange = () => {
        if (!document.hidden && notifications) {
            // Refresh data when app becomes visible
            loadWeatherData(location);
        }
    };

    const handleKeyboardShortcuts = (event) => {
        // Ctrl/Cmd + K to open search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            // Focus search input
            document.querySelector('.search-input')?.focus();
        }

        // Escape to close modals
        if (event.key === 'Escape') {
            setSettingsOpen(false);
            setSidebarOpen(false);
        }
    };

    // Navigation items configuration
    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Grid, component: 'Dashboard' },
        { id: 'current', label: 'Current Weather', icon: Thermometer, component: 'WeatherDisplay' },
        { id: 'hourly', label: 'Hourly Forecast', icon: Clock, component: 'HourlyForecast' },
        { id: 'forecast', label: '5-Day Forecast', icon: Calendar, component: 'ForecastCards' },
        { id: 'air-quality', label: 'Air Quality', icon: Wind, component: 'AirQuality' },
        { id: 'alerts', label: 'Weather Alerts', icon: AlertTriangle, component: 'WeatherAlerts' },
        { id: 'maps', label: 'Weather Maps', icon: Map, component: 'WeatherMaps' },
        { id: 'historical', label: 'Historical Data', icon: BarChart3, component: 'HistoricalWeather' },
        { id: 'activities', label: 'Activity Suggestions', icon: TrendingUp, component: 'ActivitySuggestions' },
        { id: 'clothing', label: 'Clothing Suggestions', icon: Shirt, component: 'ClothingSuggestions' },
        { id: 'travel', label: 'Travel Planner', icon: Navigation, component: 'TravelPlanner' },
        { id: 'comparison', label: 'City Comparison', icon: BarChart3, component: 'WeatherComparison' },
        { id: 'widgets', label: 'Weather Widgets', icon: Grid, component: 'WeatherWidgets' }
    ];

    // Handle location change
    const handleLocationChange = async (newLocation) => {
        setLocation(newLocation);
        await loadWeatherData(newLocation);
    };

    // Handle search
    const handleSearch = async (query) => {
        try {
            const searchResults = await weatherAPI.searchLocations(query);
            return searchResults;
        } catch (err) {
            console.error('Search error:', err);
            return [];
        }
    };

    // Add to favorites
    const addToFavorites = (cityName) => {
        if (!favorites.includes(cityName)) {
            setFavorites([...favorites, cityName]);
        }
    };

    // Remove from favorites
    const removeFromFavorites = (cityName) => {
        setFavorites(favorites.filter(city => city !== cityName));
    };

    // Header Component
    const Header = () => (
        <header className="header">
            <div className="header-left">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="header-btn mobile-menu-btn"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="header-title">Weather App</h1>
                    <span className="header-time">
                        {dateUtils.formatTime(currentTime)}
                    </span>
                </div>
            </div>
            <div className="header-controls">
                <button
                    onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                    className="header-btn temp-unit-btn"
                >
                    °{tempUnit}
                </button>
                <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="header-btn"
                >
                    {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>
                <ThemeToggle isDark={isDark} onToggle={setIsDark} />
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="header-btn"
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
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Navigation</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="close-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="nav">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveView(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Favorite Cities */}
                    <div className="favorites">
                        <h3 className="favorites-title">
                            <Heart size={16} />
                            Favorite Cities
                        </h3>
                        <div className="favorites-list">
                            {favorites.slice(0, 5).map((city, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleLocationChange({ city, lat: 0, lon: 0 })}
                                    className="favorite-item"
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

    // Main content renderer
    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }

        const commonProps = {
            weather,
            forecast,
            hourlyForecast,
            airQuality,
            alerts,
            historicalData,
            location,
            tempUnit,
            isDark,
            onLocationChange: handleLocationChange,
            onAddToFavorites: addToFavorites,
            onRemoveFromFavorites: removeFromFavorites
        };

        switch (activeView) {
            case 'dashboard':
                return (
                    <div className={`dashboard-grid ${viewMode === 'grid' ? 'grid-mode' : ''}`}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <WeatherDisplay {...commonProps} />
                            <ForecastCards {...commonProps} />
                            <AirQuality {...commonProps} />
                            <WeatherAlerts {...commonProps} />
                            <ActivitySuggestions {...commonProps} />
                            <ClothingSuggestions {...commonProps} />
                        </Suspense>
                    </div>
                );

            case 'current':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WeatherDisplay {...commonProps} detailed={true} />
                    </Suspense>
                );

            case 'hourly':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ForecastCards {...commonProps} type="hourly" />
                    </Suspense>
                );

            case 'forecast':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ForecastCards {...commonProps} type="daily" />
                    </Suspense>
                );

            case 'air-quality':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AirQuality {...commonProps} detailed={true} />
                    </Suspense>
                );

            case 'alerts':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WeatherAlerts {...commonProps} />
                    </Suspense>
                );

            case 'historical':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <HistoricalWeather {...commonProps} />
                    </Suspense>
                );

            case 'activities':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ActivitySuggestions {...commonProps} />
                    </Suspense>
                );

            case 'clothing':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ClothingSuggestions {...commonProps} />
                    </Suspense>
                );

            case 'travel':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TravelPlanner {...commonProps} />
                    </Suspense>
                );

            case 'comparison':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WeatherComparison {...commonProps} />
                    </Suspense>
                );

            case 'widgets':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WeatherWidgets
                            {...commonProps}
                            activeWidgets={activeWidgets}
                            onWidgetToggle={(widgetId) => {
                                setActiveWidgets(prev =>
                                    prev.includes(widgetId)
                                        ? prev.filter(id => id !== widgetId)
                                        : [...prev, widgetId]
                                );
                            }}
                        />
                    </Suspense>
                );

            default:
                return (
                    <div className="coming-soon">
                        <h2>{activeView.replace('-', ' ')}</h2>
                        <p>This feature is coming soon!</p>
                    </div>
                );
        }
    };

    // Main App Component
    return (
        <WeatherContext>
            <ThemeContext value={{ isDark, setIsDark }}>
                <UserContext>
                    <div className={`weather-app ${isDark ? 'dark' : 'light'}`}>
                        <div className="app-layout">
                            <Sidebar />

                            <div className="main-content">
                                <Header />

                                <div className="search-container">
                                    <Suspense fallback={<div>Loading search...</div>}>
                                        <SearchBar
                                            onSearch={handleSearch}
                                            onLocationSelect={handleLocationChange}
                                            placeholder="Search for a city..."
                                        />
                                    </Suspense>
                                </div>

                                {error && (
                                    <div className="error-container">
                                        <p className="error-text">{error}</p>
                                        <button
                                            onClick={() => loadWeatherData(location)}
                                            className="retry-btn"
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
                            <Suspense fallback={<LoadingSpinner />}>
                                <SettingsPanel
                                    isOpen={settingsOpen}
                                    onClose={() => setSettingsOpen(false)}
                                    tempUnit={tempUnit}
                                    onTempUnitChange={setTempUnit}
                                    notifications={notifications}
                                    onNotificationsChange={setNotifications}
                                    viewMode={viewMode}
                                    onViewModeChange={setViewMode}
                                    activeWidgets={activeWidgets}
                                    onActiveWidgetsChange={setActiveWidgets}
                                    availableWidgets={availableWidgets}
                                />
                            </Suspense>
                        )}
                    </div>
                </UserContext>
            </ThemeContext>
        </WeatherContext>
    );
};

export default App;

