import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Bell,
    Cloud,
    CloudRain,
    Sun,
    Wind,
    Thermometer,
    Eye,
    Clock,
    MapPin,
    Settings,
    X,
    Check
} from 'lucide-react';

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [notificationSettings, setNotificationSettings] = useState({
        browser: true,
        email: false,
        sms: false,
        sound: true
    });

    // Mock alerts data
    const mockAlerts = [
        {
            id: 1,
            type: 'severe',
            category: 'storm',
            title: 'Severe Thunderstorm Warning',
            description: 'Severe thunderstorms with heavy rain, strong winds, and possible hail expected.',
            location: 'New York, NY',
            startTime: '2024-01-30T14:30:00Z',
            endTime: '2024-01-30T22:00:00Z',
            severity: 'high',
            isActive: true,
            isRead: false
        },
        {
            id: 2,
            type: 'weather',
            category: 'heat',
            title: 'Heat Advisory',
            description: 'Dangerous heat index values up to 105°F expected. Take precautions.',
            location: 'Phoenix, AZ',
            startTime: '2024-01-30T12:00:00Z',
            endTime: '2024-01-31T20:00:00Z',
            severity: 'medium',
            isActive: true,
            isRead: true
        },
        {
            id: 3,
            type: 'weather',
            category: 'wind',
            title: 'High Wind Warning',
            description: 'Sustained winds 40-50 mph with gusts up to 70 mph possible.',
            location: 'Chicago, IL',
            startTime: '2024-01-30T08:00:00Z',
            endTime: '2024-01-30T18:00:00Z',
            severity: 'high',
            isActive: false,
            isRead: true
        },
        {
            id: 4,
            type: 'air_quality',
            category: 'pollution',
            title: 'Air Quality Alert',
            description: 'Air Quality Index forecast to reach unhealthy levels for sensitive groups.',
            location: 'Los Angeles, CA',
            startTime: '2024-01-30T06:00:00Z',
            endTime: '2024-01-31T06:00:00Z',
            severity: 'medium',
            isActive: true,
            isRead: false
        },
        {
            id: 5,
            type: 'weather',
            category: 'rain',
            title: 'Flash Flood Watch',
            description: 'Heavy rainfall may cause flash flooding in low-lying areas.',
            location: 'Miami, FL',
            startTime: '2024-01-29T20:00:00Z',
            endTime: '2024-01-30T08:00:00Z',
            severity: 'high',
            isActive: false,
            isRead: true
        }
    ];

    const alertCategories = [
        { key: 'all', label: 'All Alerts', count: mockAlerts.length },
        { key: 'active', label: 'Active', count: mockAlerts.filter(a => a.isActive).length },
        { key: 'severe', label: 'Severe', count: mockAlerts.filter(a => a.severity === 'high').length },
        { key: 'unread', label: 'Unread', count: mockAlerts.filter(a => !a.isRead).length }
    ];

    const alertIcons = {
        storm: CloudRain,
        heat: Sun,
        wind: Wind,
        pollution: Cloud,
        rain: CloudRain,
        temperature: Thermometer,
        visibility: Eye
    };

    const severityColors = {
        high: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200',
        medium: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
        low: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
    };

    const severityBadges = {
        high: 'bg-red-500 text-white',
        medium: 'bg-yellow-500 text-white',
        low: 'bg-blue-500 text-white'
    };

    useEffect(() => {
        setAlerts(mockAlerts);
    }, []);

    const filteredAlerts = alerts.filter(alert => {
        switch (activeFilter) {
            case 'active':
                return alert.isActive;
            case 'severe':
                return alert.severity === 'high';
            case 'unread':
                return !alert.isRead;
            default:
                return true;
        }
    });

    const markAsRead = (alertId) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
        ));
    };

    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const markAllAsRead = () => {
        setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    };

    const getTimeRemaining = (endTime) => {
        const end = new Date(endTime);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="text-red-500" size={32} />
                        Weather Alerts
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Stay informed about severe weather conditions and advisories
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Check size={16} />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Alert Categories */}
            <div className="glass-card p-6">
                <div className="flex flex-wrap gap-2">
                    {alertCategories.map(category => (
                        <button
                            key={category.key}
                            onClick={() => setActiveFilter(category.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                activeFilter === category.key
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {category.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                activeFilter === category.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            }`}>
                {category.count}
              </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification Settings */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-blue-500" size={24} />
                    <h3 className="text-xl font-semibold">Notification Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="capitalize font-medium">{key}</span>
                            <button
                                onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !value }))}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                    value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                        value ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Bell size={64} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No Alerts Found
                        </h3>
                        <p className="text-gray-500">
                            {activeFilter === 'all'
                                ? 'There are currently no weather alerts in your area.'
                                : `No ${activeFilter} alerts at this time.`
                            }
                        </p>
                    </div>
                ) : (
                    filteredAlerts.map(alert => {
                        const IconComponent = alertIcons[alert.category] || AlertTriangle;
                        const severityClass = severityColors[alert.severity];
                        const badgeClass = severityBadges[alert.severity];

                        return (
                            <div
                                key={alert.id}
                                className={`glass-card border-l-4 transition-all ${
                                    alert.isRead ? 'opacity-75' : ''
                                } ${severityClass}`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-full ${
                                                alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                                                    alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                        'bg-blue-100 dark:bg-blue-900/20'
                                            }`}>
                                                <IconComponent size={24} className={
                                                    alert.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                                                        alert.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                                            'text-blue-600 dark:text-blue-400'
                                                } />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{alert.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                                                    {alert.isActive && (
                                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                              ACTIVE
                            </span>
                                                    )}
                                                    {!alert.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>

                                                <p className="text-gray-700 dark:text-gray-300 mb-3">
                                                    {alert.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {alert.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {new Date(alert.startTime).toLocaleString()}
                                                    </div>
                                                    {alert.isActive && (
                                                        <div className="text-orange-600 dark:text-orange-400 font-medium">
                                                            {getTimeRemaining(alert.endTime)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {!alert.isRead && (
                                                <button
                                                    onClick={() => markAsRead(alert.id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => dismissAlert(alert.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Dismiss alert"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <div>
                                                <span className="text-gray-500">Started:</span>
                                                <span className="ml-2 font-medium">
                          {new Date(alert.startTime).toLocaleString()}
                        </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Ends:</span>
                                                <span className="ml-2 font-medium">
                          {new Date(alert.endTime).toLocaleString()}
                        </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        alert.isActive ? 'bg-orange-500' : 'bg-gray-400'
                                                    }`}
                                                    style={{
                                                        width: alert.isActive ? '60%' : '100%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AlertsPage;