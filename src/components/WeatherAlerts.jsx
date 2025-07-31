import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CloudRain, Thermometer, Wind, Zap, Eye, X, Settings, Clock, MapPin } from 'lucide-react';

const WeatherAlerts = ({ currentLocation, userPreferences }) => {
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            type: 'severe',
            category: 'thunderstorm',
            title: 'Severe Thunderstorm Warning',
            description: 'Severe thunderstorms with heavy rain, strong winds up to 80 km/h, and possible hail expected in your area.',
            location: 'New Delhi, India',
            severity: 'high',
            startTime: new Date(Date.now() + 3600000),
            endTime: new Date(Date.now() + 7200000),
            isActive: true,
            icon: '⚡',
            color: 'red'
        },
        {
            id: 2,
            type: 'weather',
            category: 'temperature',
            title: 'Heat Advisory',
            description: 'Temperatures will reach 42°C today. Stay hydrated and avoid prolonged outdoor activities.',
            location: 'New Delhi, India',
            severity: 'medium',
            startTime: new Date(Date.now() - 1800000),
            endTime: new Date(Date.now() + 14400000),
            isActive: true,
            icon: '🌡️',
            color: 'orange'
        },
        {
            id: 3,
            type: 'custom',
            category: 'rain',
            title: 'Rain Alert',
            description: 'Rain is expected in the next 2 hours with 85% probability. You may want to carry an umbrella.',
            location: 'Mumbai, India',
            severity: 'low',
            startTime: new Date(Date.now() + 1800000),
            endTime: new Date(Date.now() + 5400000),
            isActive: true,
            icon: '🌧️',
            color: 'blue'
        },
        {
            id: 4,
            type: 'air_quality',
            category: 'pollution',
            title: 'Poor Air Quality Alert',
            description: 'Air Quality Index is 165 (Unhealthy). Sensitive individuals should avoid outdoor activities.',
            location: 'New Delhi, India',
            severity: 'medium',
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date(Date.now() + 10800000),
            isActive: true,
            icon: '💨',
            color: 'purple'
        },
        {
            id: 5,
            type: 'weather',
            category: 'wind',
            title: 'Strong Wind Advisory',
            description: 'Strong winds of 60-70 km/h expected. Secure loose objects and be cautious while driving.',
            location: 'Chennai, India',
            severity: 'medium',
            startTime: new Date(Date.now() - 7200000),
            endTime: new Date(Date.now() - 3600000),
            isActive: false,
            icon: '💨',
            color: 'gray'
        }
    ]);

    const [activeTab, setActiveTab] = useState('active');
    const [showSettings, setShowSettings] = useState(false);
    const [alertSettings, setAlertSettings] = useState({
        enableNotifications: true,
        severeWeather: true,
        temperature: true,
        rain: true,
        airQuality: true,
        wind: true,
        customAlerts: true,
        soundEnabled: true,
        autoRefresh: true
    });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'border-red-500 bg-red-500/20 text-red-400';
            case 'medium': return 'border-orange-500 bg-orange-500/20 text-orange-400';
            case 'low': return 'border-yellow-500 bg-yellow-500/20 text-yellow-400';
            default: return 'border-gray-500 bg-gray-500/20 text-gray-400';
        }
    };

    const getSeverityIcon = (category) => {
        switch (category) {
            case 'thunderstorm': return <Zap className="w-5 h-5" />;
            case 'temperature': return <Thermometer className="w-5 h-5" />;
            case 'rain': return <CloudRain className="w-5 h-5" />;
            case 'wind': return <Wind className="w-5 h-5" />;
            case 'pollution': return <Eye className="w-5 h-5" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (startTime, endTime) => {
        const duration = (endTime - startTime) / (1000 * 60 * 60);
        if (duration < 1) {
            return `${Math.round(duration * 60)} minutes`;
        }
        return `${Math.round(duration)} hours`;
    };

    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const toggleAlertSetting = (setting) => {
        setAlertSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const activeAlerts = alerts.filter(alert => alert.isActive);
    const pastAlerts = alerts.filter(alert => !alert.isActive);

    const AlertCard = ({ alert, showDismiss = true }) => (
        <div className={`rounded-2xl border-2 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                        {getSeverityIcon(alert.category)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">{alert.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.location}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{alert.icon}</span>
                    {showDismiss && (
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>
            </div>

            <p className="text-gray-200 mb-4 leading-relaxed">{alert.description}</p>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300">
              {formatTime(alert.startTime)} - {formatTime(alert.endTime)}
            </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-gray-300">{formatDuration(alert.startTime, alert.endTime)}</span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                        alert.severity === 'medium' ? 'bg-orange-500/30 text-orange-300' :
                            'bg-yellow-500/30 text-yellow-300'
                }`}>
                    {alert.severity.toUpperCase()}
                </div>
            </div>
        </div>
    );

    const AlertSettings = () => (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Alert Settings</h3>
                <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>

            <div className="space-y-4">
                {Object.entries(alertSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                        <label className="text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <button
                            onClick={() => toggleAlertSetting(key)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                value ? 'bg-blue-500' : 'bg-gray-600'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                    value ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                            />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors">
                    Save Settings
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Weather Alerts</h2>
                        <p className="text-gray-400">Stay informed about weather conditions</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && <AlertSettings />}

            {/* Active Alerts Summary */}
            {activeAlerts.length > 0 && (
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-red-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-red-400 animate-pulse" />
                        <h3 className="font-bold text-white">Active Weather Alerts</h3>
                    </div>
                    <p className="text-gray-200">
                        You have {activeAlerts.length} active weather alert{activeAlerts.length > 1 ? 's' : ''} for your locations.
                    </p>
                    <div className="flex gap-2 mt-3">
                        {activeAlerts.slice(0, 3).map(alert => (
                            <span key={alert.id} className="text-xs px-2 py-1 bg-white/20 rounded-full text-white">
                {alert.category}
              </span>
                        ))}
                        {activeAlerts.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white">
                +{activeAlerts.length - 3} more
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-white/10 rounded-xl p-1">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'active'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    Active Alerts ({activeAlerts.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'history'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    Alert History ({pastAlerts.length})
                </button>
            </div>

            {/* Alert Content */}
            <div className="space-y-4">
                {activeTab === 'active' && (
                    <>
                        {activeAlerts.length > 0 ? (
                            activeAlerts.map(alert => (
                                <AlertCard key={alert.id} alert={alert} showDismiss={true} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
                                    <p className="text-gray-400 mb-6">All clear! No weather alerts for your locations right now.</p>
                                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Monitoring active</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>Last updated: Just now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'history' && (
                    <>
                        {pastAlerts.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-300">Recent Alert History</h3>
                                </div>
                                {pastAlerts.map(alert => (
                                    <AlertCard key={alert.id} alert={alert} showDismiss={false} />
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Alert History</h3>
                                    <p className="text-gray-400">No previous weather alerts to display.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Alert Types Legend */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold text-white mb-4">Alert Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Zap className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Severe Weather</div>
                            <div className="text-xs text-gray-400">Storms, hurricanes, tornadoes</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Thermometer className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Temperature</div>
                            <div className="text-xs text-gray-400">Heat waves, cold snaps</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <CloudRain className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Precipitation</div>
                            <div className="text-xs text-gray-400">Rain, snow, hail</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Wind className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Wind</div>
                            <div className="text-xs text-gray-400">Strong winds, gusts</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Eye className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Air Quality</div>
                            <div className="text-xs text-gray-400">Pollution, visibility</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Bell className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Custom</div>
                            <div className="text-xs text-gray-400">User-defined thresholds</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-400">
                Weather alerts are updated every 15 minutes • Last update: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
};

export default WeatherAlerts;