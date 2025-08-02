import React, { useState, useEffect, useContext } from 'react';
import { WeatherContext } from '../context/WeatherContext';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext';
import ActivitySuggestions from './ActivitySuggestions';
import AirQuality from './AirQuality';
import ClothingSuggestions from './ClothingSuggestions';
import ForecastCards from './ForecastCards';
import './WeatherWidgets.css';

const WeatherWidgets = () => {
    const { weatherData, forecast, airQuality, loading } = useContext(WeatherContext);
    const { theme } = useContext(ThemeContext);
    const { userPreferences } = useContext(UserContext);

    const [widgets, setWidgets] = useState([
        { id: 'current-weather', name: 'Current Weather', enabled: true, position: 0 },
        { id: 'forecast', name: '5-Day Forecast', enabled: true, position: 1 },
        { id: 'metrics', name: 'Weather Metrics', enabled: true, position: 2 },
        { id: 'air-quality', name: 'Air Quality', enabled: true, position: 3 },
        { id: 'uv-index', name: 'UV Index', enabled: true, position: 4 },
        { id: 'sun-times', name: 'Sunrise/Sunset', enabled: true, position: 5 },
        { id: 'hourly', name: 'Hourly Forecast', enabled: true, position: 6 },
        { id: 'clothing', name: 'Clothing Suggestions', enabled: false, position: 7 },
        { id: 'activities', name: 'Activity Recommendations', enabled: false, position: 8 }
    ]);

    const [editingWidget, setEditingWidget] = useState(null);

    useEffect(() => {
        // Load user's widget preferences
        if (userPreferences?.widgets) {
            setWidgets(userPreferences.widgets);
        }
    }, [userPreferences]);

    const toggleWidget = (widgetId) => {
        setWidgets(prev =>
            prev.map(widget =>
                widget.id === widgetId
                    ? { ...widget, enabled: !widget.enabled }
                    : widget
            )
        );
    };

    const moveWidget = (widgetId, direction) => {
        setWidgets(prev => {
            const currentIndex = prev.findIndex(w => w.id === widgetId);
            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newWidgets = [...prev];
            [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];

            return newWidgets.map((widget, index) => ({ ...widget, position: index }));
        });
    };

    const CurrentWeatherWidget = () => (
        <div className="widget current-weather-widget">
            <div className="widget-controls">
                <button className="control-btn" onClick={() => setEditingWidget('current-weather')}>
                    ⚙️
                </button>
            </div>
            <div className="current-weather-content">
                <div className="temperature-display">
                    <span className="temperature">{weatherData?.temperature || '--'}°</span>
                    <span className="unit">{userPreferences?.temperatureUnit || 'C'}</span>
                </div>
                <div className="weather-info">
                    <div className="location">{weatherData?.location || 'Loading...'}</div>
                    <div className="condition">{weatherData?.condition || 'Loading...'}</div>
                    <div className="feels-like">
                        Feels like {weatherData?.feelsLike || '--'}°{userPreferences?.temperatureUnit || 'C'}
                    </div>
                </div>
                <div className="weather-icon-large">
                    {getWeatherIcon(weatherData?.condition)}
                </div>
            </div>
        </div>
    );

    const MetricsWidget = () => (
        <div className="widget metrics-widget">
            <div className="widget-controls">
                <button className="control-btn" onClick={() => setEditingWidget('metrics')}>
                    ⚙️
                </button>
            </div>
            <div className="widget-header">
                <h3 className="widget-title">Weather Metrics</h3>
                <span className="widget-icon">📊</span>
            </div>
            <div className="metrics-grid">
                <div className="metric-item">
                    <div className="metric-value">{weatherData?.humidity || '--'}%</div>
                    <div className="metric-label">Humidity</div>
                </div>
                <div className="metric-item">
                    <div className="metric-value">{weatherData?.windSpeed || '--'}</div>
                    <div className="metric-label">Wind (m/s)</div>
                </div>
                <div className="metric-item">
                    <div className="metric-value">{weatherData?.pressure || '--'}</div>
                    <div className="metric-label">Pressure (hPa)</div>
                </div>
                <div className="metric-item">
                    <div className="metric-value">{weatherData?.visibility || '--'}</div>
                    <div className="metric-label">Visibility (km)</div>
                </div>
            </div>
        </div>
    );

    const UVIndexWidget = () => {
        const getUVClass = (uv) => {
            if (uv <= 2) return 'uv-low';
            if (uv <= 5) return 'uv-moderate';
            if (uv <= 7) return 'uv-high';
            if (uv <= 10) return 'uv-very-high';
            return 'uv-extreme';
        };

        const getUVRecommendation = (uv) => {
            if (uv <= 2) return 'No protection needed. Safe for outdoor activities.';
            if (uv <= 5) return 'Some protection required. Wear sunscreen.';
            if (uv <= 7) return 'Protection essential. Seek shade during midday.';
            if (uv <= 10) return 'Extra protection needed. Avoid sun exposure.';
            return 'Extreme risk. Stay indoors if possible.';
        };

        return (
            <div className="widget uv-widget">
                <div className="widget-controls">
                    <button className="control-btn" onClick={() => setEditingWidget('uv-index')}>
                        ⚙️
                    </button>
                </div>
                <div className="widget-header">
                    <h3 className="widget-title">UV Index</h3>
                    <span className="widget-icon">☀️</span>
                </div>
                <div className="uv-gauge">
                    <div className={`uv-value ${getUVClass(weatherData?.uvIndex)}`}>
                        {weatherData?.uvIndex || '--'}
                    </div>
                    <div className="uv-label">
                        {weatherData?.uvIndex ? getUVLabel(weatherData.uvIndex) : 'Loading...'}
                    </div>
                </div>
                <div className="uv-recommendation">
                    {weatherData?.uvIndex ? getUVRecommendation(weatherData.uvIndex) : 'Loading recommendations...'}
                </div>
            </div>
        );
    };

    const SunTimesWidget = () => (
        <div className="widget sun-times-widget">
            <div className="widget-controls">
                <button className="control-btn" onClick={() => setEditingWidget('sun-times')}>
                    ⚙️
                </button>
            </div>
            <div className="widget-header">
                <h3 className="widget-title">Sun Times</h3>
                <span className="widget-icon">🌅</span>
            </div>
            <div className="sun-times">
                <div className="sun-time">
                    <div className="sun-icon">🌅</div>
                    <div className="sun-time-value">{weatherData?.sunrise || '--:--'}</div>
                    <div className="sun-time-label">Sunrise</div>
                </div>
                <div className="sun-time">
                    <div className="sun-icon">🌇</div>
                    <div className="sun-time-value">{weatherData?.sunset || '--:--'}</div>
                    <div className="sun-time-label">Sunset</div>
                </div>
            </div>
        </div>
    );

    const HourlyForecastWidget = () => (
        <div className="widget hourly-widget">
            <div className="widget-controls">
                <button className="control-btn" onClick={() => setEditingWidget('hourly')}>
                    ⚙️
                </button>
            </div>
            <div className="widget-header">
                <h3 className="widget-title">24-Hour Forecast</h3>
                <span className="widget-icon">🕐</span>
            </div>
            <div className="hourly-scroll">
                {forecast?.hourly?.slice(0, 12).map((hour, index) => (
                    <div key={index} className="hourly-item">
                        <div className="hourly-time">{hour.time}</div>
                        <div className="hourly-icon">{getWeatherIcon(hour.condition)}</div>
                        <div className="hourly-temp">{hour.temperature}°</div>
                        <div className="hourly-precipitation">{hour.precipitation}%</div>
                    </div>
                )) || Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="hourly-item">
                        <div className="hourly-time">--:--</div>
                        <div className="hourly-icon">--</div>
                        <div className="hourly-temp">--°</div>
                        <div className="hourly-precipitation">--%</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const getWeatherIcon = (condition) => {
        const iconMap = {
            'clear': '☀️',
            'sunny': '☀️',
            'partly cloudy': '⛅',
            'cloudy': '☁️',
            'overcast': '☁️',
            'broken clouds': '☁️',
            'rain': '🌧️',
            'light rain': '🌦️',
            'heavy rain': '🌧️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'fog': '🌫️',
            'mist': '🌫️'
        };

        return iconMap[condition?.toLowerCase()] || '☁️';
    };

    const getUVLabel = (uv) => {
        if (uv <= 2) return 'Low';
        if (uv <= 5) return 'Moderate';
        if (uv <= 7) return 'High';
        if (uv <= 10) return 'Very High';
        return 'Extreme';
    };

    const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.position - b.position);

    if (loading) {
        return (
            <div className="widgets-loading">
                <div className="loading-spinner"></div>
                <p>Loading weather widgets...</p>
            </div>
        );
    }

    return (
        <div className={`weather-widgets ${theme}`}>
            <div className="widgets-header">
                <h2 className="widgets-title">Weather Dashboard</h2>
                <button
                    className="customize-btn"
                    onClick={() => setEditingWidget('layout')}
                >
                    Customize Widgets
                </button>
            </div>

            <div className="widgets-grid">
                {enabledWidgets.map(widget => {
                    switch (widget.id) {
                        case 'current-weather':
                            return <CurrentWeatherWidget key={widget.id} />;
                        case 'forecast':
                            return <ForecastCards key={widget.id} />;
                        case 'metrics':
                            return <MetricsWidget key={widget.id} />;
                        case 'air-quality':
                            return <AirQuality key={widget.id} />;
                        case 'uv-index':
                            return <UVIndexWidget key={widget.id} />;
                        case 'sun-times':
                            return <SunTimesWidget key={widget.id} />;
                        case 'hourly':
                            return <HourlyForecastWidget key={widget.id} />;
                        case 'clothing':
                            return <ClothingSuggestions key={widget.id} />;
                        case 'activities':
                            return <ActivitySuggestions key={widget.id} />;
                        default:
                            return null;
                    }
                })}
            </div>

            {editingWidget === 'layout' && (
                <div className="widget-customizer-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Customize Widgets</h3>
                            <button
                                className="close-btn"
                                onClick={() => setEditingWidget(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="widget-list">
                            {widgets.map(widget => (
                                <div key={widget.id} className="widget-item">
                                    <div className="widget-info">
                                        <span className="widget-name">{widget.name}</span>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={widget.enabled}
                                                onChange={() => toggleWidget(widget.id)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    {widget.enabled && (
                                        <div className="widget-controls">
                                            <button
                                                className="move-btn"
                                                onClick={() => moveWidget(widget.id, 'up')}
                                                disabled={widget.position === 0}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                className="move-btn"
                                                onClick={() => moveWidget(widget.id, 'down')}
                                                disabled={widget.position === widgets.length - 1}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="save-btn"
                                onClick={() => {
                                    // Save to user preferences
                                    setEditingWidget(null);
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherWidgets;
