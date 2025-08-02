import React, { useState, useContext } from 'react';
import { Settings, Bell, Thermometer, Palette, Globe, Save, X } from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose, userPreferences, onSavePreferences }) => {
    const [settings, setSettings] = useState({
        temperatureUnit: userPreferences?.temperatureUnit || 'celsius',
        windSpeedUnit: userPreferences?.windSpeedUnit || 'ms',
        pressureUnit: userPreferences?.pressureUnit || 'hpa',
        timeFormat: userPreferences?.timeFormat || '12h',
        theme: userPreferences?.theme || 'auto',
        language: userPreferences?.language || 'en',
        notifications: {
            weatherAlerts: userPreferences?.notifications?.weatherAlerts || true,
            rainAlerts: userPreferences?.notifications?.rainAlerts || true,
            temperatureThreshold: userPreferences?.notifications?.temperatureThreshold || true,
            dailyForecast: userPreferences?.notifications?.dailyForecast || false,
            uvAlerts: userPreferences?.notifications?.uvAlerts || true
        },
        thresholds: {
            highTemp: userPreferences?.thresholds?.highTemp || 35,
            lowTemp: userPreferences?.thresholds?.lowTemp || 5,
            rainProbability: userPreferences?.thresholds?.rainProbability || 70,
            uvIndex: userPreferences?.thresholds?.uvIndex || 7
        },
        autoLocation: userPreferences?.autoLocation || true,
        dataRefreshInterval: userPreferences?.dataRefreshInterval || 30
    });

    const handleSettingChange = (category, key, value) => {
        if (category) {
            setSettings(prev => ({
                ...prev,
                [category]: {
                    ...prev[category],
                    [key]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    const handleSave = () => {
        onSavePreferences(settings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Units Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Thermometer className="w-5 h-5 text-orange-400" />
                            <h3 className="text-lg font-semibold text-white">Units</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Temperature</label>
                                <select
                                    value={settings.temperatureUnit}
                                    onChange={(e) => handleSettingChange(null, 'temperatureUnit', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="celsius">Celsius (°C)</option>
                                    <option value="fahrenheit">Fahrenheit (°F)</option>
                                    <option value="kelvin">Kelvin (K)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Wind Speed</label>
                                <select
                                    value={settings.windSpeedUnit}
                                    onChange={(e) => handleSettingChange(null, 'windSpeedUnit', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="ms">m/s</option>
                                    <option value="kmh">km/h</option>
                                    <option value="mph">mph</option>
                                    <option value="knots">knots</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Pressure</label>
                                <select
                                    value={settings.pressureUnit}
                                    onChange={(e) => handleSettingChange(null, 'pressureUnit', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="hpa">hPa</option>
                                    <option value="mmhg">mmHg</option>
                                    <option value="inhg">inHg</option>
                                    <option value="mbar">mbar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Time Format</label>
                                <select
                                    value={settings.timeFormat}
                                    onChange={(e) => handleSettingChange(null, 'timeFormat', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="12h">12 Hour</option>
                                    <option value="24h">24 Hour</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Appearance</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Theme</label>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => handleSettingChange(null, 'theme', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="auto">Auto</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Language</label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => handleSettingChange(null, 'language', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="hi">हिंदी</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Notifications</h3>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(settings.notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <label className="text-sm text-gray-300 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </label>
                                    <button
                                        onClick={() => handleSettingChange('notifications', key, !value)}
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
                    </div>

                    {/* Thresholds Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Alert Thresholds</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">High Temperature (°C)</label>
                                <input
                                    type="number"
                                    value={settings.thresholds.highTemp}
                                    onChange={(e) => handleSettingChange('thresholds', 'highTemp', parseInt(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Low Temperature (°C)</label>
                                <input
                                    type="number"
                                    value={settings.thresholds.lowTemp}
                                    onChange={(e) => handleSettingChange('thresholds', 'lowTemp', parseInt(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Rain Probability (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.thresholds.rainProbability}
                                    onChange={(e) => handleSettingChange('thresholds', 'rainProbability', parseInt(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">UV Index</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={settings.thresholds.uvIndex}
                                    onChange={(e) => handleSettingChange('thresholds', 'uvIndex', parseInt(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Other Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Other Settings</h3>

                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Auto-detect Location</label>
                            <button
                                onClick={() => handleSettingChange(null, 'autoLocation', !settings.autoLocation)}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                    settings.autoLocation ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                        settings.autoLocation ? 'translate-x-6' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Data Refresh Interval (minutes)</label>
                            <select
                                value={settings.dataRefreshInterval}
                                onChange={(e) => handleSettingChange(null, 'dataRefreshInterval', parseInt(e.target.value))}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={120}>2 hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-gray-600/50 text-white hover:bg-gray-600/70 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;