// src/components/UserSettings.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getUserPreferences, updateUserPreferences } from '../api/weatherApi';

const UserSettings = () => {
    const { unit, setUnit, userId, theme } = useContext(AppContext);
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        temperatureUnit: unit,
        theme: theme,
        timeFormat: '24h',
        forecastDays: 5
    });

    // Load user preferences on component mount
    useEffect(() => {
        const loadUserPreferences = async () => {
            try {
                setLoading(true);
                const response = await getUserPreferences(userId);
                const userPrefs = response.data;

                setPreferences({
                    temperatureUnit: userPrefs.temperatureUnit || 'celsius',
                    theme: userPrefs.theme || 'light',
                    timeFormat: userPrefs.timeFormat || '24h',
                    forecastDays: userPrefs.forecastDays || 5
                });

                // Update context with loaded preferences
                setUnit(userPrefs.temperatureUnit || 'celsius');
            } catch (error) {
                console.error('Failed to load user preferences:', error);
                setStatusMessage('Failed to load preferences from server');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadUserPreferences();
        }
    }, [userId, setUnit]);

    const handleUnitChange = (e) => {
        const newUnit = e.target.value;
        setPreferences(prev => ({ ...prev, temperatureUnit: newUnit }));
        setUnit(newUnit); // Update context immediately for UI responsiveness
    };

    const handleThemeChange = (e) => {
        const newTheme = e.target.value;
        setPreferences(prev => ({ ...prev, theme: newTheme }));
    };

    const handleTimeFormatChange = (e) => {
        const newTimeFormat = e.target.value;
        setPreferences(prev => ({ ...prev, timeFormat: newTimeFormat }));
    };

    const handleForecastDaysChange = (e) => {
        const newForecastDays = parseInt(e.target.value);
        setPreferences(prev => ({ ...prev, forecastDays: newForecastDays }));
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            setStatusMessage('Saving preferences...');

            await updateUserPreferences(userId, preferences);

            setStatusMessage('Settings saved successfully!');
            setTimeout(() => setStatusMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setStatusMessage('Failed to save preferences. Please try again.');
            setTimeout(() => setStatusMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !preferences.temperatureUnit) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-center h-32">
                    <div className="loading-spinner"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading preferences...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">User Preferences</h2>

            <div className="space-y-6">
                {/* Temperature Unit */}
                <div>
                    <label htmlFor="temp-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temperature Unit
                    </label>
                    <select
                        id="temp-unit"
                        value={preferences.temperatureUnit}
                        onChange={handleUnitChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        disabled={loading}
                    >
                        <option value="celsius">Celsius (°C)</option>
                        <option value="fahrenheit">Fahrenheit (°F)</option>
                    </select>
                </div>

                {/* Theme */}
                <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                    </label>
                    <select
                        id="theme"
                        value={preferences.theme}
                        onChange={handleThemeChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        disabled={loading}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                {/* Time Format */}
                <div>
                    <label htmlFor="time-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Format
                    </label>
                    <select
                        id="time-format"
                        value={preferences.timeFormat}
                        onChange={handleTimeFormatChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        disabled={loading}
                    >
                        <option value="12h">12 Hour</option>
                        <option value="24h">24 Hour</option>
                    </select>
                </div>

                {/* Forecast Days */}
                <div>
                    <label htmlFor="forecast-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Forecast Days
                    </label>
                    <select
                        id="forecast-days"
                        value={preferences.forecastDays}
                        onChange={handleForecastDaysChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        disabled={loading}
                    >
                        <option value={3}>3 Days</option>
                        <option value={5}>5 Days</option>
                        <option value={7}>7 Days</option>
                    </select>
                </div>
            </div>

            {/* Save Button and Status */}
            <div className="mt-8 flex items-center justify-between">
                <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save to Database'}
                </button>

                {statusMessage && (
                    <p className={`text-sm font-medium ${
                        statusMessage.includes('success') ? 'text-green-600 dark:text-green-400' :
                            statusMessage.includes('Failed') ? 'text-red-600 dark:text-red-400' :
                                'text-blue-600 dark:text-blue-400'
                    }`}>
                        {statusMessage}
                    </p>
                )}
            </div>

            {/* User ID Display */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    User ID: {userId}
                </p>
            </div>
        </div>
    );
};

export default UserSettings;