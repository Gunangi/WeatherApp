import { useState, useEffect } from 'react';

export default function UserSettings({ onSave }) {
    const [preferences, setPreferences] = useState({
        temperatureUnit: 'celsius',
        windSpeedUnit: 'm/s',
        timeFormat: '24h',
        theme: 'system',
        defaultLocation: '',
        notificationsEnabled: false,
        forecastDays: 5
    });

    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        fetchUserPreferences();
    }, []);

    const fetchUserPreferences = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/preferences');

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (error) {
            console.error('Failed to fetch user preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;

        setPreferences({
            ...preferences,
            [name]: inputValue
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveStatus('saving');

        try {
            const response = await fetch('/api/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                setSaveStatus('success');
                if (onSave) onSave(preferences);

                // Reset status after 3 seconds
                setTimeout(() => setSaveStatus(''), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setSaveStatus('error');
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading preferences...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <form onSubmit={handleSubmit}>
                {/* Temperature Unit */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Temperature Unit</label>
                    <div className="flex">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="temperatureUnit"
                                value="celsius"
                                checked={preferences.temperatureUnit === 'celsius'}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            Celsius (°C)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="temperatureUnit"
                                value="fahrenheit"
                                checked={preferences.temperatureUnit === 'fahrenheit'}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            Fahrenheit (°F)
                        </label>
                    </div>
                </div>

                {/* Wind Speed Unit */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Wind Speed Unit</label>
                    <select
                        name="windSpeedUnit"
                        value={preferences.windSpeedUnit}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="m/s">Meters per second (m/s)</option>
                        <option value="km/h">Kilometers per hour (km/h)</option>
                        <option value="mph">Miles per hour (mph)</option>
                    </select>
                </div>

                {/* Time Format */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Time Format</label>
                    <div className="flex">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="timeFormat"
                                value="12h"
                                checked={preferences.timeFormat === '12h'}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            12-hour (AM/PM)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="timeFormat"
                                value="24h"
                                checked={preferences.timeFormat === '24h'}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            24-hour
                        </label>
                    </div>
                </div>

                {/* Theme */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Theme</label>
                    <select
                        name="theme"
                        value={preferences.theme}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                </div>

                {/* Default Location */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Default Location</label>
                    <input
                        type="text"
                        name="defaultLocation"
                        value={preferences.defaultLocation}
                        onChange={handleInputChange}
                        placeholder="Enter city name"
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Notifications */}
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="notificationsEnabled"
                            checked={preferences.notificationsEnabled}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        Enable Weather Notifications
                    </label>
                </div>

                {/* Forecast Days */}
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Forecast Days</label>
                    <select
                        name="forecastDays"
                        value={preferences.forecastDays}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value={5}>5 Days</option>
                        <option value={7}>7 Days</option>
                        <option value={10}>10 Days</option>
                        <option value={14}>14 Days</option>
                    </select>
                </div>

                {/* Save Button */}
                <div className="flex items-center">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                    </button>

                    {/* Status Messages */}
                    {saveStatus === 'success' && (
                        <span className="ml-4 text-green-600">Settings saved successfully!</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="ml-4 text-red-600">Failed to save settings. Please try again.</span>
                    )}
                </div>
            </form>
        </div>
    );
}