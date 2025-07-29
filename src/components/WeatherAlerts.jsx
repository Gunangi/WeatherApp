// src/components/WeatherAlerts.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
    AlertTriangle,
    CloudRain,
    Zap,
    Snowflake,
    Wind,
    Thermometer,
    Sun,
    Bell,
    BellOff,
    X,
    Settings,
    MapPin
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const WeatherAlerts = ({ weatherData, location, className = "" }) => {
    const [alerts, setAlerts] = useState([]);
    const [notificationSettings, setNotificationSettings] = useState({
        enabled: true,
        rain: true,
        temperature: true,
        wind: true,
        storm: true,
        snow: true,
        uv: true
    });
    const [dismissed, setDismissed] = useState(new Set());
    const [showSettings, setShowSettings] = useState(false);
    const { userId } = useContext(AppContext);

    useEffect(() => {
        // Load notification settings from localStorage
        const savedSettings = localStorage.getItem(`alertSettings_${userId}`);
        if (savedSettings) {
            setNotificationSettings(JSON.parse(savedSettings));
        }

        // Request notification permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [userId]);

    useEffect(() => {
        if (weatherData) {
            generateAlerts(weatherData);
        }
    }, [weatherData, notificationSettings]);

    const saveSettings = (newSettings) => {
        setNotificationSettings(newSettings);
        localStorage.setItem(`alertSettings_${userId}`, JSON.stringify(newSettings));
    };

    const generateAlerts = (data) => {
        const newAlerts = [];

        if (!data || !notificationSettings.enabled) return;

        // Temperature alerts
        if (notificationSettings.temperature) {
            if (data.main.temp > 40) {
                newAlerts.push({
                    id: 'temp_extreme_heat',
                    type: 'warning',
                    icon: <Thermometer className="w-5 h-5 text-red-500" />,
                    title: 'Extreme Heat Warning',
                    message: `Temperature is extremely high at ${Math.round(data.main.temp)}°C. Stay hydrated and avoid outdoor activities.`,
                    severity: 'high',
                    location: data.name,
                    timestamp: new Date().toISOString()
                });
            } else if (data.main.temp < 5) {
                newAlerts.push({
                    id: 'temp_cold',
                    type: 'advisory',
                    icon: <Snowflake className="w-5 h-5 text-blue-500" />,
                    title: 'Cold Weather Advisory',
                    message: `Temperature is very low at ${Math.round(data.main.temp)}°C. Dress warmly and be cautious of icy conditions.`,
                    severity: 'medium',
                    location: data.name,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Wind alerts
        if (notificationSettings.wind && data.wind && data.wind.speed > 10) {
            newAlerts.push({
                id: 'wind_strong',
                type: 'warning',
                icon: <Wind className="w-5 h-5 text-yellow-600" />,
                title: 'Strong Wind Warning',
                message: `High wind speeds of ${data.wind.speed} m/s detected. Secure loose objects and be cautious while driving.`,
                severity: 'medium',
                location: data.name,
                timestamp: new Date().toISOString()
            });
        }

        // Rain/Storm alerts
        if (notificationSettings.rain) {
            const condition = data.weather[0].main.toLowerCase();
            if (condition.includes('thunderstorm') && notificationSettings.storm) {
                newAlerts.push({
                    id: 'storm_warning',
                    type: 'danger',
                    icon: <Zap className="w-5 h-5 text-purple-600" />,
                    title: 'Thunderstorm Warning',
                    message: 'Thunderstorm activity detected in your area. Stay indoors and avoid electrical appliances.',
                    severity: 'high',
                    location: data.name,
                    timestamp: new Date().toISOString()
                });
            } else if (condition.includes('rain')) {
                newAlerts.push({
                    id: 'rain_alert',
                    type: 'info',
                    icon: <CloudRain className="w-5 h-5 text-blue-500" />,
                    title: 'Rain Alert',
                    message: 'Rain is expected. Don\'t forget your umbrella and drive carefully.',
                    severity: 'low',
                    location: data.name,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Snow alerts
        if (notificationSettings.snow && data.weather[0].main.toLowerCase().includes('snow')) {
            newAlerts.push({
                id: 'snow_alert',
                type: 'warning',
                icon: <Snowflake className="w-5 h-5 text-blue-400" />,
                title: 'Snow Alert',
                message: 'Snow conditions detected. Exercise caution while traveling and dress appropriately.',
                severity: 'medium',
                location: data.name,
                timestamp: new Date().toISOString()
            });
        }

        // UV Index alert (mock implementation)
        if (notificationSettings.uv && data.weather[0].icon.includes('d')) {
            const uvIndex = Math.round(Math.random() * 11); // Mock UV index
            if (uvIndex > 7) {
                newAlerts.push({
                    id: 'uv_high',
                    type: 'advisory',
                    icon: <Sun className="w-5 h-5 text-orange-500" />,
                    title: 'High UV Index',
                    message: `UV Index is high (${uvIndex}). Use sunscreen and limit sun exposure between 10 AM - 4 PM.`,
                    severity: 'medium',
                    location: data.name,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Filter out dismissed alerts
        const filteredAlerts = newAlerts.filter(alert => !dismissed.has(alert.id));
        setAlerts(filteredAlerts);

        // Send browser notifications for high severity alerts
        filteredAlerts.forEach(alert => {
            if (alert.severity === 'high' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(alert.title, {
                    body: alert.message,
                    icon: '/weather-icon.png',
                    tag: alert.id,
                    requireInteraction: true
                });
            }
        });
    };

    const dismissAlert = (alertId) => {
        setDismissed(prev => new Set([...prev, alertId]));
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const getAlertStyles = (type) => {
        switch (type) {
            case 'danger':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
            case 'advisory':
                return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (alerts.length === 0 && !showSettings) return null;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Weather Alerts
                        </h3>
                        {alerts.length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {alerts.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                        Notification Settings
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Enable Notifications
                            </span>
                            <button
                                onClick={() => saveSettings({
                                    ...notificationSettings,
                                    enabled: !notificationSettings.enabled
                                })}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                    notificationSettings.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                    notificationSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </div>

                        {Object.entries(notificationSettings).map(([key, value]) => {
                            if (key === 'enabled') return null;
                            return (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {key} Alerts
                                    </span>
                                    <button
                                        onClick={() => saveSettings({
                                            ...notificationSettings,
                                            [key]: !value
                                        })}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                        disabled={!notificationSettings.enabled}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                            value ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Alerts List */}
            <div className="p-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No active weather alerts
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            You'll be notified of any severe weather conditions
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`border rounded-lg p-4 ${getAlertStyles(alert.type)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-0.5">{alert.icon}</div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold mb-1">
                                                {alert.title}
                                            </h5>
                                            <p className="text-sm mb-2">
                                                {alert.message}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs opacity-75">
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{alert.location}</span>
                                                </div>
                                                <span>{formatTime(alert.timestamp)}</span>
                                                <span className="capitalize">
                                                    {alert.severity} severity
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismissAlert(alert.id)}
                                        className="p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notification Permission Request */}
                {'Notification' in window && Notification.permission === 'default' && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Bell className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-800 dark:text-blue-200">
                                    Enable browser notifications for instant alerts
                                </span>
                            </div>
                            <button
                                onClick={() => Notification.requestPermission()}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                            >
                                Enable
                            </button>
                        </div>
                    </div>
                )}

                {/* Notification Blocked Warning */}
                {'Notification' in window && Notification.permission === 'denied' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <BellOff className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-800 dark:text-red-200">
                                Browser notifications are blocked. Enable them in your browser settings for instant alerts.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherAlerts;