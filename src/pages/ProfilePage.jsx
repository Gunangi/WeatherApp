import React, { useState, useEffect } from 'react';
import {
    User,
    Settings,
    MapPin,
    Clock,
    Bell,
    Thermometer,
    Eye,
    Save,
    Edit3,
    Trash2,
    Plus,
    Moon,
    Sun,
    Globe
} from 'lucide-react';

const ProfilePage = () => {
    const [user, setUser] = useState({
        name: 'Weather Explorer',
        email: 'user@example.com',
        location: 'Delhi, India',
        joinDate: '2024-01-15'
    });

    const [preferences, setPreferences] = useState({
        temperatureUnit: 'celsius',
        theme: 'dark',
        notifications: {
            weatherAlerts: true,
            rainAlerts: true,
            temperatureThreshold: true,
            uvIndex: false
        },
        defaultLocation: 'Delhi',
        language: 'english',
        timeFormat: '24h'
    });

    const [favoriteLocations, setFavoriteLocations] = useState([
        { id: 1, name: 'Delhi', country: 'India', isDefault: true },
        { id: 2, name: 'Mumbai', country: 'India', isDefault: false },
        { id: 3, name: 'Bangalore', country: 'India', isDefault: false }
    ]);

    const [isEditing, setIsEditing] = useState(false);
    const [newLocation, setNewLocation] = useState('');

    const handlePreferenceChange = (category, key, value = null) => {
        if (value !== null) {
            setPreferences(prev => ({
                ...prev,
                [category]: {
                    ...prev[category],
                    [key]: value
                }
            }));
        } else {
            setPreferences(prev => ({
                ...prev,
                [category]: key
            }));
        }
    };

    const addFavoriteLocation = () => {
        if (newLocation.trim()) {
            const newFav = {
                id: Date.now(),
                name: newLocation.trim(),
                country: 'Unknown',
                isDefault: false
            };
            setFavoriteLocations(prev => [...prev, newFav]);
            setNewLocation('');
        }
    };

    const removeFavoriteLocation = (id) => {
        setFavoriteLocations(prev => prev.filter(loc => loc.id !== id));
    };

    const setDefaultLocation = (id) => {
        setFavoriteLocations(prev =>
            prev.map(loc => ({
                ...loc,
                isDefault: loc.id === id
            }))
        );
    };

    const saveSettings = () => {
        // Here you would typically save to your backend/MongoDB
        console.log('Saving preferences:', preferences);
        console.log('Saving favorite locations:', favoriteLocations);
        alert('Settings saved successfully!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                <p className="text-blue-200">{user.email}</p>
                                <p className="text-blue-300 text-sm flex items-center mt-1">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {user.location}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weather Preferences */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <Settings className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Weather Preferences</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Temperature Unit */}
                            <div>
                                <label className="block text-white mb-2 font-medium">Temperature Unit</label>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handlePreferenceChange('temperatureUnit', 'celsius')}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                            preferences.temperatureUnit === 'celsius'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                                        }`}
                                    >
                                        <Thermometer className="w-4 h-4" />
                                        <span>Celsius</span>
                                    </button>
                                    <button
                                        onClick={() => handlePreferenceChange('temperatureUnit', 'fahrenheit')}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                            preferences.temperatureUnit === 'fahrenheit'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                                        }`}
                                    >
                                        <Thermometer className="w-4 h-4" />
                                        <span>Fahrenheit</span>
                                    </button>
                                </div>
                            </div>

                            {/* Theme */}
                            <div>
                                <label className="block text-white mb-2 font-medium">Theme</label>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handlePreferenceChange('theme', 'light')}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                            preferences.theme === 'light'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                                        }`}
                                    >
                                        <Sun className="w-4 h-4" />
                                        <span>Light</span>
                                    </button>
                                    <button
                                        onClick={() => handlePreferenceChange('theme', 'dark')}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                            preferences.theme === 'dark'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                                        }`}
                                    >
                                        <Moon className="w-4 h-4" />
                                        <span>Dark</span>
                                    </button>
                                </div>
                            </div>

                            {/* Time Format */}
                            <div>
                                <label className="block text-white mb-2 font-medium">Time Format</label>
                                <select
                                    value={preferences.timeFormat}
                                    onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="12h" className="bg-gray-800">12 Hour</option>
                                    <option value="24h" className="bg-gray-800">24 Hour</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <Bell className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(preferences.notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                  <span className="text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                                    <button
                                        onClick={() => handlePreferenceChange('notifications', key, !value)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            value ? 'bg-blue-500' : 'bg-gray-600'
                                        }`}
                                    >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favorite Locations */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-6 h-6 text-blue-400" />
                                <h2 className="text-xl font-semibold text-white">Favorite Locations</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    placeholder="Add new location..."
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && addFavoriteLocation()}
                                />
                                <button
                                    onClick={addFavoriteLocation}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {favoriteLocations.map((location) => (
                                <div
                                    key={location.id}
                                    className={`p-4 rounded-lg border transition-colors ${
                                        location.isDefault
                                            ? 'bg-blue-500/20 border-blue-400'
                                            : 'bg-white/5 border-white/20 hover:border-white/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-white">{location.name}</h3>
                                        <div className="flex items-center space-x-1">
                                            {!location.isDefault && (
                                                <button
                                                    onClick={() => setDefaultLocation(location.id)}
                                                    className="text-blue-400 hover:text-blue-300 text-xs"
                                                    title="Set as default"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeFavoriteLocation(location.id)}
                                                className="text-red-400 hover:text-red-300"
                                                title="Remove location"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-blue-200 text-sm">{location.country}</p>
                                    {location.isDefault && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      Default
                    </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={saveSettings}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors font-semibold"
                    >
                        <Save className="w-5 h-5" />
                        <span>Save All Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;